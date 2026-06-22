import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save, Copy, Trash2, History, Edit3, Play,
  Clock, CheckCircle, XCircle, ChevronDown
} from 'lucide-react';

const WorkflowSidebar = ({
  workflow,
  versions,
  onSave,
  onRename,
  onDuplicate,
  onDelete,
  onVersionRestore,
  onExecute,
  isSaving,
  showVersions,
  setShowVersions
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(workflow?.name || '');

  const handleRename = () => {
    if (newName.trim() && newName !== workflow.name) {
      onRename(newName);
    }
    setIsRenaming(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-80 bg-gray-900/95 backdrop-blur-xl border-l border-white/10 p-6 overflow-y-auto">
      {/* Workflow Info */}
      <div className="mb-6">
        {isRenaming ? (
          <div className="space-y-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleRename}
                className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsRenaming(false);
                  setNewName(workflow.name);
                }}
                className="flex-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h2 className="text-xl font-bold text-white flex-1 break-words">
                {workflow?.name || 'Untitled Workflow'}
              </h2>
              <button
                onClick={() => setIsRenaming(true)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                title="Rename workflow"
              >
                <Edit3 size={16} />
              </button>
            </div>
            {workflow?.description && (
              <p className="text-sm text-gray-400">{workflow.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span>v{workflow?.version || 1}</span>
              <span>•</span>
              <span>{workflow?.nodes?.length || 0} nodes</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2 mb-6">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save Workflow'}
        </button>

        <button
          onClick={onExecute}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
        >
          <Play size={18} />
          Execute Workflow
        </button>

        <button
          onClick={onDuplicate}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
        >
          <Copy size={18} />
          Duplicate
        </button>

        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
        >
          <Trash2 size={18} />
          Delete Workflow
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white/5 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold mb-3 text-gray-300">Statistics</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Executions</span>
            <span className="font-medium">{workflow?.executionCount || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Last Run</span>
            <span className="font-medium">
              {workflow?.lastExecutedAt ? formatDate(workflow.lastExecutedAt) : 'Never'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status</span>
            <span className={`
              font-medium capitalize
              ${workflow?.status === 'active' ? 'text-green-400' : ''}
              ${workflow?.status === 'draft' ? 'text-yellow-400' : ''}
              ${workflow?.status === 'archived' ? 'text-gray-400' : ''}
            `}>
              {workflow?.status || 'draft'}
            </span>
          </div>
        </div>
      </div>

      {/* Version History */}
      <div className="bg-white/5 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowVersions(!showVersions)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <History size={18} />
            <h3 className="text-sm font-semibold text-gray-300">Version History</h3>
          </div>
          <ChevronDown
            size={18}
            className={`transition-transform ${showVersions ? 'rotate-180' : ''}`}
          />
        </button>

        {showVersions && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
              {versions && versions.length > 0 ? (
                versions.map((version) => (
                  <div
                    key={version._id}
                    className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold">v{version.version}</span>
                          {version.version === workflow?.version && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{version.changeLog}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <Clock size={10} className="inline mr-1" />
                          {formatDate(version.createdAt)}
                        </p>
                      </div>
                      {version.version !== workflow?.version && (
                        <button
                          onClick={() => onVersionRestore(version._id)}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No version history</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WorkflowSidebar;
