import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const AnalysisParameters = ({ analysisType, onParametersChange, parameters = {} }) => {
  const [localParams, setLocalParams] = useState({
    confidence: 95,
    maxIterations: 1000,
    testSize: 0.2,
    randomState: 42,
    includeVisualization: true,
    exportFormat: 'pdf',
    ...parameters
  });

  const confidenceOptions = [
    { value: 90, label: '90%' },
    { value: 95, label: '95%' },
    { value: 99, label: '99%' }
  ];

  const exportOptions = [
    { value: 'pdf', label: 'PDF Report' },
    { value: 'excel', label: 'Excel Workbook' },
    { value: 'json', label: 'JSON Data' },
    { value: 'csv', label: 'CSV Files' }
  ];

  const updateParameter = (key, value) => {
    const newParams = { ...localParams, [key]: value };
    setLocalParams(newParams);
    onParametersChange(newParams);
  };

  const resetToDefaults = () => {
    const defaults = {
      confidence: 95,
      maxIterations: 1000,
      testSize: 0.2,
      randomState: 42,
      includeVisualization: true,
      exportFormat: 'pdf'
    };
    setLocalParams(defaults);
    onParametersChange(defaults);
  };

  const getParametersForType = (type) => {
    switch (type) {
      case 'predictive':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Test Size Ratio"
                type="number"
                min="0.1"
                max="0.5"
                step="0.05"
                value={localParams?.testSize}
                onChange={(e) => updateParameter('testSize', parseFloat(e?.target?.value))}
                description="Portion of data for testing (0.1-0.5)"
              />
              
              <Input
                label="Max Iterations"
                type="number"
                min="100"
                max="10000"
                step="100"
                value={localParams?.maxIterations}
                onChange={(e) => updateParameter('maxIterations', parseInt(e?.target?.value))}
                description="Maximum training iterations"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Confidence Level"
                options={confidenceOptions}
                value={localParams?.confidence}
                onChange={(value) => updateParameter('confidence', value)}
              />
              
              <Input
                label="Random State"
                type="number"
                min="1"
                max="999"
                value={localParams?.randomState}
                onChange={(e) => updateParameter('randomState', parseInt(e?.target?.value))}
                description="Seed for reproducible results"
              />
            </div>
          </div>
        );

      case 'pattern':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Min Cluster Size"
                type="number"
                min="2"
                max="100"
                value={localParams?.minClusterSize || 5}
                onChange={(e) => updateParameter('minClusterSize', parseInt(e?.target?.value))}
                description="Minimum points per cluster"
              />
              
              <Input
                label="Max Clusters"
                type="number"
                min="2"
                max="20"
                value={localParams?.maxClusters || 10}
                onChange={(e) => updateParameter('maxClusters', parseInt(e?.target?.value))}
                description="Maximum number of clusters"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Anomaly Threshold"
                type="number"
                min="0.01"
                max="0.5"
                step="0.01"
                value={localParams?.anomalyThreshold || 0.1}
                onChange={(e) => updateParameter('anomalyThreshold', parseFloat(e?.target?.value))}
                description="Sensitivity for anomaly detection"
              />
              
              <Select
                label="Algorithm"
                options={[
                  { value: 'kmeans', label: 'K-Means' },
                  { value: 'dbscan', label: 'DBSCAN' },
                  { value: 'hierarchical', label: 'Hierarchical' }
                ]}
                value={localParams?.algorithm || 'kmeans'}
                onChange={(value) => updateParameter('algorithm', value)}
              />
            </div>
          </div>
        );

      case 'statistical':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Significance Level"
                options={[
                  { value: 0.01, label: '0.01 (99% confidence)' },
                  { value: 0.05, label: '0.05 (95% confidence)' },
                  { value: 0.1, label: '0.10 (90% confidence)' }
                ]}
                value={localParams?.significanceLevel || 0.05}
                onChange={(value) => updateParameter('significanceLevel', value)}
              />
              
              <Select
                label="Correlation Method"
                options={[
                  { value: 'pearson', label: 'Pearson' },
                  { value: 'spearman', label: 'Spearman' },
                  { value: 'kendall', label: 'Kendall' }
                ]}
                value={localParams?.correlationMethod || 'pearson'}
                onChange={(value) => updateParameter('correlationMethod', value)}
              />
            </div>
            <div className="space-y-3">
              <Checkbox
                label="Include Descriptive Statistics"
                checked={localParams?.includeDescriptive !== false}
                onChange={(e) => updateParameter('includeDescriptive', e?.target?.checked)}
              />
              
              <Checkbox
                label="Perform Normality Tests"
                checked={localParams?.normalityTests || false}
                onChange={(e) => updateParameter('normalityTests', e?.target?.checked)}
              />
              
              <Checkbox
                label="Generate Correlation Matrix"
                checked={localParams?.correlationMatrix !== false}
                onChange={(e) => updateParameter('correlationMatrix', e?.target?.checked)}
              />
            </div>
          </div>
        );

      case 'sentiment':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Text Column"
                options={[
                  { value: 'content', label: 'Content' },
                  { value: 'description', label: 'Description' },
                  { value: 'review', label: 'Review' },
                  { value: 'comment', label: 'Comment' }
                ]}
                value={localParams?.textColumn || 'content'}
                onChange={(value) => updateParameter('textColumn', value)}
              />
              
              <Select
                label="Language"
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'fr', label: 'French' },
                  { value: 'de', label: 'German' }
                ]}
                value={localParams?.language || 'en'}
                onChange={(value) => updateParameter('language', value)}
              />
            </div>
            <div className="space-y-3">
              <Checkbox
                label="Include Emotion Analysis"
                checked={localParams?.emotionAnalysis || false}
                onChange={(e) => updateParameter('emotionAnalysis', e?.target?.checked)}
              />
              
              <Checkbox
                label="Extract Key Phrases"
                checked={localParams?.keyPhrases !== false}
                onChange={(e) => updateParameter('keyPhrases', e?.target?.checked)}
              />
              
              <Checkbox
                label="Generate Word Cloud"
                checked={localParams?.wordCloud || false}
                onChange={(e) => updateParameter('wordCloud', e?.target?.checked)}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <Icon name="Settings" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Select an analysis type to configure parameters</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Analysis Parameters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetToDefaults}
          iconName="RotateCcw"
          iconPosition="left"
        >
          Reset
        </Button>
      </div>
      <div className="space-y-6">
        {getParametersForType(analysisType)}
        
        {analysisType && (
          <div className="border-t border-border pt-6 space-y-4">
            <h4 className="text-sm font-medium text-foreground">Output Options</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Export Format"
                options={exportOptions}
                value={localParams?.exportFormat}
                onChange={(value) => updateParameter('exportFormat', value)}
              />
              
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  label="Include Visualizations"
                  checked={localParams?.includeVisualization}
                  onChange={(e) => updateParameter('includeVisualization', e?.target?.checked)}
                />
              </div>
            </div>
            
            <div className="p-4 bg-secondary/10 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Info" size={16} color="var(--color-secondary)" />
                <span className="text-sm font-medium text-foreground">Parameter Summary</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {Object.entries(localParams)?.length} parameters configured for {analysisType || 'selected'} analysis
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisParameters;