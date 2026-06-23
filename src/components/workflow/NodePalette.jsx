import React from 'react';
import { motion } from 'framer-motion';
import {
  User, MessageSquare, Brain, Image, Eye,
  Languages, BarChart2, Mail, Search, Clock,
  GitBranch, Download
} from 'lucide-react';

const nodeTypes = [
  {
    type: 'userInput',
    label: 'User Input',
    description: 'Entrypoint input data',
    icon: User,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    type: 'textGenerator',
    label: 'Text Generator',
    description: 'Generate copy with AI',
    icon: MessageSquare,
    color: 'from-purple-500 to-indigo-500'
  },
  {
    type: 'imageGenerator',
    label: 'Image Generator',
    description: 'Synthesize images with AI',
    icon: Image,
    color: 'from-orange-500 to-pink-500'
  },
  {
    type: 'ocr',
    label: 'OCR Extractor',
    description: 'Extract text from images',
    icon: Eye,
    color: 'from-teal-500 to-cyan-500'
  },
  {
    type: 'summarizer',
    label: 'Summarizer',
    description: 'Condense long records',
    icon: Brain,
    color: 'from-emerald-500 to-green-500'
  },
  {
    type: 'translator',
    label: 'Translator',
    description: 'Translate documents',
    icon: Languages,
    color: 'from-sky-500 to-indigo-500'
  },
  {
    type: 'dataAnalyzer',
    label: 'Data Analyzer',
    description: 'Synthesize table insights',
    icon: BarChart2,
    color: 'from-purple-600 to-violet-500'
  },
  {
    type: 'emailSender',
    label: 'Email Sender',
    description: 'Send custom alerts',
    icon: Mail,
    color: 'from-blue-600 to-indigo-500'
  },
  {
    type: 'webSearch',
    label: 'Web Search',
    description: 'Retrieve live web details',
    icon: Search,
    color: 'from-cyan-600 to-teal-500'
  },
  {
    type: 'delay',
    label: 'Delay Action',
    description: 'Pause flow execution',
    icon: Clock,
    color: 'from-gray-600 to-slate-500'
  },
  {
    type: 'conditionNode',
    label: 'Condition Node',
    description: 'Branch based on logic',
    icon: GitBranch,
    color: 'from-yellow-500 to-amber-500'
  },
  {
    type: 'exportNode',
    label: 'Export Node',
    description: 'Save output file',
    icon: Download,
    color: 'from-rose-500 to-red-500'
  }
];

const NodePalette = () => {
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('nodeLabel', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-gray-900/95 backdrop-blur-xl border-r border-white/10 p-4 overflow-y-auto h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white mb-1">Node Catalog</h2>
        <p className="text-xs text-gray-400">Drag items to the canvas</p>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto pr-1">
        {nodeTypes.map((node, index) => {
          const Icon = node.icon;
          return (
            <motion.div
              key={node.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              draggable
              onDragStart={(e) => onDragStart(e, node.type, node.label)}
              className={`
                p-2.5 rounded-lg cursor-move select-none
                bg-gradient-to-br ${node.color}
                hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-200
                shadow-md hover:shadow-lg
              `}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-md backdrop-blur-sm">
                  <Icon size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-white truncate">{node.label}</div>
                  <div className="text-[10px] text-white/80 truncate">{node.description}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h3 className="text-xs font-semibold text-blue-400 mb-1">💡 Tips</h3>
        <ul className="text-[10px] text-gray-400 space-y-0.5">
          <li>• Connect nodes in sequential order</li>
          <li>• Click a node to view config panel</li>
          <li>• Conditional node splits to true/false</li>
        </ul>
      </div>
    </div>
  );
};

export default NodePalette;
