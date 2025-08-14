import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ParameterPanel = ({ 
  selectedTool, 
  parameters, 
  onParameterChange, 
  onPresetApply,
  onExport 
}) => {
  const [activeTab, setActiveTab] = useState('parameters');

  const presetFilters = [
    {
      id: 'vintage',
      name: 'Vintage',
      preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop',
      description: 'Classic vintage look with warm tones'
    },
    {
      id: 'modern',
      name: 'Modern',
      preview: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop',
      description: 'Clean, contemporary aesthetic'
    },
    {
      id: 'dramatic',
      name: 'Dramatic',
      preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=100&h=100&fit=crop',
      description: 'High contrast with bold shadows'
    },
    {
      id: 'soft',
      name: 'Soft',
      preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop',
      description: 'Gentle, dreamy appearance'
    },
    {
      id: 'cinematic',
      name: 'Cinematic',
      preview: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=100&h=100&fit=crop',
      description: 'Film-like color grading'
    },
    {
      id: 'black-white',
      name: 'B&W Classic',
      preview: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop',
      description: 'Timeless black and white'
    }
  ];

  const processingHistory = [
    {
      id: 1,
      operation: 'Enhanced Quality',
      timestamp: new Date(Date.now() - 300000),
      parameters: { strength: 0.8, model: 'real-esrgan' },
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=60&h=60&fit=crop'
    },
    {
      id: 2,
      operation: 'Background Removed',
      timestamp: new Date(Date.now() - 900000),
      parameters: { precision: 'high', edge_smoothing: true },
      thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=60&h=60&fit=crop'
    },
    {
      id: 3,
      operation: 'Style Transfer',
      timestamp: new Date(Date.now() - 1800000),
      parameters: { style: 'artistic', intensity: 0.6 },
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=60&h=60&fit=crop'
    }
  ];

  const exportFormats = [
    { value: 'jpg', label: 'JPEG (.jpg)' },
    { value: 'png', label: 'PNG (.png)' },
    { value: 'webp', label: 'WebP (.webp)' },
    { value: 'tiff', label: 'TIFF (.tiff)' }
  ];

  const exportQualities = [
    { value: '90', label: 'High (90%)' },
    { value: '80', label: 'Medium (80%)' },
    { value: '70', label: 'Low (70%)' }
  ];

  const getParameterControls = () => {
    switch (selectedTool) {
      case 'enhance':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Enhancement Strength
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={parameters?.strength || 0.7}
                onChange={(e) => onParameterChange('strength', parseFloat(e?.target?.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Subtle</span>
                <span>{((parameters?.strength || 0.7) * 100)?.toFixed(0)}%</span>
                <span>Strong</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Noise Reduction
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={parameters?.noiseReduction || 0.5}
                onChange={(e) => onParameterChange('noiseReduction', parseFloat(e?.target?.value))}
                className="w-full"
              />
            </div>
          </div>
        );
      
      case 'upscale':
        return (
          <div className="space-y-4">
            <Select
              label="Scale Factor"
              options={[
                { value: '2x', label: '2x (Double Size)' },
                { value: '4x', label: '4x (Quadruple Size)' },
                { value: '8x', label: '8x (8x Larger)' }
              ]}
              value={parameters?.scaleFactor || '2x'}
              onChange={(value) => onParameterChange('scaleFactor', value)}
            />
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Detail Preservation
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={parameters?.detailPreservation || 0.8}
                onChange={(e) => onParameterChange('detailPreservation', parseFloat(e?.target?.value))}
                className="w-full"
              />
            </div>
          </div>
        );
      
      case 'style-transfer':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Style Intensity
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={parameters?.styleIntensity || 0.6}
                onChange={(e) => onParameterChange('styleIntensity', parseFloat(e?.target?.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Content Preservation
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={parameters?.contentPreservation || 0.7}
                onChange={(e) => onParameterChange('contentPreservation', parseFloat(e?.target?.value))}
                className="w-full"
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-8">
            <Icon name="Settings" size={48} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Select a tool to adjust parameters
            </p>
          </div>
        );
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date?.toLocaleDateString();
  };

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex">
          {[
            { id: 'parameters', label: 'Parameters', icon: 'Sliders' },
            { id: 'presets', label: 'Presets', icon: 'Palette' },
            { id: 'history', label: 'History', icon: 'Clock' },
            { id: 'export', label: 'Export', icon: 'Download' }
          ]?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => setActiveTab(tab?.id)}
              className={`flex-1 flex items-center justify-center space-x-1 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab?.id
                  ? 'border-secondary text-secondary' :'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={tab?.icon} size={16} />
              <span className="hidden sm:inline">{tab?.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'parameters' && (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Tool Parameters
            </h3>
            {getParameterControls()}
          </div>
        )}

        {activeTab === 'presets' && (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Filter Presets
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {presetFilters?.map((preset) => (
                <button
                  key={preset?.id}
                  onClick={() => onPresetApply(preset)}
                  className="text-left p-3 border border-border rounded-lg hover:border-secondary transition-colors"
                >
                  <div className="w-full h-16 bg-muted rounded mb-2 overflow-hidden">
                    <img
                      src={preset?.preview}
                      alt={preset?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-sm font-medium text-foreground">
                    {preset?.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {preset?.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Processing History
            </h3>
            {processingHistory?.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="History" size={48} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No processing history yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {processingHistory?.map((item) => (
                  <div
                    key={item?.id}
                    className="flex items-start space-x-3 p-3 border border-border rounded-lg hover:border-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item?.thumbnail}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground">
                        {item?.operation}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(item?.timestamp)}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="RotateCcw"
                          iconSize={12}
                        >
                          Reapply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'export' && (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Export Settings
            </h3>
            <div className="space-y-4">
              <Select
                label="Format"
                options={exportFormats}
                value="jpg"
                onChange={() => {}}
              />
              
              <Select
                label="Quality"
                options={exportQualities}
                value="90"
                onChange={() => {}}
              />
              
              <Input
                label="Custom Width (px)"
                type="number"
                placeholder="Auto"
              />
              
              <Input
                label="Custom Height (px)"
                type="number"
                placeholder="Auto"
              />
              
              <div className="pt-4 space-y-2">
                <Button
                  variant="secondary"
                  fullWidth
                  iconName="Download"
                  iconPosition="left"
                  onClick={onExport}
                >
                  Export Image
                </Button>
                
                <Button
                  variant="outline"
                  fullWidth
                  iconName="Share"
                  iconPosition="left"
                >
                  Share Link
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParameterPanel;