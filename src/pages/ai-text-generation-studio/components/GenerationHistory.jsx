import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const GenerationHistory = ({ onHistorySelect, onSaveTemplate }) => {
  const [activeTab, setActiveTab] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');

  const recentGenerations = [
    {
      id: 1,
      title: 'Marketing Email Campaign',
      preview: 'Subject: Unlock Your Potential with Our New AI Tools\n\nDear Valued Customer,\n\nWe\'re excited to introduce our latest AI-powered features...',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      wordCount: 245,
      model: 'GPT-4 Turbo',
      template: 'email-campaign',
      rating: 4
    },
    {
      id: 2,
      title: 'Blog Post: AI in Healthcare',
      preview: 'The healthcare industry is experiencing a revolutionary transformation through artificial intelligence...',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      wordCount: 1250,
      model: 'Claude 3 Opus',
      template: 'blog-post',
      rating: 5
    },
    {
      id: 3,
      title: 'Product Description - Smart Watch',
      preview: 'Introducing the next generation of wearable technology that seamlessly blends style with functionality...',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      wordCount: 180,
      model: 'GPT-4',
      template: 'product-description',
      rating: 4
    },
    {
      id: 4,
      title: 'Social Media Posts - Tech Launch',
      preview: '🚀 Big news! We\'re launching something incredible that will change how you work with AI...',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      wordCount: 95,
      model: 'GPT-3.5 Turbo',
      template: 'social-media',
      rating: 3
    },
    {
      id: 5,
      title: 'Business Proposal - AI Consulting',
      preview: 'Executive Summary\n\nThis proposal outlines a comprehensive AI consulting engagement designed to transform...',
      timestamp: new Date(Date.now() - 259200000), // 3 days ago
      wordCount: 890,
      model: 'Claude 3 Sonnet',
      template: 'proposal',
      rating: 5
    }
  ];

  const savedTemplates = [
    {
      id: 't1',
      title: 'Weekly Newsletter Template',
      description: 'Engaging newsletter format with sections for updates, features, and CTAs',
      uses: 12,
      lastUsed: new Date(Date.now() - 604800000), // 1 week ago
      category: 'marketing'
    },
    {
      id: 't2',
      title: 'Product Launch Announcement',
      description: 'Professional template for announcing new products or features',
      uses: 8,
      lastUsed: new Date(Date.now() - 1209600000), // 2 weeks ago
      category: 'business'
    },
    {
      id: 't3',
      title: 'Technical Blog Post Structure',
      description: 'Structured format for technical content with code examples',
      uses: 15,
      lastUsed: new Date(Date.now() - 432000000), // 5 days ago
      category: 'technical'
    }
  ];

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name="Star"
        size={12}
        className={i < rating ? 'text-warning fill-current' : 'text-muted-foreground'}
      />
    ));
  };

  const filteredHistory = recentGenerations?.filter(item =>
    item?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    item?.preview?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const filteredTemplates = savedTemplates?.filter(template =>
    template?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    template?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">History & Templates</h3>
        <Button variant="ghost" size="sm" iconName="MoreHorizontal" iconSize={16} />
      </div>
      {/* Search */}
      <div className="relative">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e?.target?.value)}
          className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      {/* Tabs */}
      <div className="flex space-x-1 bg-muted/50 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('recent')}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded-md spring-animation ${
            activeTab === 'recent' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
          }`}
        >
          Recent ({recentGenerations?.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded-md spring-animation ${
            activeTab === 'templates' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
          }`}
        >
          Templates ({savedTemplates?.length})
        </button>
      </div>
      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto space-y-2">
        {activeTab === 'recent' ? (
          filteredHistory?.length > 0 ? (
            filteredHistory?.map((item) => (
              <div
                key={item?.id}
                className="p-3 bg-card rounded-lg border hover:bg-accent hover:text-accent-foreground spring-animation cursor-pointer group"
                onClick={() => onHistorySelect(item)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground truncate flex-1">
                    {item?.title}
                  </h4>
                  <div className="flex items-center space-x-1 ml-2">
                    {renderStars(item?.rating)}
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {item?.preview}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <span>{item?.wordCount} words</span>
                    <span>•</span>
                    <span>{item?.model}</span>
                  </div>
                  <span>{formatTimeAgo(item?.timestamp)}</span>
                </div>
                
                <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 spring-animation">
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" iconName="Copy" iconSize={12}>
                      Copy
                    </Button>
                    <Button variant="ghost" size="sm" iconName="Edit" iconSize={12}>
                      Edit
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Save"
                    iconSize={12}
                    onClick={(e) => {
                      e?.stopPropagation();
                      onSaveTemplate(item);
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Icon name="Clock" size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent generations found</p>
            </div>
          )
        ) : (
          filteredTemplates?.length > 0 ? (
            filteredTemplates?.map((template) => (
              <div
                key={template?.id}
                className="p-3 bg-card rounded-lg border hover:bg-accent hover:text-accent-foreground spring-animation cursor-pointer group"
                onClick={() => onHistorySelect(template)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground">
                    {template?.title}
                  </h4>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {template?.category}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground mb-2">
                  {template?.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <span>{template?.uses} uses</span>
                    <span>•</span>
                    <span>Last used {formatTimeAgo(template?.lastUsed)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 spring-animation">
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" iconName="Play" iconSize={12}>
                      Use
                    </Button>
                    <Button variant="ghost" size="sm" iconName="Edit" iconSize={12}>
                      Edit
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" iconName="Trash2" iconSize={12}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Icon name="BookOpen" size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No saved templates found</p>
            </div>
          )
        )}
      </div>
      {/* Quick Stats */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-foreground">24</div>
            <div className="text-xs text-muted-foreground">This Week</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">156</div>
            <div className="text-xs text-muted-foreground">Total Generated</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerationHistory;