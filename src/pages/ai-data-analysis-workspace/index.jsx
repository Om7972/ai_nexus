import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import DatasetUploadArea from './components/DatasetUploadArea';
import AnalysisTypeSelector from './components/AnalysisTypeSelector';
import ProcessingControls from './components/ProcessingControls';
import DatasetStructure from './components/DatasetStructure';
import AnalysisParameters from './components/AnalysisParameters';
import InteractiveVisualization from './components/InteractiveVisualization';
import DataTable from './components/DataTable';
import AnalysisResultsSummary from './components/AnalysisResultsSummary';
import ExportOptions from './components/ExportOptions';

const AIDataAnalysisWorkspace = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('');
  const [analysisParameters, setAnalysisParameters] = useState({});
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('visualization');

  const canStartAnalysis = uploadedFile && selectedAnalysisType;

  const handleFileUpload = (file) => {
    setUploadedFile(file);
    if (file) {
      // Mock column selection for uploaded file
      setSelectedColumns(['customer_id', 'product_name', 'category', 'price', 'quantity', 'revenue']);
    } else {
      setSelectedColumns([]);
    }
  };

  const handleStartAnalysis = (config) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setAnalysisResults(null);

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsProcessing(false);
          setAnalysisResults({
            completed: true,
            timestamp: new Date()?.toISOString(),
            config
          });
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 800);
  };

  const handleStopAnalysis = () => {
    setIsProcessing(false);
    setProcessingProgress(0);
  };

  const handleExport = (exportConfig) => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      // In a real app, this would trigger the actual download
      console.log('Export completed with config:', exportConfig);
    }, 3000);
  };

  const getEstimatedTime = () => {
    if (!selectedAnalysisType) return null;
    
    const timeMap = {
      'predictive': '5-15 minutes',
      'pattern': '3-8 minutes',
      'statistical': '1-3 minutes',
      'sentiment': '2-5 minutes'
    };
    
    return timeMap?.[selectedAnalysisType] || '2-10 minutes';
  };

  useEffect(() => {
    document.title = 'AI Data Analysis Workspace - AI Nexus';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <main className={`transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      } pt-16`}>
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Data Analysis Workspace</h1>
              <p className="text-muted-foreground mt-1">
                Upload datasets, perform AI-powered analysis, and generate comprehensive insights
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>System Online</span>
            </div>
          </div>

          {/* Top Section - Upload, Analysis Type, and Controls */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <DatasetUploadArea 
              onFileUpload={handleFileUpload}
              isProcessing={isProcessing}
            />
            
            <AnalysisTypeSelector
              selectedType={selectedAnalysisType}
              onTypeSelect={setSelectedAnalysisType}
              isProcessing={isProcessing}
            />
            
            <ProcessingControls
              onStartAnalysis={handleStartAnalysis}
              onStopAnalysis={handleStopAnalysis}
              isProcessing={isProcessing}
              canStart={canStartAnalysis}
              progress={processingProgress}
              estimatedTime={getEstimatedTime()}
            />
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Left Sidebar - Dataset Structure and Parameters */}
            <div className="xl:col-span-1 space-y-6">
              <DatasetStructure
                dataset={uploadedFile ? {
                  name: uploadedFile?.name,
                  size: `${(uploadedFile?.size / (1024 * 1024))?.toFixed(1)} MB`,
                  uploadedAt: new Date()?.toISOString()
                } : null}
                onColumnSelect={setSelectedColumns}
                selectedColumns={selectedColumns}
              />
              
              <AnalysisParameters
                analysisType={selectedAnalysisType}
                onParametersChange={setAnalysisParameters}
                parameters={analysisParameters}
              />
            </div>

            {/* Main Content - Visualization and Data Table */}
            <div className="xl:col-span-2 space-y-6">
              {/* Tab Navigation */}
              <div className="bg-card rounded-lg border border-border p-1">
                <div className="flex space-x-1">
                  {[
                    { id: 'visualization', label: 'Visualization', icon: 'BarChart3' },
                    { id: 'data', label: 'Data Table', icon: 'Table' }
                  ]?.map((tab) => (
                    <button
                      key={tab?.id}
                      onClick={() => setActiveTab(tab?.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <span>{tab?.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'visualization' && (
                <InteractiveVisualization
                  data={null}
                  analysisResults={analysisResults}
                  isLoading={isProcessing}
                />
              )}

              {activeTab === 'data' && (
                <DataTable
                  data={null}
                  columns={null}
                  isLoading={isProcessing}
                  onRowSelect={setSelectedRows}
                  selectedRows={selectedRows}
                />
              )}
            </div>

            {/* Right Panel - Results and Export */}
            <div className="xl:col-span-1 space-y-6">
              <AnalysisResultsSummary
                results={analysisResults}
                analysisType={selectedAnalysisType}
                isProcessing={isProcessing}
              />
              
              <ExportOptions
                onExport={handleExport}
                analysisResults={analysisResults}
                isExporting={isExporting}
              />
            </div>
          </div>

          {/* Analysis History */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Analysis History</h3>
            <div className="space-y-3">
              {[
                {
                  name: 'Sales Performance Analysis',
                  type: 'Predictive Modeling',
                  date: '2024-08-14 14:30',
                  status: 'Completed',
                  accuracy: '94.2%'
                },
                {
                  name: 'Customer Segmentation',
                  type: 'Pattern Recognition',
                  date: '2024-08-13 16:45',
                  status: 'Completed',
                  accuracy: '87.5%'
                },
                {
                  name: 'Market Trend Analysis',
                  type: 'Statistical Analysis',
                  date: '2024-08-12 11:20',
                  status: 'Completed',
                  accuracy: '91.8%'
                }
              ]?.map((analysis, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <div>
                      <div className="font-medium text-foreground">{analysis?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {analysis?.type} • {analysis?.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-success">{analysis?.status}</div>
                      <div className="text-xs text-muted-foreground">{analysis?.accuracy}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIDataAnalysisWorkspace;