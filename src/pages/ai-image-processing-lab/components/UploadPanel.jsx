import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const UploadPanel = ({ 
  uploadedImages, 
  onImageUpload, 
  onImageSelect, 
  selectedImageId,
  onImageDelete,
  processingQueue 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e?.dataTransfer?.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e?.target?.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files?.filter(file => file?.type?.startsWith('image/'));
    imageFiles?.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          name: file?.name,
          size: file?.size,
          url: e?.target?.result,
          originalFile: file,
          uploadedAt: new Date()
        };
        onImageUpload(newImage);
      };
      reader?.readAsDataURL(file);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const getQueueStatus = (imageId) => {
    const queueItem = processingQueue?.find(item => item?.imageId === imageId);
    return queueItem ? queueItem?.status : null;
  };

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-full">
      {/* Upload Area */}
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Upload Images</h3>
        
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-secondary bg-secondary/10' :'border-border hover:border-secondary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Icon name="Upload" size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-foreground mb-2">
            Drag & drop images here
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            or click to browse files
          </p>
          <Button
            variant="outline"
            size="sm"
            iconName="FolderOpen"
            iconPosition="left"
            onClick={() => fileInputRef?.current?.click()}
          >
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          Supported formats: JPG, PNG, GIF, WebP, BMP
        </div>
      </div>
      {/* Uploaded Images */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-foreground">
            Images ({uploadedImages?.length})
          </h4>
          {uploadedImages?.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              iconName="Trash2"
              onClick={() => uploadedImages?.forEach(img => onImageDelete(img?.id))}
            >
              Clear All
            </Button>
          )}
        </div>

        {uploadedImages?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="ImageOff" size={48} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No images uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {uploadedImages?.map((image) => {
              const queueStatus = getQueueStatus(image?.id);
              return (
                <div
                  key={image?.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedImageId === image?.id
                      ? 'border-secondary bg-secondary/10' :'border-border hover:border-secondary/50'
                  }`}
                  onClick={() => onImageSelect(image?.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={image?.url}
                        alt={image?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {image?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(image?.size)}
                      </p>
                      {queueStatus && (
                        <div className="flex items-center space-x-1 mt-1">
                          {queueStatus === 'processing' && (
                            <>
                              <div className="w-3 h-3 border border-secondary border-t-transparent rounded-full animate-spin" />
                              <span className="text-xs text-secondary">Processing</span>
                            </>
                          )}
                          {queueStatus === 'completed' && (
                            <>
                              <Icon name="CheckCircle" size={12} className="text-success" />
                              <span className="text-xs text-success">Completed</span>
                            </>
                          )}
                          {queueStatus === 'error' && (
                            <>
                              <Icon name="XCircle" size={12} className="text-destructive" />
                              <span className="text-xs text-destructive">Error</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      iconName="X"
                      iconSize={14}
                      onClick={(e) => {
                        e?.stopPropagation();
                        onImageDelete(image?.id);
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Processing Queue */}
      {processingQueue?.length > 0 && (
        <div className="p-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">
            Processing Queue ({processingQueue?.length})
          </h4>
          <div className="space-y-2">
            {processingQueue?.slice(0, 3)?.map((item, index) => (
              <div key={item?.id} className="flex items-center space-x-2 text-xs">
                <div className="w-2 h-2 bg-secondary rounded-full" />
                <span className="text-muted-foreground truncate flex-1">
                  {item?.operation} - Position {index + 1}
                </span>
                <span className="text-muted-foreground">
                  {item?.estimatedTime}
                </span>
              </div>
            ))}
            {processingQueue?.length > 3 && (
              <div className="text-xs text-muted-foreground text-center">
                +{processingQueue?.length - 3} more in queue
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPanel;