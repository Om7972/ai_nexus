import React from 'react';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const ParameterControls = ({ 
  parameters, 
  onParameterChange, 
  isGenerating 
}) => {
  const toneOptions = [
    { value: 'professional', label: 'Professional', description: 'Formal and business-appropriate' },
    { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
    { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
    { value: 'authoritative', label: 'Authoritative', description: 'Expert and confident' },
    { value: 'creative', label: 'Creative', description: 'Imaginative and original' },
    { value: 'persuasive', label: 'Persuasive', description: 'Compelling and convincing' },
    { value: 'informative', label: 'Informative', description: 'Educational and factual' },
    { value: 'humorous', label: 'Humorous', description: 'Light-hearted and entertaining' }
  ];

  const lengthOptions = [
    { value: 'short', label: 'Short', description: '100-300 words' },
    { value: 'medium', label: 'Medium', description: '300-800 words' },
    { value: 'long', label: 'Long', description: '800-1500 words' },
    { value: 'very-long', label: 'Very Long', description: '1500+ words' }
  ];

  const creativityLevels = [
    { value: 0.3, label: 'Conservative', description: 'Focused and predictable' },
    { value: 0.5, label: 'Balanced', description: 'Good mix of creativity and focus' },
    { value: 0.7, label: 'Creative', description: 'More varied and original' },
    { value: 0.9, label: 'Very Creative', description: 'Highly original and diverse' }
  ];

  const formatOptions = [
    { value: 'paragraph', label: 'Paragraphs', description: 'Standard paragraph format' },
    { value: 'bullet-points', label: 'Bullet Points', description: 'Listed format' },
    { value: 'numbered-list', label: 'Numbered List', description: 'Sequential format' },
    { value: 'outline', label: 'Outline', description: 'Hierarchical structure' },
    { value: 'qa', label: 'Q&A Format', description: 'Question and answer style' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English', description: 'American English' },
    { value: 'en-uk', label: 'English (UK)', description: 'British English' },
    { value: 'es', label: 'Spanish', description: 'Español' },
    { value: 'fr', label: 'French', description: 'Français' },
    { value: 'de', label: 'German', description: 'Deutsch' },
    { value: 'it', label: 'Italian', description: 'Italiano' },
    { value: 'pt', label: 'Portuguese', description: 'Português' },
    { value: 'zh', label: 'Chinese', description: '中文' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Generation Parameters</h3>
        <button
          onClick={() => onParameterChange('reset', null)}
          className="text-xs text-muted-foreground hover:text-foreground spring-animation"
          disabled={isGenerating}
        >
          Reset to defaults
        </button>
      </div>
      <div className="space-y-4">
        <Select
          label="Tone of Voice"
          description="How should the content sound?"
          options={toneOptions}
          value={parameters?.tone}
          onChange={(value) => onParameterChange('tone', value)}
          disabled={isGenerating}
          searchable
        />

        <Select
          label="Content Length"
          description="Approximate word count"
          options={lengthOptions}
          value={parameters?.length}
          onChange={(value) => onParameterChange('length', value)}
          disabled={isGenerating}
        />

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Creativity Level
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={parameters?.creativity}
              onChange={(e) => onParameterChange('creativity', parseFloat(e?.target?.value))}
              disabled={isGenerating}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Conservative</span>
              <span>Balanced</span>
              <span>Creative</span>
              <span>Very Creative</span>
            </div>
            <div className="text-xs text-center text-foreground font-medium">
              Current: {creativityLevels?.find(level => level?.value === parameters?.creativity)?.label || 'Custom'}
            </div>
          </div>
        </div>

        <Select
          label="Output Format"
          description="How should content be structured?"
          options={formatOptions}
          value={parameters?.format}
          onChange={(value) => onParameterChange('format', value)}
          disabled={isGenerating}
        />

        <Select
          label="Language"
          description="Output language preference"
          options={languageOptions}
          value={parameters?.language}
          onChange={(value) => onParameterChange('language', value)}
          disabled={isGenerating}
          searchable
        />

        <div className="p-3 bg-card rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Advanced Options</span>
            <Icon name="Settings" size={16} className="text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Include citations</span>
              <input
                type="checkbox"
                checked={parameters?.includeCitations}
                onChange={(e) => onParameterChange('includeCitations', e?.target?.checked)}
                disabled={isGenerating}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">SEO optimized</span>
              <input
                type="checkbox"
                checked={parameters?.seoOptimized}
                onChange={(e) => onParameterChange('seoOptimized', e?.target?.checked)}
                disabled={isGenerating}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Include examples</span>
              <input
                type="checkbox"
                checked={parameters?.includeExamples}
                onChange={(e) => onParameterChange('includeExamples', e?.target?.checked)}
                disabled={isGenerating}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="p-3 bg-muted/50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} className="text-muted-foreground mt-0.5" />
          <div>
            <p className="text-xs font-medium text-foreground">Parameter Tips</p>
            <p className="text-xs text-muted-foreground mt-1">
              Higher creativity may produce more varied results but less predictable output. Adjust based on your content needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParameterControls;