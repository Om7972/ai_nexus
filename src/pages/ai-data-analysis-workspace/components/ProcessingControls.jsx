import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ProcessingControls = ({ 
  onStartAnalysis, 
  onStopAnalysis, 
  isProcessing, 
  canStart, 
  progress,
  estimatedTime 
}) => {
  const [priority, setPriority] = useState('normal');
  const [outputFormat, setOutputFormat] = useState('comprehensive');

  const priorityOptions = [
    { value: 'low', label: 'Low Priority', description: 'Slower processing, lower cost' },
    { value: 'normal', label: 'Normal Priority', description: 'Balanced speed and cost' },
    { value: 'high', label: 'High Priority', description: 'Faster processing, higher cost' }
  ];

  const outputOptions = [
    { value: 'summary', label: 'Summary Report', description: 'Key insights only' },
    { value: 'comprehensive', label: 'Comprehensive Report', description: 'Detailed analysis' },
    { value: 'raw', label: 'Raw Data + Report', description: 'All data and insights' }
  ];

  const handleStartAnalysis = () => {
    onStartAnalysis({
      priority,
      outputFormat,
      timestamp: new Date()?.toISOString()
    });
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Processing Controls</h3>
        <div className="flex items-center space-x-2">
          {isProcessing && (
            <div className="flex items-center space-x-2 text-sm text-secondary">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
              <span>Processing...</span>
            </div>
          )}
        </div>
      </div>
      {!isProcessing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Processing Priority"
              options={priorityOptions}
              value={priority}
              onChange={setPriority}
              className="mb-0"
            />
            
            <Select
              label="Output Format"
              options={outputOptions}
              value={outputFormat}
              onChange={setOutputFormat}
              className="mb-0"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="Clock" size={16} color="var(--color-muted-foreground)" />
              <div>
                <div className="text-sm font-medium text-foreground">Estimated Time</div>
                <div className="text-xs text-muted-foreground">
                  {estimatedTime || 'Select analysis type first'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Icon name="Zap" size={16} color="var(--color-muted-foreground)" />
              <div>
                <div className="text-sm font-medium text-foreground">Credits</div>
                <div className="text-xs text-muted-foreground">
                  {priority === 'high' ? '15 credits' : priority === 'normal' ? '10 credits' : '5 credits'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="default"
              onClick={handleStartAnalysis}
              disabled={!canStart}
              iconName="Play"
              iconPosition="left"
              className="flex-1"
            >
              Start Analysis
            </Button>
            
            <Button
              variant="outline"
              iconName="Settings"
              iconPosition="left"
            >
              Advanced
            </Button>
          </div>

          {!canStart && (
            <div className="flex items-center space-x-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <Icon name="AlertTriangle" size={16} color="var(--color-warning)" />
              <span className="text-sm text-warning">
                Please upload a dataset and select an analysis type to continue
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin"></div>
              <div>
                <div className="text-sm font-medium text-foreground">Analysis in Progress</div>
                <div className="text-xs text-muted-foreground">
                  Processing your dataset...
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">{progress}%</div>
              <div className="text-xs text-muted-foreground">
                {estimatedTime && formatTime(Math.floor((100 - progress) * 180 / 100))} remaining
              </div>
            </div>
          </div>

          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-secondary h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Started: {new Date()?.toLocaleTimeString()}</span>
            <span>Priority: {priority?.charAt(0)?.toUpperCase() + priority?.slice(1)}</span>
          </div>

          <Button
            variant="destructive"
            onClick={onStopAnalysis}
            iconName="Square"
            iconPosition="left"
            size="sm"
          >
            Stop Analysis
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProcessingControls;