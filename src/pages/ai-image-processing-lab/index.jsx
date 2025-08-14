import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import ToolbarPanel from './components/ToolbarPanel';
import UploadPanel from './components/UploadPanel';
import CanvasArea from './components/CanvasArea';
import ParameterPanel from './components/ParameterPanel';

const AIImageProcessingLab = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTool, setSelectedTool] = useState('enhance');
  const [selectedModel, setSelectedModel] = useState('real-esrgan');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingQueue, setProcessingQueue] = useState([]);
  const [parameters, setParameters] = useState({
    strength: 0.7,
    noiseReduction: 0.5,
    scaleFactor: '2x',
    detailPreservation: 0.8,
    styleIntensity: 0.6,
    contentPreservation: 0.7
  });

  // Mock processed images for demonstration
  const mockProcessedImages = {
    'enhance': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=enhance',
    'upscale': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=900&fit=crop',
    'style-transfer': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&sepia=100',
    'background-removal': 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=600&fit=crop',
    'colorize': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&sat=2',
    'denoise': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&sharp=100',
    'restore': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&contrast=120',
    'artistic': 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=600&fit=crop&blur=2'
  };

  const selectedImage = uploadedImages?.find(img => img?.id === selectedImageId);

  const handleImageUpload = (newImage) => {
    setUploadedImages(prev => [...prev, newImage]);
    if (!selectedImageId) {
      setSelectedImageId(newImage?.id);
    }
  };

  const handleImageSelect = (imageId) => {
    setSelectedImageId(imageId);
    setProcessedImage(null);
  };

  const handleImageDelete = (imageId) => {
    setUploadedImages(prev => prev?.filter(img => img?.id !== imageId));
    if (selectedImageId === imageId) {
      const remaining = uploadedImages?.filter(img => img?.id !== imageId);
      setSelectedImageId(remaining?.length > 0 ? remaining?.[0]?.id : null);
      setProcessedImage(null);
    }
  };

  const handleImageProcess = async (image, tool) => {
    if (!image || isProcessing) return;

    setIsProcessing(true);
    
    // Add to processing queue
    const queueItem = {
      id: Date.now(),
      imageId: image?.id,
      operation: tool,
      status: 'processing',
      estimatedTime: '2-3 min'
    };
    
    setProcessingQueue(prev => [...prev, queueItem]);

    // Simulate processing delay
    setTimeout(() => {
      const processedUrl = mockProcessedImages?.[tool] || image?.url;
      setProcessedImage({
        ...image,
        url: processedUrl,
        processedWith: tool,
        processedAt: new Date()
      });
      
      // Update queue status
      setProcessingQueue(prev => 
        prev?.map(item => 
          item?.id === queueItem?.id 
            ? { ...item, status: 'completed' }
            : item
        )
      );
      
      setIsProcessing(false);
      
      // Remove from queue after delay
      setTimeout(() => {
        setProcessingQueue(prev => prev?.filter(item => item?.id !== queueItem?.id));
      }, 3000);
    }, 3000);
  };

  const handleBatchProcess = () => {
    if (uploadedImages?.length === 0) return;
    
    uploadedImages?.forEach((image, index) => {
      setTimeout(() => {
        handleImageProcess(image, selectedTool);
      }, index * 1000);
    });
  };

  const handleParameterChange = (key, value) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePresetApply = (preset) => {
    // Apply preset parameters based on preset type
    const presetParams = {
      vintage: { strength: 0.6, styleIntensity: 0.8 },
      modern: { strength: 0.8, styleIntensity: 0.4 },
      dramatic: { strength: 0.9, styleIntensity: 0.7 },
      soft: { strength: 0.4, styleIntensity: 0.3 },
      cinematic: { strength: 0.7, styleIntensity: 0.9 },
      'black-white': { strength: 0.5, styleIntensity: 1.0 }
    };
    
    if (presetParams?.[preset?.id]) {
      setParameters(prev => ({
        ...prev,
        ...presetParams?.[preset?.id]
      }));
    }
  };

  const handleExport = () => {
    if (!processedImage && !selectedImage) return;
    
    const imageToExport = processedImage || selectedImage;
    const link = document.createElement('a');
    link.href = imageToExport?.url;
    link.download = `processed_${imageToExport?.name}`;
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
  };

  return (
    <>
      <Helmet>
        <title>AI Image Processing Lab - AI Nexus</title>
        <meta name="description" content="Advanced AI-powered image processing and enhancement tools for creative workflows" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        <main className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        } pt-16`}>
          <div className="h-screen flex flex-col">
            {/* Toolbar */}
            <ToolbarPanel
              selectedTool={selectedTool}
              onToolChange={setSelectedTool}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              onBatchProcess={handleBatchProcess}
              isProcessing={isProcessing}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Upload Panel */}
              <UploadPanel
                uploadedImages={uploadedImages}
                onImageUpload={handleImageUpload}
                onImageSelect={handleImageSelect}
                selectedImageId={selectedImageId}
                onImageDelete={handleImageDelete}
                processingQueue={processingQueue}
              />

              {/* Canvas Area */}
              <CanvasArea
                selectedImage={selectedImage}
                processedImage={processedImage}
                isProcessing={isProcessing}
                onImageProcess={handleImageProcess}
                selectedTool={selectedTool}
              />

              {/* Parameter Panel */}
              <ParameterPanel
                selectedTool={selectedTool}
                parameters={parameters}
                onParameterChange={handleParameterChange}
                onPresetApply={handlePresetApply}
                onExport={handleExport}
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AIImageProcessingLab;