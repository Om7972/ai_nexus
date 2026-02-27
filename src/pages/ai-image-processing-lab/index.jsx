import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Upload,
  Download,
  Sparkles,
  Layers,
  Wand2,
  Trash2,
  History,
  Maximize2,
  CheckCircle,
  Loader2,
  Settings2,
  Crop,
} from 'lucide-react';

import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { cn } from '../../utils/cn';

// Redux
import { generateImage, processImage, fetchImageHistory, clearError } from '../../store/slices/imageLabSlice';

const AIImageProcessingLab = () => {
  const dispatch = useDispatch();
  const { history, isProcessing, error } = useSelector((state) => state.imageLab);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('process'); // 'process', 'generate', 'history'

  // Image Upload State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Tool State
  const [selectedTool, setSelectedTool] = useState('remove-background');

  // Generation State
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState('1024x1024');

  // Result State
  const [resultImage, setResultImage] = useState(null); // The final processed/generated image

  // Fetch History on Mount
  useEffect(() => {
    dispatch(fetchImageHistory());
  }, [dispatch]);

  // Handle Drop
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultImage(null);
      dispatch(clearError());
    }
  }, [dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  // Action Handlers
  const handleProcessImage = async () => {
    if (!uploadedFile) return;

    const formData = new FormData();
    formData.append('image', uploadedFile);
    formData.append('tool', selectedTool);
    formData.append('resolution', resolution);
    if (prompt) formData.append('prompt', prompt);

    try {
      const res = await dispatch(processImage(formData)).unwrap();
      setResultImage(res); // assuming { processedImageUrl: ... }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt) return;

    try {
      const res = await dispatch(generateImage({ prompt, resolution, model: 'dall-e-3' })).unwrap();
      setResultImage(res);
    } catch (err) {
      console.error(err);
    }
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setPreviewUrl('');
    setResultImage(null);
  };

  const loadFromHistory = (item) => {
    setResultImage(item);
    setActiveTab('history');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>AI Image Lab - AI Nexus</title>
        <meta name="description" content="Process, enhance, and generate AI images seamlessly." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className={cn(
          "pt-16 transition-all duration-300 flex-1 flex flex-col",
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}>
          {/* Top Bar */}
          <div className="bg-card border-b border-border px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-16 z-20 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold flex items-center text-foreground">
                <ImageIcon className="w-6 h-6 mr-3 text-primary" />
                Image Processing Lab
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Enhance, remove backgrounds, or generate from scratch.</p>
            </div>

            {/* View Tabs */}
            <div className="flex bg-accent/50 p-1 rounded-lg border border-border">
              <button
                onClick={() => setActiveTab('process')}
                className={cn("px-4 py-2 rounded-md text-sm font-medium transition-all", activeTab === 'process' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground')}
              >
                <Layers className="w-4 h-4 inline-block mr-2" />
                Process
              </button>
              <button
                onClick={() => setActiveTab('generate')}
                className={cn("px-4 py-2 rounded-md text-sm font-medium transition-all", activeTab === 'generate' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground')}
              >
                <Sparkles className="w-4 h-4 inline-block mr-2" />
                Generate
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={cn("px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center", activeTab === 'history' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground')}
              >
                <History className="w-4 h-4 inline-block mr-2" />
                History ({history.length})
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full">

            {/* Left Column: Controls (Hidden on History Tab) */}
            {activeTab !== 'history' && (
              <div className="w-full lg:w-96 flex-shrink-0 flex flex-col gap-6">

                {activeTab === 'process' && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
                    <h3 className="font-semibold text-lg flex items-center">
                      <Wand2 className="w-5 h-5 mr-2 text-primary" /> Edit Tool
                    </h3>

                    <div className="space-y-4">
                      <Select
                        label="Select AI Tool"
                        value={selectedTool}
                        onChange={(val) => setSelectedTool(val)}
                        options={[
                          { value: 'remove-background', label: 'Background Removal' },
                          { value: 'enhance', label: 'AI Enhance (Upscale)' },
                          { value: 'resize', label: 'Smart Resize' }
                        ]}
                      />

                      {(selectedTool === 'enhance' || selectedTool === 'resize') && (
                        <Select
                          label="Target Resolution"
                          value={resolution}
                          onChange={(val) => setResolution(val)}
                          options={[
                            { value: '1024x1024', label: '1024 x 1024 (1:1)' },
                            { value: '1920x1080', label: '1920 x 1080 (16:9)' },
                            { value: '1080x1920', label: '1080 x 1920 (9:16)' }
                          ]}
                        />
                      )}

                      <Button
                        className="w-full"
                        disabled={!uploadedFile || isProcessing}
                        onClick={handleProcessImage}
                      >
                        {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><Sparkles className="w-4 h-4 mr-2" /> Apply {selectedTool.replace('-', ' ')}</>}
                      </Button>

                      {error && <p className="text-sm text-error bg-error/10 p-2 rounded">{error}</p>}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'generate' && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
                    <h3 className="font-semibold text-lg flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-primary" /> Generate Image
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Prompt</label>
                        <textarea
                          className="w-full bg-accent/50 border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary h-32 resize-none"
                          placeholder="Describe the image you want to see..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                        />
                      </div>

                      <Select
                        label="Resolution"
                        value={resolution}
                        onChange={(val) => setResolution(val)}
                        options={[
                          { value: '1024x1024', label: 'Square (1024x1024)' },
                          { value: '1024x1792', label: 'Portrait (1024x1792)' },
                          { value: '1792x1024', label: 'Landscape (1792x1024)' }
                        ]}
                      />

                      <Button
                        className="w-full"
                        disabled={!prompt || isProcessing}
                        onClick={handleGenerateImage}
                      >
                        {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Art</>}
                      </Button>

                      {error && <p className="text-sm text-error bg-error/10 p-2 rounded">{error}</p>}
                    </div>
                  </motion.div>
                )}

              </div >
            )}


            {/* Right Column: Canvas/Result */}
            {activeTab !== 'history' && (
              <div className="flex-1 flex flex-col gap-6">

                {/* Upload Section For Processing */}
                {activeTab === 'process' && !uploadedFile && !resultImage && (
                  <div
                    {...getRootProps()}
                    className={cn(
                      "flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-10 cursor-pointer transition-all duration-300 min-h-[400px]",
                      isDragActive ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/50 bg-accent/20 hover:bg-accent/40"
                    )}
                  >
                    <input {...getInputProps()} />
                    <div className="p-4 bg-background rounded-full shadow-sm mb-4">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Drag & drop an image here</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      or click to browse your computer. Supports JPG, PNG and WEBP. Maximum file size 10MB.
                    </p>
                  </div>
                )}

                {/* Processing View Canvas */}
                {activeTab === 'process' && uploadedFile && !resultImage && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col relative min-h-[400px]">
                    <div className="absolute top-4 right-4 z-10">
                      <Button variant="destructive" size="icon" onClick={clearUpload}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex-1 flex items-center justify-center bg-accent/20 overflow-hidden p-6 relative">
                      {isProcessing && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                          <p className="text-foreground font-medium animate-pulse">Running AI Model targeting {selectedTool}...</p>
                        </div>
                      )}
                      <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-md" />
                    </div>
                  </motion.div>
                )}

                {/* Awaiting Generation Canvas */}
                {activeTab === 'generate' && !resultImage && (
                  <div className="flex-1 border border-border/60 rounded-xl bg-accent/20 flex flex-col items-center justify-center min-h-[400px] p-10 text-center relative overflow-hidden">
                    {isProcessing ? (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                        <p className="text-foreground font-medium animate-pulse">Creating your masterpiece...</p>
                      </div>
                    ) : (
                      <>
                        <Sparkles className="w-16 h-16 text-muted-foreground/30 mb-4" />
                        <h3 className="text-xl font-medium text-muted-foreground">Ready to create</h3>
                        <p className="text-sm text-muted-foreground/70 max-w-sm mt-2">Enter a prompt on the left and hit generate to see the AI magic.</p>
                      </>
                    )}
                  </div>
                )}

                {/* Result Presentation */}
                <AnimatePresence>
                  {resultImage && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
                      <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
                        <span className="font-semibold text-foreground flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2 text-success" /> Result Ready
                        </span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => window.open(resultImage.processedImageUrl, '_blank')}>
                            <Maximize2 className="w-4 h-4 mr-2" /> View Full
                          </Button>
                          <Button size="sm" onClick={() => {
                            const a = document.createElement('a');
                            a.href = resultImage.processedImageUrl;
                            a.download = `ainexus-${resultImage.toolUsed || 'gen'}.jpg`;
                            a.click();
                          }}>
                            <Download className="w-4 h-4 mr-2" /> Download
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setResultImage(null)} title="Clear">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex-1 bg-accent/20 flex items-center justify-center p-6 relative min-h-[400px]">
                        {/* Before/After split if it was processing and we have an originalImageUrl */}
                        {resultImage.type === 'processing' && resultImage.originalImageUrl ? (
                          <div className="grid grid-cols-2 gap-4 h-full w-full">
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-muted-foreground mb-2 text-center uppercase">Original</span>
                              <img src={resultImage.originalImageUrl} className="flex-1 max-w-full max-h-[600px] object-contain rounded drop-shadow bg-background" alt="Original" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-primary mb-2 text-center uppercase">Processed ({resultImage.toolUsed})</span>
                              <img src={resultImage.processedImageUrl} className="flex-1 max-w-full max-h-[600px] object-contain rounded drop-shadow bg-background" alt="Processed" />
                            </div>
                          </div>
                        ) : (
                          <img src={resultImage.processedImageUrl} alt="Generated" className="max-w-full max-h-[650px] object-contain rounded-lg drop-shadow-xl" />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            )}

            {/* History Grid Tab */}
            {activeTab === 'history' && (
              <div className="w-full flex-1">
                <div className="bg-card border border-border rounded-xl shadow-sm p-6 min-h-[600px]">
                  <h2 className="text-xl font-bold mb-6 text-foreground flex items-center">
                    <History className="w-6 h-6 mr-3 text-primary" />
                    Your Recent Images
                  </h2>

                  {(!history || history.length === 0) ? (
                    <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-16 h-16 opacity-20 mb-4" />
                      <p>No history found. Generate or process an image to get started.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {history.map(item => (
                        <div key={item._id} className="group relative rounded-xl border border-border bg-accent/20 overflow-hidden hover:shadow-lg transition-all duration-300">
                          <div className="aspect-square bg-muted/30 relative">
                            <img src={item.processedImageUrl} alt="History thumbnail" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-3">
                              <Button size="sm" onClick={() => loadFromHistory(item)}>
                                View Details
                              </Button>
                              <Button size="sm" variant="outline" className="text-white border-white hover:bg-white/20" onClick={() => {
                                const a = document.createElement('a');
                                a.href = item.processedImageUrl;
                                a.download = `ainexus-${item._id}.jpg`;
                                a.click();
                              }}>
                                Download
                              </Button>
                            </div>
                          </div>
                          <div className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {item.type}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-foreground line-clamp-2" title={item.prompt || item.toolUsed}>
                              {item.prompt ? `"${item.prompt}"` : `Tool: ${item.toolUsed}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
};

export default AIImageProcessingLab;