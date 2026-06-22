import React from 'react';
import { motion } from 'framer-motion';
import {
  User, MessageSquare, Brain, Image, GitBranch,
  Send, CheckCircle
} from 'lucide-react';

const nodeTypes = [
  {
    type: 'userInput',
    label: 'User Input',
    description: 'Receives input data',
    icon: User,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    type: 'promptNode',
    label: 'Prompt Node',
    description: 'Create dynamic prompts',
    icon: MessageSquare,
    color: 'from-purple-500 to-pink-500'
  },
  {
    type: 'llmNode',
    label: 'LLM Node',
    description: 'Call AI language models',
    icon: Brain,
    color: 'from-green-500 to-emerald-500'
  },
  {
    type: 'imageGeneration',
    label: 'Image Gen',
    description: 'Generate AI images',
    icon: Image,
    color: 'from-orange-500 to-red-500'
  },
  {
    type: 'conditionNode',
    label: 'Condition',
    description: 'Branch workflow logic',
    icon: GitBranch,
    color: 'from-yellow-500 to-amber-500'
  },
  {
    type: 'apiRequest',
    label: 'API Request',
    description: 'Make HTTP requests',
    icon: Send,
    color: 'from-indigo-500 to-blue-500'
  },
  {
    type: 'outputNode',
    label: 'Output',
    description: 'Final workflow output',
    icon: CheckCircle,
    color: 'from-teal-500 to-green-500'
  }
];

const NodePalette = () => {
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('nodeLabel', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-gray-900/95 backdrop-blur-xl border-r border-white/10 p-4 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white mb-1">Node Palette</h2>
        <p className="text-xs text-gray-400">Drag nodes to canvas</p>
      </div>

      <div className="space-y-2">
        {nodeTypes.map((node, index) => {
          const Icon = node.icon;
          return (
            <motion.div
              key={node.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              draggable
              onDragStart={(e) => onDragStart(e, node.type, node.label)}
              className={`
                p-3 rounded-lg cursor-move select-none
                bg-gradient-to-br ${node.color}
                hover:scale-105 active:scale-95
                transition-all duration-200
                shadow-lg hover:shadow-xl
              `}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Icon size={18} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-white">{node.label}</div>
                  <div className="text-xs text-white/80">{node.description}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h3 className="text-xs font-semibold text-blue-400 mb-2">💡 Tips</h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Drag nodes to the canvas</li>
          <li>• Click nodes to configure</li>
          <li>• Connect nodes to create flow</li>
          <li>• Start with User Input</li>
          <li>• End with Output node</li>
        </ul>
      </div>
    </div>
  );
};

export default NodePalette;
