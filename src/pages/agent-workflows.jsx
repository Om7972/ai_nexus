import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import {
  Plus, Search, Folder, FolderPlus, Play, Copy, Trash2, MoreVertical,
  ArrowLeft, History, Save, Undo, Edit, X, ChevronRight, Clock, Settings,
  Activity, ChevronDown, Check, FolderOpen, GitBranch, Terminal, Shield, RefreshCw
} from 'lucide-react';

import CustomNode from '../components/workflow/CustomNode';
import NodePalette from '../components/workflow/NodePalette';
import NodeConfigPanel from '../components/workflow/NodeConfigPanel';
import Header from '../components/ui/Header';
import Sidebar from '../components/ui/Sidebar';

import {
  fetchWorkflows,
  fetchWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  duplicateWorkflow,
  executeWorkflow,
  fetchExecution,
  fetchWorkflowVersions,
  clearCurrentWorkflow,
  clearCurrentExecution
} from '../store/slices/workflowSlice';

import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const API_URL = API_BASE_URL;

const nodeTypes = {
  userInput: CustomNode,
  textGenerator: CustomNode,
  llmNode: CustomNode,
  imageGenerator: CustomNode,
  imageGeneration: CustomNode,
  ocr: CustomNode,
  summarizer: CustomNode,
  translator: CustomNode,
  dataAnalyzer: CustomNode,
  emailSender: CustomNode,
  webSearch: CustomNode,
  delay: CustomNode,
  conditionNode: CustomNode,
  exportNode: CustomNode,
  outputNode: CustomNode
};

const AgentWorkflows = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeWorkflowId = searchParams.get('id');

  const { workflows, currentWorkflow, currentExecution, versions, loading, executionLoading } = useSelector(
    (state) => state.workflow
  );

  // Layout states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [folders, setFolders] = useState(['All', 'Data Analytics', 'Marketing', 'Customer Support', 'Utility']);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showMenu, setShowMenu] = useState(null);

  // Editor specific states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [versionNote, setVersionNote] = useState('');
  const [testInput, setTestInput] = useState('{"message": "Hello World"}');
  const [executionLogs, setExecutionLogs] = useState([]);
  
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const draftTimerRef = useRef(null);
  const pollTimerRef = useRef(null);

  // Initial load of workflows list
  useEffect(() => {
    dispatch(fetchWorkflows({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Load editor if id parameter is set
  useEffect(() => {
    if (activeWorkflowId) {
      dispatch(fetchWorkflow(activeWorkflowId));
      dispatch(fetchWorkflowVersions(activeWorkflowId));
      setIsEditorOpen(true);
    } else {
      setIsEditorOpen(false);
      dispatch(clearCurrentWorkflow());
    }
    return () => {
      if (draftTimerRef.current) clearInterval(draftTimerRef.current);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [activeWorkflowId, dispatch]);

  // Sync canvas with fetched workflow data
  useEffect(() => {
    if (currentWorkflow && activeWorkflowId) {
      setNodes(currentWorkflow.nodes || []);
      setEdges(currentWorkflow.edges || []);
    }
  }, [currentWorkflow, activeWorkflowId, setNodes, setEdges]);

  // Auto-Save Drafts Mechanism
  useEffect(() => {
    if (isEditorOpen && currentWorkflow) {
      if (draftTimerRef.current) clearInterval(draftTimerRef.current);
      
      // Auto-save every 8 seconds if there are changes
      draftTimerRef.current = setInterval(() => {
        handleSaveDraft();
      }, 8000);
    }
    return () => {
      if (draftTimerRef.current) clearInterval(draftTimerRef.current);
    };
  }, [nodes, edges, isEditorOpen, currentWorkflow]);

  // Handle Drag & Drop Node
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('nodeLabel');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: {
          label: label || `${type} Node`,
          description: `Configure ${type}`,
          retries: 3
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // Connect Edges
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
    }, eds)),
    [setEdges]
  );

  // Node Selection Handler
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setShowConfigPanel(true);
  }, []);

  const updateNodeData = (nodeId, updatedData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...updatedData } };
        }
        return node;
      })
    );
  };

  // Create workflow handler
  const handleCreateWorkflow = async () => {
    const defaultNodes = [
      {
        id: 'node_1',
        type: 'userInput',
        position: { x: 250, y: 150 },
        data: { label: 'User Input', description: 'Entrypoint parameter' }
      },
      {
        id: 'node_2',
        type: 'textGenerator',
        position: { x: 250, y: 300 },
        data: { label: 'Text Generator', prompt: 'Summarize {{input}}' }
      },
      {
        id: 'node_3',
        type: 'exportNode',
        position: { x: 250, y: 450 },
        data: { label: 'Save Report', format: 'json' }
      }
    ];

    const defaultEdges = [
      { id: 'edge_1', source: 'node_1', target: 'node_2', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
      { id: 'edge_2', source: 'node_2', target: 'node_3', animated: true, markerEnd: { type: MarkerType.ArrowClosed } }
    ];

    const result = await dispatch(createWorkflow({
      name: `New Workflow ${workflows.length + 1}`,
      description: 'Drag and drop builder workflow',
      nodes: defaultNodes,
      edges: defaultEdges,
      tags: [selectedFolder === 'All' ? 'Utility' : selectedFolder]
    })).unwrap();

    setSearchParams({ id: result._id });
  };

  const handleSaveDraft = async () => {
    if (!currentWorkflow) return;
    try {
      await dispatch(updateWorkflow({
        id: currentWorkflow._id,
        data: {
          nodes,
          edges,
          status: 'draft'
        }
      }));
    } catch (e) {
      console.error('Draft autosave failed', e);
    }
  };

  const handlePublishVersion = async () => {
    if (!currentWorkflow || !versionNote) return;
    setIsSaving(true);
    try {
      await dispatch(updateWorkflow({
        id: currentWorkflow._id,
        data: {
          nodes,
          edges,
          status: 'active',
          saveVersion: true,
          changeLog: versionNote
        }
      }));
      setVersionNote('');
      setShowVersions(false);
      dispatch(fetchWorkflowVersions(currentWorkflow._id));
    } catch (e) {
      console.error('Version capture failed', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreVersion = async (versionId) => {
    if (!window.confirm('Are you sure you want to restore this version? Your current changes will be saved as a new draft.')) return;
    try {
      const response = await axios.post(
        `${API_URL}/workflows/${currentWorkflow._id}/versions/${versionId}/restore`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      dispatch(fetchWorkflow(currentWorkflow._id));
      dispatch(fetchWorkflowVersions(currentWorkflow._id));
    } catch (e) {
      console.error('Failed to restore version', e);
    }
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    try {
      const result = await dispatch(duplicateWorkflow(id)).unwrap();
      dispatch(fetchWorkflows({ page: 1, limit: 100 }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      await dispatch(deleteWorkflow(id));
      dispatch(fetchWorkflows({ page: 1, limit: 100 }));
      if (activeWorkflowId === id) {
        setSearchParams({});
      }
    }
  };

  // Run/Execute Workflow
  const handleExecuteWorkflow = async () => {
    if (!currentWorkflow) return;
    setShowLogs(true);
    setExecutionLogs([{ timestamp: new Date(), level: 'info', message: 'Triggering execution engine...' }]);
    
    try {
      let parseInput = {};
      try {
        parseInput = JSON.parse(testInput);
      } catch (err) {
        parseInput = { input: testInput };
      }

      const res = await dispatch(executeWorkflow({
        workflowId: currentWorkflow._id,
        input: parseInput
      })).unwrap();

      // Poll logs
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = setInterval(async () => {
        const fetchRes = await axios.get(
          `${API_URL}/workflows/executions/${res.executionId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        const data = fetchRes.data.data;
        if (data.executionLogs) {
          setExecutionLogs(data.executionLogs);
        }
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(pollTimerRef.current);
        }
      }, 1500);

    } catch (err) {
      setExecutionLogs(prev => [...prev, { timestamp: new Date(), level: 'error', message: err.message || 'Execution initiation failed' }]);
    }
  };

  // Folders organization
  const addFolder = () => {
    if (newFolderName.trim() && !folders.includes(newFolderName)) {
      setFolders([...folders, newFolderName.trim()]);
      setNewFolderName('');
      setShowFolderModal(false);
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (workflow.description && workflow.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFolder = selectedFolder === 'All' || workflow.tags.includes(selectedFolder);
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Side Bar */}
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Dashboard Workspace */}
        <main className={`flex-1 flex overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <AnimatePresence mode="wait">
            {!isEditorOpen ? (
              // ── DASHBOARD HUB VIEW ──
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex-1 flex overflow-hidden bg-gray-950 p-6 md:p-8"
              >
                {/* Folders Navigation Bar */}
                <div className="w-64 border-r border-white/5 pr-6 hidden md:flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Folders</h3>
                    <button
                      onClick={() => setShowFolderModal(true)}
                      className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors"
                    >
                      <FolderPlus size={18} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1">
                    {folders.map(folder => (
                      <button
                        key={folder}
                        onClick={() => setSelectedFolder(folder)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          selectedFolder === folder
                            ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400 font-medium'
                            : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        {selectedFolder === folder ? <FolderOpen size={16} /> : <Folder size={16} />}
                        <span>{folder}</span>
                        <span className="ml-auto text-xs opacity-60">
                          {workflowId => workflows.filter(w => folder === 'All' || w.tags.includes(folder)).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Listing of Workflows */}
                <div className="flex-1 flex flex-col overflow-hidden px-0 md:px-6">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                        Workflow Studio
                      </h1>
                      <p className="text-sm text-gray-400 mt-1">Design and automate workflows using drag and drop nodes</p>
                    </div>

                    <button
                      onClick={handleCreateWorkflow}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20"
                    >
                      <Plus size={18} />
                      Create Workflow
                    </button>
                  </div>

                  {/* Filters / Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search workflows by title or parameters..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-white/5 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Grid layout */}
                  <div className="flex-1 overflow-y-auto pr-1">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <RefreshCw className="animate-spin text-blue-500" size={32} />
                        <span className="text-sm text-gray-400">Loading workflows list...</span>
                      </div>
                    ) : filteredWorkflows.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-80 border border-white/5 border-dashed rounded-xl p-8 text-center bg-gray-900/10">
                        <span className="text-4xl">🤖</span>
                        <h3 className="text-lg font-semibold mt-4">No Workflows Available</h3>
                        <p className="text-sm text-gray-400 mt-1 max-w-sm">
                          Create a new workflow canvas or change search keyword to find matching templates.
                        </p>
                        <button
                          onClick={handleCreateWorkflow}
                          className="mt-6 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors border border-white/10"
                        >
                          Create New
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredWorkflows.map((workflow) => (
                          <div
                            key={workflow._id}
                            onClick={() => setSearchParams({ id: workflow._id })}
                            className="bg-gray-900/50 border border-white/5 rounded-xl p-5 hover:border-white/15 cursor-pointer transition-all flex flex-col justify-between hover:scale-[1.01]"
                          >
                            <div>
                              <div className="flex items-start justify-between">
                                <div className="max-w-[80%]">
                                  <h3 className="font-bold text-white text-base truncate group-hover:text-blue-400 transition-colors">
                                    {workflow.name}
                                  </h3>
                                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                    {workflow.description || 'No description provided'}
                                  </p>
                                </div>
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowMenu(showMenu === workflow._id ? null : workflow._id);
                                    }}
                                    className="p-1 hover:bg-white/5 rounded text-gray-400"
                                  >
                                    <MoreVertical size={16} />
                                  </button>

                                  {showMenu === workflow._id && (
                                    <div className="absolute right-0 mt-1 w-36 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden text-xs">
                                      <button
                                        onClick={(e) => handleDuplicate(workflow._id, e)}
                                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-left"
                                      >
                                        <Copy size={13} />
                                        Duplicate
                                      </button>
                                      <button
                                        onClick={(e) => handleDelete(workflow._id, e)}
                                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-left text-red-400"
                                      >
                                        <Trash2 size={13} />
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1.5 mt-4">
                                {workflow.tags.map(tag => (
                                  <span key={tag} className="px-2 py-0.5 bg-gray-800 rounded-md text-[10px] text-gray-300 font-medium">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-xs text-gray-400">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <GitBranch size={13} />
                                  {workflow.nodes?.length || 0} nodes
                                </span>
                                <span className="flex items-center gap-1">
                                  <Activity size={13} />
                                  {workflow.executionCount || 0} runs
                                </span>
                              </div>

                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                workflow.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                              }`}>
                                {workflow.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              // ── DRAG & DROP CANVAS VIEW ──
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex overflow-hidden relative"
              >
                {/* Nodes Toolbar on the Left */}
                <NodePalette />

                {/* React Flow Canvas Wrapper */}
                <div ref={reactFlowWrapper} className="flex-1 h-full bg-gray-900">
                  {currentWorkflow ? (
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onConnect={onConnect}
                      onInit={setReactFlowInstance}
                      onDrop={onDrop}
                      onDragOver={onDragOver}
                      onNodeClick={onNodeClick}
                      nodeTypes={nodeTypes}
                      fitView
                    >
                      <Background color="#555" gap={16} size={1} />
                      <Controls className="!bg-gray-800 !border-white/10 !fill-white" />
                      <MiniMap
                        nodeStrokeColor={(n) => '#555'}
                        nodeColor={(n) => '#222'}
                        maskColor="rgba(0, 0, 0, 0.4)"
                        className="!bg-gray-900 !border-white/10"
                      />
                    </ReactFlow>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <RefreshCw className="animate-spin text-blue-500" size={32} />
                    </div>
                  )}
                </div>

                {/* Canvas Floating Top Actions Toolbar */}
                <div className="absolute top-4 left-72 right-4 flex items-center justify-between z-10 pointer-events-none">
                  <div className="flex items-center gap-2 pointer-events-auto bg-gray-950/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded-lg shadow-xl">
                    <button
                      onClick={() => setSearchParams({})}
                      className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <span className="text-xs text-gray-400">/</span>
                    <span className="text-sm font-semibold max-w-[200px] truncate">
                      {currentWorkflow?.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pointer-events-auto">
                    <button
                      onClick={() => setShowVersions(!showVersions)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-950/80 hover:bg-gray-900 backdrop-blur border border-white/10 rounded-lg text-xs font-medium text-gray-300"
                    >
                      <History size={14} />
                      Versions ({versions.length})
                    </button>

                    <button
                      onClick={handleSaveDraft}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-950/80 hover:bg-gray-900 backdrop-blur border border-white/10 rounded-lg text-xs font-medium text-gray-300"
                    >
                      <Save size={14} />
                      Save Draft
                    </button>

                    <button
                      onClick={() => setShowVersions(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold"
                    >
                      <Check size={14} />
                      Publish Version
                    </button>

                    <button
                      onClick={handleExecuteWorkflow}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-semibold"
                    >
                      <Play size={14} />
                      Run Workflow
                    </button>
                  </div>
                </div>

                {/* Node Config Drawer Panel */}
                {showConfigPanel && selectedNode && (
                  <NodeConfigPanel
                    node={selectedNode}
                    onClose={() => setShowConfigPanel(false)}
                    onUpdate={updateNodeData}
                  />
                )}

                {/* Version History Drawer Panel */}
                {showVersions && (
                  <div className="absolute right-0 top-0 h-full w-80 bg-gray-950/95 backdrop-blur-md border-l border-white/10 shadow-2xl z-20 p-6 overflow-y-auto flex flex-col">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                      <h3 className="font-bold text-sm text-gray-300">Version History</h3>
                      <button onClick={() => setShowVersions(false)} className="text-gray-400 hover:text-white">
                        <X size={16} />
                      </button>
                    </div>

                    <div className="mb-6 bg-white/5 p-3 rounded-lg border border-white/5">
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Publish New Version</label>
                      <input
                        type="text"
                        value={versionNote}
                        onChange={(e) => setVersionNote(e.target.value)}
                        placeholder="Version description..."
                        className="w-full bg-gray-900 border border-white/5 rounded px-2.5 py-1.5 text-xs focus:outline-none mb-3"
                      />
                      <button
                        onClick={handlePublishVersion}
                        disabled={isSaving || !versionNote.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded py-1.5 text-xs font-bold transition-all disabled:opacity-50"
                      >
                        Publish v{currentWorkflow?.version ? currentWorkflow.version + 1 : 2}
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3">
                      {versions.map(v => (
                        <div key={v._id} className="p-3 bg-gray-900 border border-white/5 rounded-lg flex flex-col gap-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-blue-400">Version {v.version}</span>
                            <span className="text-[10px] text-gray-500">{new Date(v.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[11px] text-gray-300">{v.changeLog || 'No description'}</p>
                          <button
                            onClick={() => handleRestoreVersion(v._id)}
                            className="text-left text-[10px] text-gray-400 hover:text-white flex items-center gap-1.5 mt-1 border-t border-white/5 pt-2"
                          >
                            <Undo size={11} />
                            Restore Version
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Execution Logs Drawer Panel */}
                {showLogs && (
                  <div className="absolute left-72 bottom-4 right-4 bg-gray-950 border border-white/10 rounded-xl shadow-2xl z-20 flex flex-col max-h-[300px]">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-gray-900 rounded-t-xl">
                      <span className="text-xs font-semibold flex items-center gap-1.5 text-gray-300">
                        <Terminal size={14} className="text-blue-500" />
                        Execution Console
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleExecuteWorkflow}
                          className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1"
                        >
                          <RefreshCw size={11} className={executionLoading ? 'animate-spin' : ''} />
                          Rerun
                        </button>
                        <button onClick={() => setShowLogs(false)} className="text-gray-400 hover:text-white">
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 overflow-y-auto font-mono text-[11px] text-gray-300 space-y-1.5 max-h-[160px] bg-gray-950/80">
                      {executionLogs.map((log, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                          <span className={`font-semibold ${
                            log.level === 'error' ? 'text-red-400' :
                            log.level === 'success' ? 'text-green-400' :
                            log.level === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                          }`}>{log.nodeName || 'System'}:</span>
                          <span>{log.message}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-gray-900/50 border-t border-white/5 flex gap-3 items-center">
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Test Input JSON</label>
                      <input
                        type="text"
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        className="flex-1 bg-gray-950 border border-white/5 rounded px-2.5 py-1.5 text-[11px] font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Folders Creation Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-sm shadow-2xl"
          >
            <h3 className="text-lg font-bold text-white mb-2">Create New Folder</h3>
            <p className="text-xs text-gray-400 mb-4">Organize your workflows in custom tags or folders.</p>

            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. Sales Pipeline"
              className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 mb-6"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowFolderModal(false)}
                className="px-4 py-2 hover:bg-white/5 rounded-lg text-xs font-semibold text-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addFolder}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Create Folder
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AgentWorkflows;
