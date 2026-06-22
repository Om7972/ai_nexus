import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, CheckCircle, AlertTriangle, XCircle, Terminal } from 'lucide-react';

const levelIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle
};

const levelColors = {
  info: 'text-blue-400 bg-blue-500/10',
  success: 'text-green-400 bg-green-500/10',
  warning: 'text-yellow-400 bg-yellow-500/10',
  error: 'text-red-400 bg-red-500/10'
};

const ExecutionLogsPanel = ({ execution, onClose }) => {
  const logsEndRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [execution?.executionLogs]);

  if (!execution) return null;

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-gray-400 bg-gray-500/10';
      case 'running': return 'text-blue-400 bg-blue-500/10 animate-pulse';
      case 'completed': return 'text-green-400 bg-green-500/10';
      case 'failed': return 'text-red-400 bg-red-500/10';
      case 'cancelled': return 'text-orange-400 bg-orange-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 400, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-80 h-96 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 shadow-2xl z-40"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Terminal size={20} className="text-blue-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Execution Logs</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(execution.status)}`}>
                    {execution.status}
                  </span>
                  {execution.duration && (
                    <span className="text-xs text-gray-400">
                      Duration: {formatDuration(execution.duration)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Logs Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm">
            {execution.executionLogs && execution.executionLogs.length > 0 ? (
              <>
                {execution.executionLogs.map((log, index) => {
                  const Icon = levelIcons[log.level] || Info;
                  const colorClass = levelColors[log.level] || levelColors.info;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className={`p-1.5 rounded-lg ${colorClass} flex-shrink-0`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">{formatTime(log.timestamp)}</span>
                          {log.nodeName && (
                            <>
                              <span className="text-gray-600">•</span>
                              <span className="text-xs text-gray-400">{log.nodeName}</span>
                            </>
                          )}
                        </div>
                        <p className="text-white break-words">{log.message}</p>
                        {log.data && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                              Show data
                            </summary>
                            <pre className="mt-2 p-2 bg-black/30 rounded text-xs overflow-x-auto">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={logsEndRef} />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Terminal size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No logs available yet</p>
                  <p className="text-sm mt-2">Logs will appear here during execution</p>
                </div>
              </div>
            )}
          </div>

          {/* Node Executions Summary */}
          {execution.nodeExecutions && execution.nodeExecutions.length > 0 && (
            <div className="border-t border-white/10 p-4">
              <h4 className="text-sm font-semibold mb-3 text-gray-300">Node Execution Summary</h4>
              <div className="flex gap-2 overflow-x-auto">
                {execution.nodeExecutions.map((nodeExec, index) => (
                  <div
                    key={index}
                    className={`
                      flex-shrink-0 px-3 py-2 rounded-lg text-xs
                      ${getStatusColor(nodeExec.status)}
                    `}
                  >
                    <div className="font-medium">{nodeExec.nodeName}</div>
                    {nodeExec.duration && (
                      <div className="text-gray-400 mt-1">
                        {formatDuration(nodeExec.duration)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExecutionLogsPanel;
