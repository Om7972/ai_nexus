import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const ExportOptions = ({ content, onExport, onPublish }) => {
  const [exportFormat, setExportFormat] = useState('docx');
  const [publishPlatform, setPublishPlatform] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const exportFormats = [
    { value: 'docx', label: 'Word Document (.docx)', description: 'Microsoft Word format' },
    { value: 'pdf', label: 'PDF Document (.pdf)', description: 'Portable document format' },
    { value: 'txt', label: 'Plain Text (.txt)', description: 'Simple text file' },
    { value: 'html', label: 'HTML File (.html)', description: 'Web page format' },
    { value: 'md', label: 'Markdown (.md)', description: 'Markdown format' },
    { value: 'rtf', label: 'Rich Text (.rtf)', description: 'Rich text format' }
  ];

  const publishPlatforms = [
    { value: 'wordpress', label: 'WordPress', description: 'Publish to WordPress site' },
    { value: 'medium', label: 'Medium', description: 'Publish to Medium platform' },
    { value: 'linkedin', label: 'LinkedIn', description: 'Share on LinkedIn' },
    { value: 'twitter', label: 'Twitter', description: 'Share as Twitter thread' },
    { value: 'facebook', label: 'Facebook', description: 'Post to Facebook' },
    { value: 'ghost', label: 'Ghost', description: 'Publish to Ghost blog' },
    { value: 'substack', label: 'Substack', description: 'Send as newsletter' }
  ];

  const handleExport = async () => {
    if (!content) return;
    
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      onExport(exportFormat, content);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePublish = async () => {
    if (!content || !publishPlatform) return;
    
    setIsPublishing(true);
    try {
      // Simulate publish process
      await new Promise(resolve => setTimeout(resolve, 3000));
      onPublish(publishPlatform, content);
    } finally {
      setIsPublishing(false);
    }
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case 'docx': return 'FileText';
      case 'pdf': return 'File';
      case 'txt': return 'FileText';
      case 'html': return 'Code';
      case 'md': return 'Hash';
      case 'rtf': return 'FileText';
      default: return 'Download';
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'wordpress': return 'Globe';
      case 'medium': return 'Edit';
      case 'linkedin': return 'Linkedin';
      case 'twitter': return 'Twitter';
      case 'facebook': return 'Facebook';
      case 'ghost': return 'Ghost';
      case 'substack': return 'Mail';
      default: return 'Share';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Export & Publish</h3>
        <Icon name="Download" size={16} className="text-muted-foreground" />
      </div>
      {/* Export Section */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Export Options</h4>
          
          <Select
            label="Export Format"
            description="Choose your preferred file format"
            options={exportFormats}
            value={exportFormat}
            onChange={setExportFormat}
            disabled={!content || isExporting}
          />
        </div>

        <Button
          variant="outline"
          onClick={handleExport}
          disabled={!content || isExporting}
          loading={isExporting}
          iconName={getFormatIcon(exportFormat)}
          iconPosition="left"
          fullWidth
        >
          {isExporting ? 'Exporting...' : `Export as ${exportFormats?.find(f => f?.value === exportFormat)?.label?.split(' ')?.[0]}`}
        </Button>

        {/* Quick Export Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setExportFormat('pdf');
              handleExport();
            }}
            disabled={!content || isExporting}
            iconName="File"
            iconPosition="left"
          >
            PDF
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setExportFormat('docx');
              handleExport();
            }}
            disabled={!content || isExporting}
            iconName="FileText"
            iconPosition="left"
          >
            Word
          </Button>
        </div>
      </div>
      {/* Publish Section */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Publish Directly</h4>
          
          <Select
            label="Publishing Platform"
            description="Select where to publish your content"
            options={publishPlatforms}
            value={publishPlatform}
            onChange={setPublishPlatform}
            disabled={!content || isPublishing}
            placeholder="Choose platform..."
            searchable
          />
        </div>

        <Button
          variant="default"
          onClick={handlePublish}
          disabled={!content || !publishPlatform || isPublishing}
          loading={isPublishing}
          iconName={publishPlatform ? getPlatformIcon(publishPlatform) : 'Share'}
          iconPosition="left"
          fullWidth
        >
          {isPublishing ? 'Publishing...' : publishPlatform ? `Publish to ${publishPlatforms?.find(p => p?.value === publishPlatform)?.label}` : 'Select Platform'}
        </Button>

        {/* Social Media Quick Actions */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Quick Share</p>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPublishPlatform('twitter');
                handlePublish();
              }}
              disabled={!content || isPublishing}
              iconName="Twitter"
              iconSize={16}
            >
              Twitter
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPublishPlatform('linkedin');
                handlePublish();
              }}
              disabled={!content || isPublishing}
              iconName="Linkedin"
              iconSize={16}
            >
              LinkedIn
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPublishPlatform('medium');
                handlePublish();
              }}
              disabled={!content || isPublishing}
              iconName="Edit"
              iconSize={16}
            >
              Medium
            </Button>
          </div>
        </div>
      </div>
      {/* Copy & Share */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground">Copy & Share</h4>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (content) {
                navigator.clipboard?.writeText(content);
              }
            }}
            disabled={!content}
            iconName="Copy"
            iconPosition="left"
          >
            Copy Text
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (content && navigator.share) {
                navigator.share({
                  title: 'Generated Content',
                  text: content
                });
              }
            }}
            disabled={!content || !navigator.share}
            iconName="Share"
            iconPosition="left"
          >
            Share
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const blob = new Blob([content || ''], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'generated-content.txt';
            a?.click();
            URL.revokeObjectURL(url);
          }}
          disabled={!content}
          iconName="Download"
          iconPosition="left"
          fullWidth
        >
          Download as Text File
        </Button>
      </div>
      {/* Export History */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Recent Exports</span>
          <Icon name="History" size={16} className="text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Marketing Email.docx</span>
            <span className="text-muted-foreground">2h ago</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Blog Post.pdf</span>
            <span className="text-muted-foreground">1d ago</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Product Description.html</span>
            <span className="text-muted-foreground">3d ago</span>
          </div>
        </div>
      </div>
      {/* Usage Stats */}
      <div className="p-3 bg-card rounded-lg border">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold text-foreground">47</div>
          <div className="text-xs text-muted-foreground">Documents exported this month</div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-secondary h-2 rounded-full" style={{ width: '78%' }} />
          </div>
          <div className="text-xs text-muted-foreground">78% of monthly limit</div>
        </div>
      </div>
    </div>
  );
};

export default ExportOptions;