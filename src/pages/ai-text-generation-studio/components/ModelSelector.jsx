import React, { useState } from 'react';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const ModelSelector = ({ selectedModel, onModelChange, isGenerating }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const models = [
    { 
      value: 'gpt-4-turbo', 
      label: 'GPT-4 Turbo',
      description: 'Most capable model for complex tasks'
    },
    { 
      value: 'gpt-4', 
      label: 'GPT-4',
      description: 'High-quality text generation'
    },
    { 
      value: 'gpt-3.5-turbo', 
      label: 'GPT-3.5 Turbo',
      description: 'Fast and efficient for most tasks'
    },
    { 
      value: 'claude-3-opus', 
      label: 'Claude 3 Opus',
      description: 'Excellent for creative writing'
    },
    { 
      value: 'claude-3-sonnet', 
      label: 'Claude 3 Sonnet',
      description: 'Balanced performance and speed'
    }
  ];

  const advancedModels = [
    { 
      value: 'gemini-pro', 
      label: 'Gemini Pro',
      description: 'Google\'s advanced language model'
    },
    { 
      value: 'llama-2-70b', 
      label: 'Llama 2 70B',
      description: 'Open-source alternative'
    }
  ];

  const allModels = showAdvanced ? [...models, ...advancedModels] : models;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">AI Model</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-muted-foreground hover:text-foreground spring-animation flex items-center space-x-1"
        >
          <span>{showAdvanced ? 'Hide' : 'Show'} Advanced</span>
          <Icon name={showAdvanced ? "ChevronUp" : "ChevronDown"} size={12} />
        </button>
      </div>
      <Select
        options={allModels}
        value={selectedModel}
        onChange={onModelChange}
        disabled={isGenerating}
        placeholder="Select AI model"
        searchable
      />
      {selectedModel && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <Icon name="Info" size={16} className="text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs font-medium text-foreground">
                {allModels?.find(m => m?.value === selectedModel)?.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {allModels?.find(m => m?.value === selectedModel)?.description}
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 bg-card rounded border">
          <div className="text-muted-foreground">Tokens/min</div>
          <div className="font-medium text-foreground">~2,500</div>
        </div>
        <div className="p-2 bg-card rounded border">
          <div className="text-muted-foreground">Cost/1K</div>
          <div className="font-medium text-foreground">$0.03</div>
        </div>
      </div>
    </div>
  );
};

export default ModelSelector;