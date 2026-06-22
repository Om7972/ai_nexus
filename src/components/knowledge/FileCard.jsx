import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  File, FileText, FileSpreadsheet, MoreVertical,
  Edit2, Trash2, Download, RefreshCw, Eye,
  Loader, CheckCircle, XCircle, Clock
} from 'lucide-react';

const fileIcons = {
  pdf: File,
  docx: FileText,
  txt: FileText,
  csv: FileSpreadsheet
};

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  processing: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400'
};

const statusIcons = {
  pending: Clock,
  processing: Loader,
  completed: CheckCircle,
  failed: XCircle
};

const FileCard = ({ file, onView, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = fileIcons[file.fileType] || File;
  const StatusIcon = statusIcons[file.processingStatus];

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
      onClick={() => onView && onView(file)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Icon size={24} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate mb-1">
              {file.originalName}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{formatSize(file.fileSize)}</span>
              <span>•</span>
              <span>{file.collection}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <MoreVertical size={18} />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-lg shadow-xl z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(file);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition-colors text-left"
                >
                  <Eye size={16} />
                  View Details
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(file);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition-colors text-left"
                >
                  <Edit2 size={16} />
                  Rename
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(file);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition-colors text-left text-red-400"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className={`
          flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
          ${statusColors[file.processingStatus]}
        `}>
          <StatusIcon size={14} className={file.processingStatus === 'processing' ? 'animate-spin' : ''} />
          <span className="capitalize">{file.processingStatus}</span>
        </div>

        {file.chunkCount > 0 && (
          <span className="text-xs text-gray-500">
            {file.chunkCount} chunks
          </span>
        )}
      </div>

      {/* Metadata */}
      {file.metadata && (
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-400">
          {file.metadata.pageCount && (
            <div>
              <span className="text-gray-500">Pages:</span> {file.metadata.pageCount}
            </div>
          )}
          {file.metadata.wordCount && (
            <div>
              <span className="text-gray-500">Words:</span> {file.metadata.wordCount.toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {file.tags && file.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {file.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {file.tags.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs rounded-full">
              +{file.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-xs text-gray-500">
          {formatDate(file.createdAt)}
        </span>
        {file.totalTokens > 0 && (
          <span className="text-xs text-gray-500">
            {file.totalTokens.toLocaleString()} tokens
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default FileCard;
