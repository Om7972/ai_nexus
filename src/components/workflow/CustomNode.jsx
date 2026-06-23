import React from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import {
  User, MessageSquare, Brain, Image, Eye,
  Languages, BarChart2, Mail, Search, Clock,
  GitBranch, Download, Play, Zap
} from 'lucide-react';

const nodeIcons = {
  userInput: User,
  textGenerator: MessageSquare,
  llmNode: Brain,
  imageGenerator: Image,
  imageGeneration: Image,
  ocr: Eye,
  summarizer: Play,
  translator: Languages,
  dataAnalyzer: BarChart2,
  emailSender: Mail,
  webSearch: Search,
  delay: Clock,
  conditionNode: GitBranch,
  exportNode: Download,
  outputNode: Download
};

const nodeColors = {
  userInput: 'from-blue-500 to-cyan-500',
  textGenerator: 'from-purple-500 to-indigo-500',
  llmNode: 'from-indigo-500 to-purple-600',
  imageGenerator: 'from-orange-500 to-pink-500',
  imageGeneration: 'from-orange-500 to-pink-500',
  ocr: 'from-teal-500 to-cyan-500',
  summarizer: 'from-emerald-500 to-green-500',
  translator: 'from-sky-500 to-indigo-500',
  dataAnalyzer: 'from-purple-600 to-violet-500',
  emailSender: 'from-blue-600 to-indigo-500',
  webSearch: 'from-cyan-600 to-teal-500',
  delay: 'from-gray-600 to-slate-500',
  conditionNode: 'from-yellow-500 to-amber-500',
  exportNode: 'from-rose-500 to-red-500',
  outputNode: 'from-rose-500 to-red-500'
};

export const CustomNode = ({ data, type, selected }) => {
  const Icon = nodeIcons[type] || Zap;
  const colorClass = nodeColors[type] || 'from-gray-500 to-gray-600';

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`
        relative px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm border-2
        ${selected ? 'border-blue-400 shadow-blue-500/50' : 'border-white/20'}
        bg-gradient-to-br ${colorClass} text-white
        min-w-[200px] transition-all duration-200
      `}
    >
      {/* Input Handle */}
      {type !== 'userInput' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-white !border-2 !border-gray-300"
        />
      )}

      {/* Node Content */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">{data.label || type}</div>
          {data.description && (
            <div className="text-xs opacity-80 mt-1">{data.description}</div>
          )}
        </div>
      </div>

      {/* Status Indicator */}
      {data.status && (
        <div className={`
          absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white
          ${data.status === 'completed' ? 'bg-green-500' : ''}
          ${data.status === 'running' ? 'bg-yellow-500 animate-pulse' : ''}
          ${data.status === 'failed' ? 'bg-red-500' : ''}
        `} />
      )}

      {/* Output Handles */}
      {type === 'conditionNode' ? (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            style={{ left: '30%' }}
            className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            style={{ left: '70%' }}
            className="!w-3 !h-3 !bg-red-500 !border-2 !border-white"
          />
        </>
      ) : (type !== 'exportNode' && type !== 'outputNode') ? (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-white !border-2 !border-gray-300"
        />
      ) : null}
    </motion.div>
  );
};

export default CustomNode;
