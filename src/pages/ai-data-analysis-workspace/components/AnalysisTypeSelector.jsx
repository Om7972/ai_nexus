import React from 'react';
import Icon from '../../../components/AppIcon';


const AnalysisTypeSelector = ({ selectedType, onTypeSelect, isProcessing }) => {
  const analysisTypes = [
    {
      id: 'predictive',
      name: 'Predictive Modeling',
      description: 'Forecast future trends and outcomes using machine learning algorithms',
      icon: 'TrendingUp',
      features: ['Time series forecasting', 'Regression analysis', 'Classification models'],
      complexity: 'Advanced',
      estimatedTime: '5-15 minutes'
    },
    {
      id: 'pattern',
      name: 'Pattern Recognition',
      description: 'Identify hidden patterns and relationships in your data',
      icon: 'Network',
      features: ['Clustering analysis', 'Anomaly detection', 'Association rules'],
      complexity: 'Intermediate',
      estimatedTime: '3-8 minutes'
    },
    {
      id: 'statistical',
      name: 'Statistical Analysis',
      description: 'Comprehensive statistical insights and hypothesis testing',
      icon: 'BarChart3',
      features: ['Descriptive statistics', 'Correlation analysis', 'Hypothesis testing'],
      complexity: 'Basic',
      estimatedTime: '1-3 minutes'
    },
    {
      id: 'sentiment',
      name: 'Sentiment Analysis',
      description: 'Analyze text data for emotional tone and opinions',
      icon: 'MessageSquare',
      features: ['Emotion detection', 'Opinion mining', 'Text classification'],
      complexity: 'Intermediate',
      estimatedTime: '2-5 minutes'
    }
  ];

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'Basic': return 'text-success';
      case 'Intermediate': return 'text-warning';
      case 'Advanced': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Analysis Type</h3>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Zap" size={16} />
          <span>AI-Powered</span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {analysisTypes?.map((type) => (
          <div
            key={type?.id}
            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedType === type?.id
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-accent/50'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !isProcessing && onTypeSelect(type?.id)}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedType === type?.id ? 'bg-primary text-primary-foreground' : 'bg-secondary/20'
              }`}>
                <Icon 
                  name={type?.icon} 
                  size={20} 
                  color={selectedType === type?.id ? 'currentColor' : 'var(--color-secondary)'} 
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-foreground">{type?.name}</h4>
                  {selectedType === type?.id && (
                    <Icon name="Check" size={16} color="var(--color-primary)" />
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {type?.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${getComplexityColor(type?.complexity)}`}>
                      {type?.complexity}
                    </span>
                    <span className="text-muted-foreground">
                      {type?.estimatedTime}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {type?.features?.slice(0, 2)?.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-muted text-xs text-muted-foreground rounded"
                      >
                        {feature}
                      </span>
                    ))}
                    {type?.features?.length > 2 && (
                      <span className="px-2 py-1 bg-muted text-xs text-muted-foreground rounded">
                        +{type?.features?.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedType && (
        <div className="mt-6 p-4 bg-secondary/10 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Info" size={16} color="var(--color-secondary)" />
            <span className="text-sm font-medium text-foreground">Analysis Details</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {analysisTypes?.find(type => type?.id === selectedType)?.description}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysisTypes?.find(type => type?.id === selectedType)?.features?.map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-secondary/20 text-xs text-foreground rounded"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisTypeSelector;