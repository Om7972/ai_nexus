import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader, Play, Terminal } from 'lucide-react';

import CustomNode from '../components/workflow/CustomNode';
import NodePalette from '../components/workflow/NodePalette';
import WorkflowSidebar from '../components/workflow/WorkflowSidebar';
import NodeConfigPanel from '../components/workflow/NodeConfigPanel';
import ExecutionLogsPanel from '../components/workflow/ExecutionLogsPanel';

import {
  fetchWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  duplicateWorkflow,
  executeWorkflow,
  fetchExecution,
  fetchWorkflowVersions,
  clearCurrentWorkflow,
  clearCurrentExecution,
  updateCurrentWorkflowNodes,
  updateCurrentWorkflowEdges
} from '../store/slices/workflowSlice';

// Custom node types
const nodeTypes = {
  userInput: CustomNode,
  promptNode: CustomNode,
  llmNode: CustomNode,
  imageGeneration: CustomNode,
  conditionNode: CustomNode,
  apiRequest: CustomNode,
  outputNode: CustomNode
};

const AgentBuilder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('id');

  const { currentWorkflow, currentExecution, versions, loading, executionLoading } = useSelector(
    (state) => state.workflow
  );

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const nodeIdCounter = useRef(0);

  // Execution polling
  const executionPollingRef = useRef(null);

  // Load workflow if ID exists
  useEffect(() => {
    if (workflowId) {
      dispatch(fetchWorkflow(workflowId));
      dispatch(fetchWorkflowVersions(workflowId));
    } else {
      // Create new workflow
      dispatch(createWorkflow({
        name: 'New Workflow',
        description: 'Build your AI agent workflow',
        nodes: [],
        edges: []
      }));
    }

    return () => {
      dispatch(clearCurrentWorkflow());
      if (executionPollingRef.current) {
        clearInterval(executionPollingRef.current);
      }
    };
  }, [workflowId, dispatch]);

  // Update canvas when workflow loads
  useEffect(() => {
    if (currentWorkflow) {
      setNodes(currentWorkflow.nodes || []);
      setEdges(currentWorkflow.edges || []);
      
      // Update URL if needed
      if (!workflowId && currentWorkflow._id) {
        navigate(`/agent-builder?id=${currentWorkflow._id}`, { replace: true });
      }
    }
  }, [currentWorkflow]);

  // Poll execution status
  useEffect(() => {
    if (currentExecution && ['pending', 'running'].includes(currentExecution.status)) {
      executionPollingRef.current = setInterval(() => {
        dispatch(fetchExecution(currentExecution._id));
      }, 2000);
    } else {
      if (executionPollingRef.current) {
        clearInterval(executionPollingRef.current);
        executionPollingRef.current = null;
      }
    }

    return () => {
      if (executionPollingRef.current) {
        clearInterval(executionPollingRef.current);
      }
    };
  }, [currentExecution?.status, currentExecution?._id, dispatch]);

  // Handle node connections
  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#64748b'
        },
        style: { stroke: '#64748b', strokeWidth: 2 }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Handle node click
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setShowConfigPanel(true);
  }, []);

  // Handle drop to add new node
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('nodeLabel');

      if (!type || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `node_${++nodeIdCounter.current}`,
        type,
        position,
        data: { label }
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Update node configuration
  const handleNodeUpdate = (nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  };

  // Save workflow
  const handleSave = async () => {
    if (!currentWorkflow?._id) return;

    setIsSaving(true);
    try {
      await dispatch(updateWorkflow({
        id: currentWorkflow._id,
        data: {
          nodes,
          edges,
          saveVersion: true,
          changeLog: `Updated at ${new Date().toLocaleString()}`
        }
      })).unwrap();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Rename workflow
  const handleRename = async (newName) => {
    if (!currentWorkflow?._id) return;
    await dispatch(updateWorkflow({
      id: currentWorkflow._id,
      data: { name: newName }
    }));
  };

  // Duplicate workflow
  const handleDuplicate = async () => {
    if (!currentWorkflow?._id) return;
    try {
      const result = await dispatch(duplicateWorkflow(currentWorkflow._id)).unwrap();
      navigate(`/agent-builder?id=${result._id}`);
    } catch (error) {
      console.error('Duplicate failed:', error);
    }
  };

  // Delete workflow
  const handleDelete = async () => {
    if (!currentWorkflow?._id) return;
    
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await dispatch(deleteWorkflow(currentWorkflow._id)).unwrap();
        navigate('/agent-builder');
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  // Execute workflow
  const handleExecute = async () => {
    if (!currentWorkflow?._id) return;

    // Get input from user
    const inputStr = prompt('Enter input data (JSON format):');
    let input = {};

    if (inputStr) {
      try {
        input = JSON.parse(inputStr);
      } catch (e) {
        input = { text: inputStr };
      }
    }

    try {
      const result = await dispatch(executeWorkflow({
        workflowId: currentWorkflow._id,
        input
      })).unwrap();

      setShowLogs(true);
      
      // Start polling for execution updates
      if (result.executionId) {
        dispatch(fetchExecution(result.executionId));
      }
    } catch (error) {
      console.error('Execution failed:', error);
      alert('Failed to execute workflow: ' + (error.message || 'Unknown error'));
    }
  };

  // Restore version
  const handleVersionRestore = async (versionId) => {
    // Implementation would go through the API
    console.log('Restore version:', versionId);
  };

  if (loading && !currentWorkflow) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-white">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Top Bar */}
      <div className="h-16 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 flex items-center px-6 gap-4 relative z-50">
        <button
          onClick={() => navigate('/main-dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Dashboard</span>
        </button>

        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Agent Builder
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {executionLoading && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">Executing...</span>
            </div>
          )}
          
          {currentExecution && (
            <button
              onClick={() => setShowLogs(!showLogs)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showLogs
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <Terminal size={18} />
              <span>Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Node Palette */}
        <NodePalette />

        {/* Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-950"
          >
            <Background
              color="#4338ca"
              gap={20}
              size={1}
              variant="dots"
            />
            <Controls className="bg-gray-800 border border-white/10" />
            <MiniMap
              className="bg-gray-800 border border-white/10"
              nodeColor={(node) => {
                const colors = {
                  userInput: '#3b82f6',
                  promptNode: '#a855f7',
                  llmNode: '#10b981',
                  imageGeneration: '#f97316',
                  conditionNode: '#eab308',
                  apiRequest: '#6366f1',
                  outputNode: '#14b8a6'
                };
                return colors[node.type] || '#6b7280';
              }}
            />
          </ReactFlow>

          {/* Empty State */}
          {nodes.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="text-center max-w-md">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Start Building Your AI Agent
                </h2>
                <p className="text-gray-400">
                  Drag nodes from the left palette to create your workflow
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Workflow Sidebar */}
        <WorkflowSidebar
          workflow={currentWorkflow}
          versions={versions}
          onSave={handleSave}
          onRename={handleRename}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onVersionRestore={handleVersionRestore}
          onExecute={handleExecute}
          isSaving={isSaving}
          showVersions={showVersions}
          setShowVersions={setShowVersions}
        />
      </div>

      {/* Node Config Panel */}
      {showConfigPanel && (
        <NodeConfigPanel
          node={selectedNode}
          onUpdate={handleNodeUpdate}
          onClose={() => {
            setShowConfigPanel(false);
            setSelectedNode(null);
          }}
        />
      )}

      {/* Execution Logs */}
      {showLogs && currentExecution && (
        <ExecutionLogsPanel
          execution={currentExecution}
          onClose={() => setShowLogs(false)}
        />
      )}
    </div>
  );
};

export default AgentBuilder;
