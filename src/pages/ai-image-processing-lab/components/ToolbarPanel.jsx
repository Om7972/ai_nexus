import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ToolbarPanel = ({ 
  selectedTool, 
  onToolChange, 
  selectedModel, 
  onModelChange, 
  onBatchProcess,
  isProcessing 
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const processingTools = [
    { value: 'enhance', label: 'Enhance Quality', icon: 'Sparkles' },
    { value: 'upscale', label: 'Upscale Image', icon: 'ZoomIn' },
    { value: 'style-transfer', label: 'Style Transfer', icon: 'Palette' },
    { value: 'background-removal', label: 'Remove Background', icon: 'Scissors' },
    { value: 'colorize', label: 'Colorize B&W', icon: 'Paintbrush' },
    { value: 'denoise', label: 'Noise Reduction', icon: 'Filter' },
    { value: 'restore', label: 'Photo Restore', icon: 'RefreshCw' },
    { value: 'artistic', label: 'Artistic Filter', icon: 'Image' }
  ];

  const aiModels = [
    { value: 'real-esrgan', label: 'Real-ESRGAN (Photo Enhancement)' },
    { value: 'waifu2x', label: 'Waifu2x (Anime/Art Upscaling)' },
    { value: 'stable-diffusion', label: 'Stable Diffusion (Style Transfer)' },
    { value: 'u2net', label: 'U²-Net (Background Removal)' },
    { value: 'deoldify', label: 'DeOldify (Colorization)' },
    { value: 'dncnn', label: 'DnCNN (Denoising)' }
  ];

  const qualityOptions = [
    { value: 'draft', label: 'Draft (Fast)' },
    { value: 'standard', label: 'Standard' },
    { value: 'high', label: 'High Quality' },
    { value: 'ultra', label: 'Ultra (Slow)' }
  ];

  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Processing Tools */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-foreground">Tools:</span>
          <div className="flex flex-wrap gap-2">
            {processingTools?.slice(0, 4)?.map((tool) => (
              <Button
                key={tool?.value}
                variant={selectedTool === tool?.value ? "default" : "outline"}
                size="sm"
                iconName={tool?.icon}
                iconPosition="left"
                onClick={() => onToolChange(tool?.value)}
                disabled={isProcessing}
              >
                {tool?.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              iconName={showAdvanced ? "ChevronUp" : "ChevronDown"}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              More
            </Button>
          </div>
        </div>

        {/* Model Selection */}
        <div className="flex items-center space-x-2 min-w-64">
          <span className="text-sm font-medium text-foreground">Model:</span>
          <Select
            options={aiModels}
            value={selectedModel}
            onChange={onModelChange}
            placeholder="Select AI model"
            disabled={isProcessing}
          />
        </div>

        {/* Quality Setting */}
        <div className="flex items-center space-x-2 min-w-48">
          <span className="text-sm font-medium text-foreground">Quality:</span>
          <Select
            options={qualityOptions}
            value="standard"
            onChange={() => {}}
            disabled={isProcessing}
          />
        </div>

        {/* Batch Process */}
        <Button
          variant="secondary"
          size="sm"
          iconName="Layers"
          iconPosition="left"
          onClick={onBatchProcess}
          disabled={isProcessing}
        >
          Batch Process
        </Button>

        {/* Processing Status */}
        {isProcessing && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </div>
        )}
      </div>
      {/* Advanced Tools */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {processingTools?.slice(4)?.map((tool) => (
              <Button
                key={tool?.value}
                variant={selectedTool === tool?.value ? "default" : "outline"}
                size="sm"
                iconName={tool?.icon}
                iconPosition="left"
                onClick={() => onToolChange(tool?.value)}
                disabled={isProcessing}
              >
                {tool?.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolbarPanel;