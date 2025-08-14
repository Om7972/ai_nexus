import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

// Import components
import ModelSelector from './components/ModelSelector';
import ContentTemplates from './components/ContentTemplates';
import ParameterControls from './components/ParameterControls';
import TextEditor from './components/TextEditor';
import GenerationHistory from './components/GenerationHistory';
import ExportOptions from './components/ExportOptions';

const AITextGenerationStudio = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState('templates');
  const [activeRightTab, setActiveRightTab] = useState('history');

  // Generation state
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Parameters state
  const [parameters, setParameters] = useState({
    tone: 'professional',
    length: 'medium',
    creativity: 0.7,
    format: 'paragraph',
    language: 'en',
    includeCitations: false,
    seoOptimized: true,
    includeExamples: false
  });

  // Update word count when content changes
  useEffect(() => {
    if (generatedContent) {
      const text = generatedContent?.replace(/<[^>]*>/g, '');
      const words = text?.trim()?.split(/\s+/)?.filter(word => word?.length > 0);
      setWordCount(words?.length);
    } else {
      setWordCount(0);
    }
  }, [generatedContent]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setPrompt(template?.prompt || '');
  };

  const handleParameterChange = (key, value) => {
    if (key === 'reset') {
      setParameters({
        tone: 'professional',
        length: 'medium',
        creativity: 0.7,
        format: 'paragraph',
        language: 'en',
        includeCitations: false,
        seoOptimized: true,
        includeExamples: false
      });
    } else {
      setParameters(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleGenerate = async () => {
    if (!prompt?.trim()) return;
    
    setIsGenerating(true);
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock generated content based on template and parameters
      const mockContent = generateMockContent(selectedTemplate, prompt, parameters);
      setGeneratedContent(mockContent);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleRefine = async () => {
    if (!generatedContent) return;
    
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Mock refined content
      const refinedContent = generatedContent + '\n\n[Refined section with additional insights and improved clarity based on your feedback.]';
      setGeneratedContent(refinedContent);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHistorySelect = (item) => {
    if (item?.preview) {
      setGeneratedContent(item?.preview);
      setPrompt(item?.title);
    }
  };

  const handleSaveTemplate = (item) => {
    console.log('Saving template:', item);
    // Implementation for saving custom templates
  };

  const handleExport = (format, content) => {
    console.log('Exporting as:', format, content);
    // Implementation for export functionality
  };

  const handlePublish = (platform, content) => {
    console.log('Publishing to:', platform, content);
    // Implementation for publishing functionality
  };

  const generateMockContent = (template, userPrompt, params) => {
    const templates = {
      'blog-post': `# ${userPrompt?.replace('Write a comprehensive blog post about ', '')?.replace('[TOPIC]', 'Advanced AI Technologies')}

## Introduction

In today's rapidly evolving technological landscape, artificial intelligence continues to reshape how we approach complex problems and create innovative solutions. This comprehensive exploration delves into the latest developments and their practical applications.

## Key Developments

### Machine Learning Advancements
Recent breakthroughs in machine learning have opened new possibilities for automation and intelligent decision-making. These developments include:

- Enhanced neural network architectures
- Improved training methodologies
- Better data processing capabilities

### Real-World Applications
The practical implementation of AI technologies spans across multiple industries:

1. **Healthcare**: Diagnostic assistance and treatment optimization
2. **Finance**: Risk assessment and fraud detection
3. **Manufacturing**: Quality control and predictive maintenance

## Future Implications

As we look toward the future, the integration of AI technologies promises to deliver even more sophisticated solutions. Organizations that embrace these innovations will likely gain significant competitive advantages.

## Conclusion

The continued evolution of AI represents one of the most significant technological shifts of our time. By understanding and leveraging these capabilities, businesses and individuals can unlock new opportunities for growth and innovation.`,

      'email-campaign': `Subject: Unlock the Future with Advanced AI SolutionsDear Valued Customer,We're excited to share some groundbreaking developments that will transform how you approach your daily challenges.

**What's New:**
Our latest AI-powered platform offers unprecedented capabilities in content generation, data analysis, and automated workflows. These tools are designed to save you time while delivering exceptional results.

**Key Benefits:**
• Increase productivity by up to 300%
• Reduce manual tasks and human error
• Access enterprise-grade AI technology
• 24/7 customer support and training

**Limited Time Offer:**
For the next 7 days, we're offering early access to our premium features at a special introductory price. This is your opportunity to be among the first to experience the future of AI-powered productivity.

**Ready to Get Started?**
Click the button below to schedule your personalized demo and see how our platform can revolutionize your workflow.

[Schedule Demo Now]

Best regards,
The AI Nexus Team

P.S. Don't miss out on this exclusive opportunity. Our early access program has limited spots available.`,'social-media': `🚀 Exciting news! We're launching something incredible that will change how you work with AI. Imagine having a personal AI assistant that understands your needs, learns from your preferences, and delivers exactly what you're looking for – every single time.

✨ What makes this special:
• Intuitive interface that feels natural
• Lightning-fast processing speeds
• Customizable to your specific workflow
• Enterprise-grade security and privacy

The future of productivity is here, and it's more accessible than ever before.

Who's ready to transform their workflow? Drop a 🤖 in the comments if you want early access!

#AI #Productivity #Innovation #Technology #Future #Automation #WorkSmarter`,

      'product-description': `**Introducing the Next Generation of Wearable Technology**

Experience the perfect fusion of style, functionality, and cutting-edge innovation with our latest smartwatch. Designed for the modern professional who demands excellence in every aspect of their digital life.

**Key Features:**
• **Advanced Health Monitoring**: Track heart rate, sleep patterns, stress levels, and more with medical-grade accuracy
• **Extended Battery Life**: Up to 7 days of continuous use on a single charge
• **Premium Materials**: Aerospace-grade aluminum with sapphire crystal display
• **Smart Connectivity**: Seamless integration with all your devices and apps
• **Water Resistant**: IPX8 rating for all-weather durability

**Why Choose Our Smartwatch:**
This isn't just another wearable device – it's your personal health coach, productivity assistant, and style statement all in one. With AI-powered insights and personalized recommendations, it adapts to your lifestyle and helps you achieve your goals.

**Perfect For:**
- Fitness enthusiasts tracking performance metrics
- Busy professionals managing schedules and notifications
- Health-conscious individuals monitoring wellness data
- Style-conscious users wanting premium aesthetics

**Available in three sophisticated colors:** Midnight Black, Silver, and Rose Gold.

Order now and experience the future of wearable technology. Free shipping and 30-day money-back guarantee included.`
    };

    const baseContent = templates?.[template?.id] || `Based on your prompt: "${userPrompt}"

This is a comprehensive response generated using the ${selectedModel} model with the following parameters:
- Tone: ${params?.tone}
- Length: ${params?.length}
- Creativity Level: ${params?.creativity}
- Format: ${params?.format}
- Language: ${params?.language}

The content has been optimized according to your specifications and includes relevant examples and insights tailored to your requirements. The AI has considered your target audience and objectives to deliver the most effective messaging.

Key points covered:
1. Introduction to the main topic
2. Detailed analysis and explanation
3. Practical applications and examples
4. Actionable insights and recommendations
5. Conclusion with next steps

This content is ready for use and can be further customized based on your specific needs and brand guidelines.`;

    return baseContent;
  };

  const leftTabs = [
    { id: 'model', label: 'Model', icon: 'Cpu' },
    { id: 'templates', label: 'Templates', icon: 'FileTemplate' },
    { id: 'parameters', label: 'Parameters', icon: 'Settings' }
  ];

  const rightTabs = [
    { id: 'history', label: 'History', icon: 'History' },
    { id: 'export', label: 'Export', icon: 'Download' }
  ];

  return (
    <>
      <Helmet>
        <title>AI Text Generation Studio - AI Nexus</title>
        <meta name="description" content="Create high-quality content with advanced AI text generation tools. Professional writing assistant for blogs, emails, marketing copy, and more." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />

        <main className={`pt-16 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <div className="h-[calc(100vh-4rem)] flex">
            {/* Left Panel */}
            <div className={`transition-all duration-300 border-r border-border bg-background ${
              leftPanelCollapsed ? 'w-12' : 'w-80'
            }`}>
              <div className="h-full flex flex-col">
                {/* Left Panel Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  {!leftPanelCollapsed && (
                    <div className="flex space-x-1 bg-muted/50 rounded-lg p-1">
                      {leftTabs?.map((tab) => (
                        <button
                          key={tab?.id}
                          onClick={() => setActiveLeftTab(tab?.id)}
                          className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-md spring-animation ${
                            activeLeftTab === tab?.id
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Icon name={tab?.icon} size={14} />
                          <span>{tab?.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                    iconName={leftPanelCollapsed ? "ChevronRight" : "ChevronLeft"}
                    iconSize={16}
                  />
                </div>

                {/* Left Panel Content */}
                {!leftPanelCollapsed && (
                  <div className="flex-1 p-4 overflow-auto">
                    {activeLeftTab === 'model' && (
                      <ModelSelector
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                        isGenerating={isGenerating}
                      />
                    )}
                    {activeLeftTab === 'templates' && (
                      <ContentTemplates
                        onTemplateSelect={handleTemplateSelect}
                        selectedTemplate={selectedTemplate}
                      />
                    )}
                    {activeLeftTab === 'parameters' && (
                      <ParameterControls
                        parameters={parameters}
                        onParameterChange={handleParameterChange}
                        isGenerating={isGenerating}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Center Panel - Text Editor */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border bg-background">
                <div className="flex items-center space-x-4">
                  <h1 className="text-lg font-semibold text-foreground">Text Generation Studio</h1>
                  {selectedTemplate && (
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                      {selectedTemplate?.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" iconName="Save" iconSize={16}>
                    Save Draft
                  </Button>
                  <Button variant="ghost" size="sm" iconName="MoreHorizontal" iconSize={16} />
                </div>
              </div>

              <div className="flex-1 p-4">
                <TextEditor
                  prompt={prompt}
                  onPromptChange={setPrompt}
                  generatedContent={generatedContent}
                  onGenerate={handleGenerate}
                  onRegenerate={handleRegenerate}
                  onRefine={handleRefine}
                  isGenerating={isGenerating}
                  wordCount={wordCount}
                  onContentChange={setGeneratedContent}
                />
              </div>
            </div>

            {/* Right Panel */}
            <div className={`transition-all duration-300 border-l border-border bg-background ${
              rightPanelCollapsed ? 'w-12' : 'w-80'
            }`}>
              <div className="h-full flex flex-col">
                {/* Right Panel Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                    iconName={rightPanelCollapsed ? "ChevronLeft" : "ChevronRight"}
                    iconSize={16}
                  />
                  {!rightPanelCollapsed && (
                    <div className="flex space-x-1 bg-muted/50 rounded-lg p-1">
                      {rightTabs?.map((tab) => (
                        <button
                          key={tab?.id}
                          onClick={() => setActiveRightTab(tab?.id)}
                          className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-md spring-animation ${
                            activeRightTab === tab?.id
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Icon name={tab?.icon} size={14} />
                          <span>{tab?.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Panel Content */}
                {!rightPanelCollapsed && (
                  <div className="flex-1 p-4 overflow-auto">
                    {activeRightTab === 'history' && (
                      <GenerationHistory
                        onHistorySelect={handleHistorySelect}
                        onSaveTemplate={handleSaveTemplate}
                      />
                    )}
                    {activeRightTab === 'export' && (
                      <ExportOptions
                        content={generatedContent}
                        onExport={handleExport}
                        onPublish={handlePublish}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AITextGenerationStudio;