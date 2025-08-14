import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ContentTemplates = ({ onTemplateSelect, selectedTemplate }) => {
  const [expandedCategory, setExpandedCategory] = useState('marketing');

  const templates = {
    marketing: [
      {
        id: 'blog-post',
        name: 'Blog Post',
        icon: 'FileText',
        description: 'SEO-optimized blog articles',
        prompt: 'Write a comprehensive blog post about [TOPIC]. Include an engaging introduction, well-structured sections with subheadings, and a compelling conclusion. Make it SEO-friendly and informative.'
      },
      {
        id: 'email-campaign',
        name: 'Email Campaign',
        icon: 'Mail',
        description: 'Marketing email templates',
        prompt: 'Create a compelling email campaign for [PRODUCT/SERVICE]. Include a catchy subject line, engaging opening, clear value proposition, and strong call-to-action.'
      },
      {
        id: 'social-media',
        name: 'Social Media Post',
        icon: 'Share2',
        description: 'Engaging social content',
        prompt: 'Create engaging social media posts for [PLATFORM] about [TOPIC]. Include relevant hashtags, compelling copy, and encourage engagement.'
      },
      {
        id: 'product-description',
        name: 'Product Description',
        icon: 'Package',
        description: 'Compelling product copy',
        prompt: 'Write a compelling product description for [PRODUCT]. Highlight key features, benefits, and unique selling points. Make it persuasive and conversion-focused.'
      }
    ],
    business: [
      {
        id: 'proposal',
        name: 'Business Proposal',
        icon: 'Briefcase',
        description: 'Professional proposals',
        prompt: 'Create a professional business proposal for [PROJECT/SERVICE]. Include executive summary, scope of work, timeline, and pricing structure.'
      },
      {
        id: 'press-release',
        name: 'Press Release',
        icon: 'Newspaper',
        description: 'News announcements',
        prompt: 'Write a professional press release announcing [NEWS/EVENT]. Follow standard press release format with compelling headline and newsworthy content.'
      },
      {
        id: 'job-description',
        name: 'Job Description',
        icon: 'Users',
        description: 'Hiring documentation',
        prompt: 'Create a comprehensive job description for [POSITION]. Include role overview, key responsibilities, required qualifications, and company benefits.'
      }
    ],
    creative: [
      {
        id: 'story',
        name: 'Creative Story',
        icon: 'BookOpen',
        description: 'Fiction and narratives',
        prompt: 'Write a creative story about [THEME/CHARACTER]. Include engaging plot, well-developed characters, and vivid descriptions. Make it captivating and original.'
      },
      {
        id: 'poem',
        name: 'Poetry',
        icon: 'Feather',
        description: 'Poems and verses',
        prompt: 'Create a poem about [THEME]. Use vivid imagery, emotional depth, and appropriate rhythm. Choose a style that fits the subject matter.'
      },
      {
        id: 'script',
        name: 'Script Writing',
        icon: 'Video',
        description: 'Video and dialogue scripts',
        prompt: 'Write a script for [TYPE] about [TOPIC]. Include engaging dialogue, clear scene descriptions, and proper formatting.'
      }
    ]
  };

  const categories = [
    { id: 'marketing', name: 'Marketing', icon: 'TrendingUp' },
    { id: 'business', name: 'Business', icon: 'Building' },
    { id: 'creative', name: 'Creative', icon: 'Palette' }
  ];

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Content Templates</h3>
        <Button variant="ghost" size="sm" iconName="Plus" iconSize={14}>
          Custom
        </Button>
      </div>
      <div className="space-y-2">
        {categories?.map((category) => (
          <div key={category?.id} className="border border-border rounded-lg">
            <button
              onClick={() => toggleCategory(category?.id)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-accent hover:text-accent-foreground spring-animation"
            >
              <div className="flex items-center space-x-2">
                <Icon name={category?.icon} size={16} />
                <span className="text-sm font-medium">{category?.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({templates?.[category?.id]?.length})
                </span>
              </div>
              <Icon 
                name={expandedCategory === category?.id ? "ChevronUp" : "ChevronDown"} 
                size={16} 
              />
            </button>

            {expandedCategory === category?.id && (
              <div className="border-t border-border">
                {templates?.[category?.id]?.map((template) => (
                  <button
                    key={template?.id}
                    onClick={() => onTemplateSelect(template)}
                    className={`w-full p-3 text-left hover:bg-accent hover:text-accent-foreground spring-animation border-b border-border last:border-b-0 ${
                      selectedTemplate?.id === template?.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon name={template?.icon} size={16} className="mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">
                          {template?.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {template?.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-3 bg-muted/50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Lightbulb" size={16} className="text-warning mt-0.5" />
          <div>
            <p className="text-xs font-medium text-foreground">Pro Tip</p>
            <p className="text-xs text-muted-foreground mt-1">
              Customize templates by editing the prompt after selection. Save your modifications as new templates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentTemplates;