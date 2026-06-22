import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Trash2 } from 'lucide-react';

const NodeConfigPanel = ({ node, onUpdate, onClose }) => {
  const [config, setConfig] = useState(node?.data || {});

  useEffect(() => {
    setConfig(node?.data || {});
  }, [node]);

  if (!node) return null;

  const handleSave = () => {
    onUpdate(node.id, config);
    onClose();
  };

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const addVariable = () => {
    const variables = config.variables || [];
    handleChange('variables', [...variables, { name: '', source: '', defaultValue: '' }]);
  };

  const updateVariable = (index, field, value) => {
    const variables = [...(config.variables || [])];
    variables[index][field] = value;
    handleChange('variables', variables);
  };

  const removeVariable = (index) => {
    const variables = [...(config.variables || [])];
    variables.splice(index, 1);
    handleChange('variables', variables);
  };

  const renderConfigFields = () => {
    switch (node.type) {
      case 'userInput':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Input Schema</label>
              <textarea
                value={config.schema || ''}
                onChange={(e) => handleChange('schema', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder='{"type": "object", "properties": {...}}'
              />
            </div>
          </div>
        );

      case 'promptNode':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prompt Template</label>
              <textarea
                value={config.promptTemplate || ''}
                onChange={(e) => handleChange('promptTemplate', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="Enter your prompt template here. Use {{variable}} for dynamic values."
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Variables</label>
                <button
                  onClick={addVariable}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  <Plus size={14} />
                  Add Variable
                </button>
              </div>
              <div className="space-y-2">
                {(config.variables || []).map((variable, index) => (
                  <div key={index} className="flex gap-2 p-2 bg-white/5 rounded-lg">
                    <input
                      type="text"
                      value={variable.name}
                      onChange={(e) => updateVariable(index, 'name', e.target.value)}
                      placeholder="Name"
                      className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={variable.source}
                      onChange={(e) => updateVariable(index, 'source', e.target.value)}
                      placeholder="Source (e.g., nodeId.output)"
                      className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeVariable(index)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'llmNode':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Model</label>
              <select
                value={config.model || 'gpt-4'}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="gemini-pro">Gemini Pro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Prompt Source</label>
              <input
                type="text"
                value={config.promptSource || ''}
                onChange={(e) => handleChange('promptSource', e.target.value)}
                placeholder="e.g., nodeId.prompt"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Temperature: {config.temperature || 0.7}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature || 0.7}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Tokens</label>
              <input
                type="number"
                value={config.maxTokens || 1000}
                onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'imageGeneration':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Model</label>
              <select
                value={config.model || 'dall-e-3'}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dall-e-3">DALL-E 3</option>
                <option value="dall-e-2">DALL-E 2</option>
                <option value="stable-diffusion">Stable Diffusion</option>
                <option value="midjourney">Midjourney</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Prompt Source</label>
              <input
                type="text"
                value={config.prompt || ''}
                onChange={(e) => handleChange('prompt', e.target.value)}
                placeholder="e.g., nodeId.response"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Size</label>
              <select
                value={config.size || '1024x1024'}
                onChange={(e) => handleChange('size', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="256x256">256x256</option>
                <option value="512x512">512x512</option>
                <option value="1024x1024">1024x1024</option>
                <option value="1792x1024">1792x1024</option>
              </select>
            </div>
          </div>
        );

      case 'conditionNode':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Left Operand</label>
              <input
                type="text"
                value={config.leftOperand || ''}
                onChange={(e) => handleChange('leftOperand', e.target.value)}
                placeholder="e.g., nodeId.output"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Operator</label>
              <select
                value={config.operator || 'equals'}
                onChange={(e) => handleChange('operator', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="equals">Equals</option>
                <option value="notEquals">Not Equals</option>
                <option value="contains">Contains</option>
                <option value="greaterThan">Greater Than</option>
                <option value="lessThan">Less Than</option>
                <option value="isEmpty">Is Empty</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Right Operand</label>
              <input
                type="text"
                value={config.rightOperand || ''}
                onChange={(e) => handleChange('rightOperand', e.target.value)}
                placeholder="Comparison value"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'apiRequest':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">URL</label>
              <input
                type="text"
                value={config.url || ''}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder="https://api.example.com/endpoint"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Method</label>
              <select
                value={config.method || 'GET'}
                onChange={(e) => handleChange('method', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Headers (JSON)</label>
              <textarea
                value={JSON.stringify(config.headers || {}, null, 2)}
                onChange={(e) => {
                  try {
                    handleChange('headers', JSON.parse(e.target.value));
                  } catch (err) {
                    // Invalid JSON, keep typing
                  }
                }}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Body Source (optional)</label>
              <input
                type="text"
                value={config.bodySource || ''}
                onChange={(e) => handleChange('bodySource', e.target.value)}
                placeholder="e.g., nodeId.output"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'outputNode':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Output Source</label>
              <input
                type="text"
                value={config.outputSource || ''}
                onChange={(e) => handleChange('outputSource', e.target.value)}
                placeholder="e.g., nodeId.response"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Specify which node output to use as final result</p>
            </div>
          </div>
        );

      default:
        return <div className="text-gray-400">No configuration available for this node type.</div>;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-96 bg-gray-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Configure Node</h3>
              <p className="text-sm text-gray-400 mt-1">{config.label || node.type}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Basic Info */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Label</label>
              <input
                type="text"
                value={config.label || ''}
                onChange={(e) => handleChange('label', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Node label"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={config.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Optional description"
              />
            </div>
          </div>

          {/* Node-specific Config */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-4 text-gray-300">Node Configuration</h4>
            {renderConfigFields()}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              <Save size={18} />
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NodeConfigPanel;
