import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import MetricsCard from './components/MetricsCard';
import ServiceTile from './components/ServiceTile';
import ActivityFeed from './components/ActivityFeed';
import RecentProjects from './components/RecentProjects';
import SystemStatus from './components/SystemStatus';
import QuickActions from './components/QuickActions';
import RecommendationCard from './components/RecommendationCard';

import Button from '../../components/ui/Button';

const MainDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Mock data for metrics
  const metricsData = [
    {
      title: "API Usage",
      value: "7,542",
      subtitle: "requests this month",
      icon: "Activity",
      trend: "up",
      trendValue: "+12.5%",
      color: "secondary"
    },
    {
      title: "Credits Remaining",
      value: "2,458",
      subtitle: "out of 10,000",
      icon: "Coins",
      trend: "down",
      trendValue: "-8.2%",
      color: "warning"
    },
    {
      title: "Active Projects",
      value: "23",
      subtitle: "across all services",
      icon: "FolderOpen",
      trend: "up",
      trendValue: "+3",
      color: "success"
    },
    {
      title: "Processing Time",
      value: "1.2s",
      subtitle: "average response",
      icon: "Zap",
      trend: "up",
      trendValue: "+15%",
      color: "primary"
    }
  ];

  // Mock data for AI services
  const aiServices = [
    {
      title: "Text Generation Studio",
      description: "Create content with advanced AI models",
      icon: "FileText",
      path: "/text-studio",
      usage: 1250,
      limit: 2000,
      color: "secondary"
    },
    {
      title: "Image Processing Lab",
      description: "Transform and enhance images with AI",
      icon: "Image",
      path: "/ai-image-processing-lab",
      usage: 450,
      limit: 1000,
      color: "warning"
    },
    {
      title: "Data Analysis Workspace",
      description: "Analyze data with machine learning",
      icon: "BarChart3",
      path: "/data-workspace",
      usage: 320,
      limit: 500,
      color: "success"
    }
  ];

  // Mock data for recent activities
  const recentActivities = [
    {
      id: 1,
      title: "Blog Post Generation Completed",
      description: "Generated 5 blog posts about sustainable technology trends for Q4 marketing campaign",
      type: "text",
      status: "completed",
      timestamp: new Date(Date.now() - 1800000),
      duration: "2m 34s"
    },
    {
      id: 2,
      title: "Product Image Enhancement",
      description: "Enhanced 24 product images with background removal and color correction",
      type: "image",
      status: "processing",
      timestamp: new Date(Date.now() - 3600000),
      duration: "5m 12s"
    },
    {
      id: 3,
      title: "Sales Data Analysis",
      description: "Analyzed Q3 sales performance across 12 regions with predictive insights",
      type: "data",
      status: "completed",
      timestamp: new Date(Date.now() - 7200000),
      duration: "8m 45s"
    },
    {
      id: 4,
      title: "Document Upload",
      description: "Uploaded training dataset for custom model development",
      type: "upload",
      status: "completed",
      timestamp: new Date(Date.now() - 10800000),
      duration: "1m 23s"
    },
    {
      id: 5,
      title: "API Integration Test",
      description: "Tested new API endpoints for real-time text processing",
      type: "text",
      status: "failed",
      timestamp: new Date(Date.now() - 14400000),
      duration: "0m 45s"
    }
  ];

  // Mock data for recent projects
  const recentProjects = [
    {
      id: 1,
      name: "E-commerce Product Descriptions",
      description: "AI-generated product descriptions for online store",
      type: "text",
      status: "active",
      lastModified: new Date(Date.now() - 3600000),
      shared: true
    },
    {
      id: 2,
      name: "Marketing Campaign Images",
      description: "Social media visuals for holiday campaign",
      type: "image",
      status: "completed",
      lastModified: new Date(Date.now() - 7200000),
      shared: false
    },
    {
      id: 3,
      name: "Customer Behavior Analysis",
      description: "Predictive analytics for customer retention",
      type: "data",
      status: "in-progress",
      lastModified: new Date(Date.now() - 10800000),
      shared: true
    },
    {
      id: 4,
      name: "Chatbot Training Data",
      description: "Conversation dataset for customer support bot",
      type: "chat",
      status: "completed",
      lastModified: new Date(Date.now() - 86400000),
      shared: false
    }
  ];

  // Mock data for system status
  const systemServices = [
    {
      id: 1,
      name: "Text Generation API",
      icon: "FileText",
      status: "operational",
      responseTime: 245,
      lastIncident: "None"
    },
    {
      id: 2,
      name: "Image Processing API",
      icon: "Image",
      status: "operational",
      responseTime: 1200,
      lastIncident: "2 days ago"
    },
    {
      id: 3,
      name: "Data Analysis Engine",
      icon: "BarChart3",
      status: "degraded",
      responseTime: 3400,
      lastIncident: "4 hours ago"
    },
    {
      id: 4,
      name: "Authentication Service",
      icon: "Shield",
      status: "operational",
      responseTime: 120,
      lastIncident: "None"
    }
  ];

  // Mock data for quick actions
  const quickActions = [
    {
      id: 1,
      title: "Generate Content",
      description: "Create new text content",
      icon: "PenTool",
      type: "primary",
      path: "/text-studio"
    },
    {
      id: 2,
      title: "Process Images",
      description: "Enhance or transform images",
      icon: "ImageIcon",
      type: "secondary",
      path: "/ai-image-processing-lab"
    },
    {
      id: 3,
      title: "Analyze Data",
      description: "Run data analysis",
      icon: "TrendingUp",
      type: "success",
      path: "/data-workspace"
    },
    {
      id: 4,
      title: "Upload Files",
      description: "Add new training data",
      icon: "Upload",
      type: "warning",
      onClick: () => console.log('Upload clicked')
    }
  ];

  // Mock data for recommendations
  const recommendations = [
    {
      id: 1,
      title: "Optimize API Usage",
      description: "You\'re approaching your monthly API limit. Consider upgrading your plan or optimizing your requests to avoid service interruption.",
      icon: "AlertTriangle",
      priority: "high",
      impact: "Cost savings",
      timeToComplete: "5 min",
      actionText: "Upgrade Plan",
      actionPath: "/billing"
    },
    {
      id: 2,
      title: "Try Image Enhancement",
      description: "Based on your text generation usage, you might benefit from our new image enhancement features for complete content creation.",
      icon: "Sparkles",
      priority: "medium",
      impact: "Productivity boost",
      timeToComplete: "2 min",
      actionText: "Explore Feature",
      actionPath: "/ai-image-processing-lab"
    },
    {
      id: 3,
      title: "Enable Auto-backup",
      description: "Protect your projects by enabling automatic backups. This ensures your work is always safe and recoverable.",
      icon: "Shield",
      priority: "low",
      impact: "Data security",
      timeToComplete: "1 min",
      actionText: "Enable Now",
      onAction: () => console.log('Auto-backup enabled')
    }
  ];

  const formatGreeting = () => {
    const hour = currentTime?.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className={`pt-16 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {formatGreeting()}, John! 👋
                </h1>
                <p className="text-muted-foreground">
                  Welcome back to your AI command center. Here's what's happening today.
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {currentTime?.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentTime?.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <Button variant="outline" iconName="Settings" iconPosition="left">
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metricsData?.map((metric, index) => (
              <MetricsCard key={index} {...metric} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* AI Services - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">AI Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {aiServices?.map((service, index) => (
                    <ServiceTile key={index} {...service} />
                  ))}
                </div>
              </div>

              {/* Activity Feed */}
              <ActivityFeed activities={recentActivities} />
            </div>

            {/* Right Sidebar Content */}
            <div className="space-y-6">
              <RecentProjects projects={recentProjects} />
              <SystemStatus services={systemServices} />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickActions actions={quickActions} />
            <RecommendationCard recommendations={recommendations} />
          </div>

          {/* Footer Stats */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">99.9%</p>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">1.2s</p>
                <p className="text-sm text-muted-foreground">Avg Response</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">50K+</p>
                <p className="text-sm text-muted-foreground">Requests Today</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">24/7</p>
                <p className="text-sm text-muted-foreground">Support</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainDashboard;