import React, { useState, useRef, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const TextEditor = ({ 
  prompt, 
  onPromptChange, 
  generatedContent, 
  onGenerate, 
  onRegenerate, 
  onRefine, 
  isGenerating, 
  wordCount,
  onContentChange 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const contentRef = useRef(null);
  const promptRef = useRef(null);

  useEffect(() => {
    if (promptRef?.current) {
      promptRef.current.style.height = 'auto';
      promptRef.current.style.height = promptRef?.current?.scrollHeight + 'px';
    }
  }, [prompt]);

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    if (contentRef?.current) {
      onContentChange(contentRef?.current?.innerHTML);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    setSelectedText(selection?.toString());
  };

  const insertAtCursor = (text) => {
    const selection = window.getSelection();
    if (selection?.rangeCount > 0) {
      const range = selection?.getRangeAt(0);
      range?.deleteContents();
      range?.insertNode(document.createTextNode(text));
    }
  };

  const formatButtons = [
    { command: 'bold', icon: 'Bold', title: 'Bold (Ctrl+B)' },
    { command: 'italic', icon: 'Italic', title: 'Italic (Ctrl+I)' },
    { command: 'underline', icon: 'Underline', title: 'Underline (Ctrl+U)' },
    { command: 'strikeThrough', icon: 'Strikethrough', title: 'Strikethrough' },
  ];

  const listButtons = [
    { command: 'insertUnorderedList', icon: 'List', title: 'Bullet List' },
    { command: 'insertOrderedList', icon: 'ListOrdered', title: 'Numbered List' },
  ];

  const alignButtons = [
    { command: 'justifyLeft', icon: 'AlignLeft', title: 'Align Left' },
    { command: 'justifyCenter', icon: 'AlignCenter', title: 'Align Center' },
    { command: 'justifyRight', icon: 'AlignRight', title: 'Align Right' },
  ];

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Prompt Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Content Prompt</label>
        <div className="relative">
          <textarea
            ref={promptRef}
            value={prompt}
            onChange={(e) => onPromptChange(e?.target?.value)}
            placeholder="Describe what you want to generate... Be specific about topic, audience, and key points to include."
            className="w-full min-h-[100px] max-h-[200px] p-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isGenerating}
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {prompt?.length}/2000
          </div>
        </div>
      </div>
      {/* Generation Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="default"
            onClick={onGenerate}
            disabled={!prompt?.trim() || isGenerating}
            loading={isGenerating}
            iconName="Sparkles"
            iconPosition="left"
          >
            {isGenerating ? 'Generating...' : 'Generate Content'}
          </Button>
          
          {generatedContent && !isGenerating && (
            <>
              <Button
                variant="outline"
                onClick={onRegenerate}
                iconName="RotateCcw"
                iconPosition="left"
                size="sm"
              >
                Regenerate
              </Button>
              <Button
                variant="ghost"
                onClick={onRefine}
                iconName="Wand2"
                iconPosition="left"
                size="sm"
              >
                Refine
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>Words: {wordCount}</span>
          <span>Characters: {generatedContent?.length || 0}</span>
        </div>
      </div>
      {/* Formatting Toolbar */}
      {generatedContent && (
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg border">
          <div className="flex items-center space-x-1">
            {formatButtons?.map((btn) => (
              <Button
                key={btn?.command}
                variant="ghost"
                size="icon"
                onClick={() => formatText(btn?.command)}
                title={btn?.title}
                iconName={btn?.icon}
                iconSize={16}
              />
            ))}
            
            <div className="w-px h-6 bg-border mx-1" />
            
            {listButtons?.map((btn) => (
              <Button
                key={btn?.command}
                variant="ghost"
                size="icon"
                onClick={() => formatText(btn?.command)}
                title={btn?.title}
                iconName={btn?.icon}
                iconSize={16}
              />
            ))}
            
            <div className="w-px h-6 bg-border mx-1" />
            
            {alignButtons?.map((btn) => (
              <Button
                key={btn?.command}
                variant="ghost"
                size="icon"
                onClick={() => formatText(btn?.command)}
                title={btn?.title}
                iconName={btn?.icon}
                iconSize={16}
              />
            ))}
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              iconName={isEditing ? "Eye" : "Edit"}
              iconSize={16}
            >
              {isEditing ? 'Preview' : 'Edit'}
            </Button>
          </div>
        </div>
      )}
      {/* Content Editor */}
      <div className="flex-1 min-h-0">
        {isGenerating ? (
          <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-border">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <p className="text-sm font-medium text-foreground">Generating content...</p>
                <p className="text-xs text-muted-foreground mt-1">This may take a few moments</p>
              </div>
            </div>
          </div>
        ) : generatedContent ? (
          <div
            ref={contentRef}
            contentEditable={isEditing}
            onInput={(e) => onContentChange(e?.target?.innerHTML)}
            onMouseUp={handleTextSelection}
            className={`h-full p-4 bg-background border border-border rounded-lg overflow-auto focus:outline-none focus:ring-2 focus:ring-primary ${
              isEditing ? 'cursor-text' : 'cursor-default'
            }`}
            style={{ minHeight: '300px' }}
            dangerouslySetInnerHTML={{ __html: generatedContent }}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-border">
            <div className="text-center space-y-4 max-w-md">
              <Icon name="FileText" size={48} className="text-muted-foreground mx-auto" />
              <div>
                <p className="text-sm font-medium text-foreground">Ready to generate content</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your prompt above and click "Generate Content" to start creating AI-powered text
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Quick Actions */}
      {generatedContent && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" iconName="Copy" iconSize={16}>
              Copy
            </Button>
            <Button variant="ghost" size="sm" iconName="Download" iconSize={16}>
              Export
            </Button>
            <Button variant="ghost" size="sm" iconName="Share" iconSize={16}>
              Share
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" iconName="Save" iconSize={16}>
              Save Draft
            </Button>
            <Button variant="outline" size="sm" iconName="Send" iconSize={16}>
              Publish
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextEditor;