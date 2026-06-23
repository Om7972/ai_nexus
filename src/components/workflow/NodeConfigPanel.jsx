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

  const renderConfigFields = () => {
    switch (node.type) {
      case 'userInput':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Input Parameter Source Key</label>
              <input
                type="text"
                value={config.inputSource || 'input'}
                onChange={(e) => handleChange('inputSource', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="input"
              />
              <p className="text-[10px] text-gray-400 mt-1">Specify variable path from execution input</p>
            </div>
          </div>
        );

      case 'textGenerator':
      case 'llmNode':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Prompt Template</label>
              <textarea
                value={config.prompt || ''}
                onChange={(e) => handleChange('prompt', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-mono text-sm"
                rows={5}
                placeholder="Translate this: {{input}}"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <select
                value={config.model || 'gemini-1.5-pro'}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Tone</label>
                <select
                  value={config.tone || 'professional'}
                  onChange={(e) => handleChange('tone', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="creative">Creative</option>
                  <option value="academic">Academic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Length</label>
                <select
                  value={config.length || 'medium'}
                  onChange={(e) => handleChange('length', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'imageGenerator':
      case 'imageGeneration':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Prompt Template</label>
              <textarea
                value={config.prompt || ''}
                onChange={(e) => handleChange('prompt', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm"
                rows={4}
                placeholder="High resolution image of {{userInput.topic}}"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <select
                value={config.model || 'dall-e-3'}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              >
                <option value="dall-e-3">DALL-E 3</option>
                <option value="dall-e-2">DALL-E 2</option>
                <option value="stable-diffusion">Stable Diffusion</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Resolution</label>
              <select
                value={config.size || '1024x1024'}
                onChange={(e) => handleChange('size', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              >
                <option value="1024x1024">1024x1024</option>
                <option value="512x512">512x512</option>
                <option value="256x256">256x256</option>
              </select>
            </div>
          </div>
        );

      case 'ocr':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Image Source URI</label>
              <input
                type="text"
                value={config.imageSource || 'input.imageUrl'}
                onChange={(e) => handleChange('imageSource', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                placeholder="e.g. input.imageUrl"
              />
            </div>
          </div>
        );

      case 'summarizer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Text Source</label>
              <input
                type="text"
                value={config.text || '{{input}}'}
                onChange={(e) => handleChange('text', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                placeholder="e.g. {{nodeId.text}}"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Detail Level</label>
              <select
                value={config.detailLevel || 'concise'}
                onChange={(e) => handleChange('detailLevel', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              >
                <option value="bullet-points">Bullet Points</option>
                <option value="concise">Concise Paragraph</option>
                <option value="detailed">Detailed Analysis</option>
              </select>
            </div>
          </div>
        );

      case 'translator':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Text Source</label>
              <input
                type="text"
                value={config.text || '{{input}}'}
                onChange={(e) => handleChange('text', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                placeholder="e.g. {{nodeId.text}}"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Language</label>
              <select
                value={config.targetLanguage || 'Spanish'}
                onChange={(e) => handleChange('targetLanguage', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              >
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Japanese">Japanese</option>
                <option value="Chinese">Chinese</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>
        );

      case 'dataAnalyzer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Data Source</label>
              <input
                type="text"
                value={config.data || '{{input}}'}
                onChange={(e) => handleChange('data', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                placeholder="e.g. {{nodeId.data}}"
              />
            </div>
          </div>
        );

      case 'emailSender':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Recipient Email</label>
              <input
                type="text"
                value={config.recipient || ''}
                onChange={(e) => handleChange('recipient', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                placeholder="example@mail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                type="text"
                value={config.subject || ''}
                onChange={(e) => handleChange('subject', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                placeholder="Alert Subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Body</label>
              <textarea
                value={config.body || ''}
                onChange={(e) => handleChange('body', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                rows={4}
                placeholder="Hi user, here is your summary: {{nodeId.summary}}"
              />
            </div>
          </div>
        );

      case 'webSearch':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search Query</label>
              <input
                type="text"
                value={config.query || ''}
                onChange={(e) => handleChange('query', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                placeholder="e.g. {{input.companyName}} stock price"
              />
            </div>
          </div>
        );

      case 'delay':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Duration (ms)</label>
              <input
                type="number"
                value={config.duration || 1000}
                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                placeholder="1000"
              />
            </div>
          </div>
        );

      case 'conditionNode':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Left Operand</label>
              <input
                type="text"
                value={config.leftOperand || ''}
                onChange={(e) => handleChange('leftOperand', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                placeholder="e.g. {{nodeId.status}}"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Operator</label>
              <select
                value={config.operator || 'equals'}
                onChange={(e) => handleChange('operator', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
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
              <label className="block text-sm font-medium mb-1">Right Operand</label>
              <input
                type="text"
                value={config.rightOperand || ''}
                onChange={(e) => handleChange('rightOperand', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                placeholder="value"
              />
            </div>
          </div>
        );

      case 'exportNode':
      case 'outputNode':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Data to Export</label>
              <input
                type="text"
                value={config.exportSource || ''}
                onChange={(e) => handleChange('exportSource', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                placeholder="e.g. {{nodeId.response}}"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Export Format</label>
              <select
                value={config.format || 'json'}
                onChange={(e) => handleChange('format', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV (Plain Text)</option>
              </select>
            </div>
          </div>
        );

      default:
        return <div className="text-gray-400">Configure parameters in fields below.</div>;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-96 bg-gray-950 border-l border-white/10 shadow-2xl z-50 overflow-y-auto flex flex-col"
      >
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Config Settings</h3>
                <p className="text-xs text-gray-400 mt-0.5">{node.type}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Node Title</label>
                <input
                  type="text"
                  value={config.label || ''}
                  onChange={(e) => handleChange('label', e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  placeholder="Custom label"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Max Retries</label>
                <input
                  type="number"
                  value={config.retries || 3}
                  onChange={(e) => handleChange('retries', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  placeholder="3"
                />
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              {renderConfigFields()}
            </div>
          </div>

          <div className="flex gap-2 mt-8 pt-4 border-t border-white/10">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white text-sm transition-colors"
            >
              <Save size={16} />
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 text-sm transition-colors"
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
