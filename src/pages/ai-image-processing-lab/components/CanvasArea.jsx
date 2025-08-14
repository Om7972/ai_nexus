import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const CanvasArea = ({ 
  selectedImage, 
  processedImage, 
  isProcessing, 
  onImageProcess,
  selectedTool 
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showComparison, setShowComparison] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 500));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 25));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 100) {
      setIsDragging(true);
      setDragStart({
        x: e?.clientX - panPosition?.x,
        y: e?.clientY - panPosition?.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 100) {
      setPanPosition({
        x: e?.clientX - dragStart?.x,
        y: e?.clientY - dragStart?.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const getToolDescription = (tool) => {
    const descriptions = {
      'enhance': 'Improve image quality and sharpness using AI enhancement algorithms',
      'upscale': 'Increase image resolution while preserving quality and details',
      'style-transfer': 'Apply artistic styles and filters to transform image appearance',
      'background-removal': 'Automatically detect and remove image background',
      'colorize': 'Add realistic colors to black and white photographs',
      'denoise': 'Remove noise and grain from images for cleaner results',
      'restore': 'Repair damaged or old photographs using AI restoration',
      'artistic': 'Apply creative artistic effects and transformations'
    };
    return descriptions?.[tool] || 'Select a tool to process your image';
  };

  return (
    <div className="flex-1 bg-muted/30 flex flex-col">
      {/* Canvas Controls */}
      <div className="bg-card border-b border-border p-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="ZoomOut"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 25}
            />
            <span className="text-sm font-medium text-foreground min-w-16 text-center">
              {zoomLevel}%
            </span>
            <Button
              variant="outline"
              size="sm"
              iconName="ZoomIn"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 500}
            />
            <Button
              variant="ghost"
              size="sm"
              iconName="RotateCcw"
              onClick={handleResetZoom}
            >
              Reset
            </Button>
          </div>

          {processedImage && (
            <Button
              variant={showComparison ? "default" : "outline"}
              size="sm"
              iconName="SplitSquareHorizontal"
              onClick={() => setShowComparison(!showComparison)}
            >
              Compare
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {selectedImage && !isProcessing && (
            <Button
              variant="secondary"
              size="sm"
              iconName="Play"
              iconPosition="left"
              onClick={() => onImageProcess(selectedImage, selectedTool)}
            >
              Process Image
            </Button>
          )}
          
          {processedImage && (
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
            >
              Export
            </Button>
          )}
        </div>
      </div>
      {/* Canvas Content */}
      <div className="flex-1 relative overflow-hidden">
        {!selectedImage ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Icon name="ImagePlus" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Image Selected
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Upload an image from the left panel to start processing with AI tools
              </p>
            </div>
          </div>
        ) : (
          <div
            ref={canvasRef}
            className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
          >
            {showComparison && processedImage ? (
              <div className="flex items-center space-x-4">
                {/* Original Image */}
                <div className="text-center">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-foreground bg-card px-3 py-1 rounded-full">
                      Original
                    </span>
                  </div>
                  <div
                    className="border border-border rounded-lg overflow-hidden shadow-lg"
                    style={{
                      transform: `scale(${zoomLevel / 100}) translate(${panPosition?.x}px, ${panPosition?.y}px)`,
                      maxWidth: '400px',
                      maxHeight: '400px'
                    }}
                  >
                    <Image
                      src={selectedImage?.url}
                      alt="Original"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Processed Image */}
                <div className="text-center">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-foreground bg-secondary px-3 py-1 rounded-full">
                      Processed
                    </span>
                  </div>
                  <div
                    className="border border-border rounded-lg overflow-hidden shadow-lg"
                    style={{
                      transform: `scale(${zoomLevel / 100}) translate(${panPosition?.x}px, ${panPosition?.y}px)`,
                      maxWidth: '400px',
                      maxHeight: '400px'
                    }}
                  >
                    <Image
                      src={processedImage?.url}
                      alt="Processed"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div
                  className="border border-border rounded-lg overflow-hidden shadow-lg relative"
                  style={{
                    transform: `scale(${zoomLevel / 100}) translate(${panPosition?.x}px, ${panPosition?.y}px)`,
                    maxWidth: '80vw',
                    maxHeight: '70vh'
                  }}
                >
                  <Image
                    src={processedImage ? processedImage?.url : selectedImage?.url}
                    alt={selectedImage?.name}
                    className="w-full h-full object-contain"
                  />
                  
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="bg-card rounded-lg p-6 text-center">
                        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm font-medium text-foreground mb-1">
                          Processing Image
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Applying {selectedTool} enhancement...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 max-w-md">
                  <p className="text-sm text-muted-foreground">
                    {getToolDescription(selectedTool)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Image Info Bar */}
      {selectedImage && (
        <div className="bg-card border-t border-border p-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-foreground font-medium">
                {selectedImage?.name}
              </span>
              <span className="text-muted-foreground">
                {selectedImage?.width || 'Unknown'} × {selectedImage?.height || 'Unknown'}
              </span>
              <span className="text-muted-foreground">
                {(selectedImage?.size / 1024 / 1024)?.toFixed(2)} MB
              </span>
            </div>
            
            {processedImage && (
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={16} className="text-success" />
                <span className="text-success text-sm">Processing Complete</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasArea;