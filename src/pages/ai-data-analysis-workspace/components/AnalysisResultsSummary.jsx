import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';


const AnalysisResultsSummary = ({ results, analysisType, isProcessing }) => {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    insights: true,
    metrics: false,
    recommendations: false
  });

  const mockResults = results || {
    overview: {
      analysisType: 'Predictive Modeling',
      dataPoints: 15420,
      features: 12,
      accuracy: 94.2,
      processingTime: '8m 32s',
      completedAt: new Date()?.toISOString()
    },
    keyInsights: [
      {
        title: 'Strong Revenue Correlation',
        description: 'Customer age and product category show strong correlation with revenue (r=0.89)',
        confidence: 95,
        impact: 'high'
      },
      {
        title: 'Seasonal Patterns Detected',
        description: 'Q4 consistently shows 35% higher performance across all metrics',
        confidence: 87,
        impact: 'medium'
      },
      {
        title: 'Regional Performance Variance',
        description: 'North America outperforms other regions by 22% on average',
        confidence: 92,
        impact: 'high'
      },
      {
        title: 'Price Sensitivity Analysis',
        description: 'Products priced between $150-$300 show optimal conversion rates',
        confidence: 78,
        impact: 'medium'
      }
    ],
    metrics: {
      accuracy: 94.2,
      precision: 91.8,
      recall: 89.5,
      f1Score: 90.6,
      rSquared: 0.847,
      mse: 0.023,
      mae: 0.156
    },
    predictions: [
      { metric: 'Next Month Revenue', value: '$485,200', confidence: '92%', trend: 'up' },
      { metric: 'Customer Growth', value: '+12.5%', confidence: '87%', trend: 'up' },
      { metric: 'Order Volume', value: '3,240 orders', confidence: '89%', trend: 'up' },
      { metric: 'Churn Rate', value: '4.2%', confidence: '85%', trend: 'down' }
    ],
    recommendations: [
      {
        title: 'Optimize Q4 Marketing',
        description: 'Increase marketing spend by 25% during Q4 to capitalize on seasonal trends',
        priority: 'high',
        impact: 'Revenue increase of $120K-$180K'
      },
      {
        title: 'Focus on North American Market',
        description: 'Allocate additional resources to North American operations',
        priority: 'medium',
        impact: 'Market share growth of 8-12%'
      },
      {
        title: 'Price Point Optimization',
        description: 'Adjust product pricing to the $150-$300 sweet spot for better conversion',
        priority: 'high',
        impact: 'Conversion rate improvement of 15-20%'
      }
    ]
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-success bg-success/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'low': return 'text-muted-foreground bg-muted/50';
      default: return 'text-muted-foreground bg-muted/50';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-destructive bg-destructive/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'low': return 'text-muted-foreground bg-muted/50';
      default: return 'text-muted-foreground bg-muted/50';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'TrendingUp';
      case 'down': return 'TrendingDown';
      default: return 'Minus';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  if (isProcessing) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyzing data and generating insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!results && !mockResults) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="text-center py-8">
          <Icon name="BarChart3" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Results Yet</h3>
          <p className="text-muted-foreground">Start an analysis to see results and insights here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Analysis Results</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-sm text-success font-medium">Complete</span>
          </div>
        </div>
      </div>
      {/* Overview Section */}
      <div className="border-b border-border">
        <button
          onClick={() => toggleSection('overview')}
          className="flex items-center justify-between w-full p-4 text-left hover:bg-accent/50 transition-colors"
        >
          <h4 className="font-medium text-foreground">Overview</h4>
          <Icon 
            name={expandedSections?.overview ? "ChevronUp" : "ChevronDown"} 
            size={16} 
          />
        </button>
        
        {expandedSections?.overview && (
          <div className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Analysis Type:</span>
                <span className="font-medium text-foreground">{mockResults?.overview?.analysisType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Data Points:</span>
                <span className="font-medium text-foreground">{mockResults?.overview?.dataPoints?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Features:</span>
                <span className="font-medium text-foreground">{mockResults?.overview?.features}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Accuracy:</span>
                <span className="font-medium text-success">{mockResults?.overview?.accuracy}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Processing Time:</span>
                <span className="font-medium text-foreground">{mockResults?.overview?.processingTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Completed:</span>
                <span className="font-medium text-foreground">
                  {new Date(mockResults.overview.completedAt)?.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Key Insights Section */}
      <div className="border-b border-border">
        <button
          onClick={() => toggleSection('insights')}
          className="flex items-center justify-between w-full p-4 text-left hover:bg-accent/50 transition-colors"
        >
          <h4 className="font-medium text-foreground">Key Insights</h4>
          <Icon 
            name={expandedSections?.insights ? "ChevronUp" : "ChevronDown"} 
            size={16} 
          />
        </button>
        
        {expandedSections?.insights && (
          <div className="px-4 pb-4 space-y-3">
            {mockResults?.keyInsights?.map((insight, index) => (
              <div key={index} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-foreground">{insight?.title}</h5>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(insight?.impact)}`}>
                      {insight?.impact} impact
                    </span>
                    <span className="text-xs text-muted-foreground">{insight?.confidence}% confidence</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{insight?.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Metrics Section */}
      <div className="border-b border-border">
        <button
          onClick={() => toggleSection('metrics')}
          className="flex items-center justify-between w-full p-4 text-left hover:bg-accent/50 transition-colors"
        >
          <h4 className="font-medium text-foreground">Performance Metrics</h4>
          <Icon 
            name={expandedSections?.metrics ? "ChevronUp" : "ChevronDown"} 
            size={16} 
          />
        </button>
        
        {expandedSections?.metrics && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(mockResults?.metrics)?.map(([key, value]) => (
                <div key={key} className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg font-semibold text-foreground">
                    {typeof value === 'number' ? value?.toFixed(3) : value}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    {key?.replace(/([A-Z])/g, ' $1')?.trim()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Predictions */}
      <div className="border-b border-border">
        <div className="p-4">
          <h4 className="font-medium text-foreground mb-3">Predictions</h4>
          <div className="space-y-2">
            {mockResults?.predictions?.map((prediction, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon 
                    name={getTrendIcon(prediction?.trend)} 
                    size={16} 
                    className={getTrendColor(prediction?.trend)}
                  />
                  <div>
                    <div className="font-medium text-foreground">{prediction?.metric}</div>
                    <div className="text-sm text-muted-foreground">{prediction?.confidence} confidence</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">{prediction?.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Recommendations Section */}
      <div>
        <button
          onClick={() => toggleSection('recommendations')}
          className="flex items-center justify-between w-full p-4 text-left hover:bg-accent/50 transition-colors"
        >
          <h4 className="font-medium text-foreground">Recommendations</h4>
          <Icon 
            name={expandedSections?.recommendations ? "ChevronUp" : "ChevronDown"} 
            size={16} 
          />
        </button>
        
        {expandedSections?.recommendations && (
          <div className="px-4 pb-4 space-y-3">
            {mockResults?.recommendations?.map((rec, index) => (
              <div key={index} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-foreground">{rec?.title}</h5>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(rec?.priority)}`}>
                    {rec?.priority} priority
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{rec?.description}</p>
                <div className="text-xs text-secondary font-medium">{rec?.impact}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResultsSummary;