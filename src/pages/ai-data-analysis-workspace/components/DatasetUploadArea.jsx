import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DatasetUploadArea = ({ onFileUpload, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  const supportedFormats = [
    { extension: 'CSV', description: 'Comma-separated values', icon: 'FileText' },
    { extension: 'XLSX', description: 'Excel spreadsheet', icon: 'FileSpreadsheet' },
    { extension: 'JSON', description: 'JavaScript Object Notation', icon: 'Braces' }
  ];

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
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFileSelect(e?.dataTransfer?.files?.[0]);
    }
  };

  const handleFileSelect = (file) => {
    const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!validTypes?.includes(file?.type) && !file?.name?.match(/\.(csv|xlsx|json)$/i)) {
      alert('Please upload a valid CSV, Excel, or JSON file.');
      return;
    }

    if (file?.size > maxSize) {
      alert('File size must be less than 50MB.');
      return;
    }

    setUploadedFile(file);
    onFileUpload(file);
  };

  const handleFileInputChange = (e) => {
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFileSelect(e?.target?.files?.[0]);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    onFileUpload(null);
    if (fileInputRef?.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Dataset Upload</h3>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Shield" size={16} />
          <span>Secure & Private</span>
        </div>
      </div>
      {!uploadedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.json"
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />
          
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-secondary/20 rounded-full flex items-center justify-center">
              <Icon name="Upload" size={32} color="var(--color-secondary)" />
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-foreground mb-2">
                Drop your dataset here
              </h4>
              <p className="text-muted-foreground mb-4">
                or click to browse files
              </p>
              
              <Button variant="outline" disabled={isProcessing}>
                <Icon name="FolderOpen" size={16} className="mr-2" />
                Choose File
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Maximum file size: 50MB
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icon name="FileText" size={20} color="var(--color-secondary)" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">{uploadedFile?.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(uploadedFile?.size)} • Uploaded {new Date()?.toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm text-success font-medium">Ready</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                disabled={isProcessing}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-foreground mb-3">Supported Formats</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {supportedFormats?.map((format) => (
            <div key={format?.extension} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <Icon name={format?.icon} size={16} color="var(--color-secondary)" />
              <div>
                <div className="text-sm font-medium text-foreground">{format?.extension}</div>
                <div className="text-xs text-muted-foreground">{format?.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DatasetUploadArea;