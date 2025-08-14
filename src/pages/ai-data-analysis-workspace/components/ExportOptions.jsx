import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const ExportOptions = ({ onExport, analysisResults, isExporting }) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [includeOptions, setIncludeOptions] = useState({
    rawData: true,
    visualizations: true,
    insights: true,
    recommendations: true,
    metadata: false
  });
  const [exportQuality, setExportQuality] = useState('high');

  const formatOptions = [
    { value: 'pdf', label: 'PDF Report', icon: 'FileText', description: 'Comprehensive formatted report' },
    { value: 'excel', label: 'Excel Workbook', icon: 'FileSpreadsheet', description: 'Data and charts in Excel format' },
    { value: 'powerpoint', label: 'PowerPoint Presentation', icon: 'Presentation', description: 'Slide deck with key insights' },
    { value: 'json', label: 'JSON Data', icon: 'Braces', description: 'Raw data in JSON format' },
    { value: 'csv', label: 'CSV Files', icon: 'Database', description: 'Comma-separated data files' }
  ];

  const qualityOptions = [
    { value: 'standard', label: 'Standard Quality', description: 'Smaller file size, good quality' },
    { value: 'high', label: 'High Quality', description: 'Larger file size, best quality' },
    { value: 'print', label: 'Print Quality', description: 'Optimized for printing' }
  ];

  const handleIncludeOptionChange = (option, checked) => {
    setIncludeOptions(prev => ({
      ...prev,
      [option]: checked
    }));
  };

  const handleExport = () => {
    const exportConfig = {
      format: exportFormat,
      quality: exportQuality,
      include: includeOptions,
      timestamp: new Date()?.toISOString()
    };
    
    onExport(exportConfig);
  };

  const getFormatIcon = (format) => {
    const option = formatOptions?.find(opt => opt?.value === format);
    return option ? option?.icon : 'Download';
  };

  const estimateFileSize = () => {
    let baseSize = 2; // MB
    if (includeOptions?.rawData) baseSize += 5;
    if (includeOptions?.visualizations) baseSize += 3;
    if (includeOptions?.insights) baseSize += 1;
    if (includeOptions?.recommendations) baseSize += 0.5;
    if (includeOptions?.metadata) baseSize += 0.2;
    
    if (exportQuality === 'high') baseSize *= 1.5;
    if (exportQuality === 'print') baseSize *= 2;
    
    return baseSize?.toFixed(1);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Export Options</h3>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Download" size={16} />
          <span>Ready to Export</span>
        </div>
      </div>
      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Export Format</h4>
          <div className="grid grid-cols-1 gap-2">
            {formatOptions?.map((option) => (
              <div
                key={option?.value}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  exportFormat === option?.value
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-accent/50'
                }`}
                onClick={() => setExportFormat(option?.value)}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  exportFormat === option?.value ? 'bg-primary text-primary-foreground' : 'bg-secondary/20'
                }`}>
                  <Icon 
                    name={option?.icon} 
                    size={16} 
                    color={exportFormat === option?.value ? 'currentColor' : 'var(--color-secondary)'} 
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{option?.label}</span>
                    {exportFormat === option?.value && (
                      <Icon name="Check" size={16} color="var(--color-primary)" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{option?.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Include Options */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Include in Export</h4>
          <div className="space-y-3">
            <Checkbox
              label="Raw Data"
              description="Original dataset and processed data"
              checked={includeOptions?.rawData}
              onChange={(e) => handleIncludeOptionChange('rawData', e?.target?.checked)}
            />
            <Checkbox
              label="Visualizations"
              description="Charts, graphs, and visual representations"
              checked={includeOptions?.visualizations}
              onChange={(e) => handleIncludeOptionChange('visualizations', e?.target?.checked)}
            />
            <Checkbox
              label="Key Insights"
              description="AI-generated insights and findings"
              checked={includeOptions?.insights}
              onChange={(e) => handleIncludeOptionChange('insights', e?.target?.checked)}
            />
            <Checkbox
              label="Recommendations"
              description="Actionable recommendations based on analysis"
              checked={includeOptions?.recommendations}
              onChange={(e) => handleIncludeOptionChange('recommendations', e?.target?.checked)}
            />
            <Checkbox
              label="Analysis Metadata"
              description="Technical details and parameters used"
              checked={includeOptions?.metadata}
              onChange={(e) => handleIncludeOptionChange('metadata', e?.target?.checked)}
            />
          </div>
        </div>

        {/* Quality Settings */}
        <div>
          <Select
            label="Export Quality"
            options={qualityOptions}
            value={exportQuality}
            onChange={setExportQuality}
          />
        </div>

        {/* Export Summary */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Export Summary</span>
            <div className="flex items-center space-x-2">
              <Icon name={getFormatIcon(exportFormat)} size={16} color="var(--color-secondary)" />
              <span className="text-sm text-secondary font-medium">
                {formatOptions?.find(opt => opt?.value === exportFormat)?.label}
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Estimated file size:</span>
              <span>{estimateFileSize()} MB</span>
            </div>
            <div className="flex justify-between">
              <span>Components included:</span>
              <span>{Object.values(includeOptions)?.filter(Boolean)?.length} of 5</span>
            </div>
            <div className="flex justify-between">
              <span>Quality level:</span>
              <span className="capitalize">{exportQuality}</span>
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex items-center space-x-3">
          <Button
            variant="default"
            onClick={handleExport}
            disabled={isExporting || !analysisResults}
            loading={isExporting}
            iconName="Download"
            iconPosition="left"
            className="flex-1"
          >
            {isExporting ? 'Exporting...' : 'Export Analysis'}
          </Button>
          
          <Button
            variant="outline"
            iconName="Eye"
            iconPosition="left"
            disabled={!analysisResults}
          >
            Preview
          </Button>
        </div>

        {!analysisResults && (
          <div className="flex items-center space-x-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <Icon name="AlertTriangle" size={16} color="var(--color-warning)" />
            <span className="text-sm text-warning">
              Complete an analysis first to enable export options
            </span>
          </div>
        )}

        {/* Recent Exports */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Recent Exports</h4>
          <div className="space-y-2">
            {[
              { name: 'Sales Analysis Report.pdf', date: '2024-08-14 14:30', size: '4.2 MB' },
              { name: 'Customer Data Export.xlsx', date: '2024-08-13 16:45', size: '8.7 MB' },
              { name: 'Marketing Insights.pptx', date: '2024-08-12 11:20', size: '12.1 MB' }
            ]?.map((export_, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-accent/50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Icon name="FileText" size={16} color="var(--color-muted-foreground)" />
                  <div>
                    <div className="text-sm font-medium text-foreground">{export_?.name}</div>
                    <div className="text-xs text-muted-foreground">{export_?.date} • {export_?.size}</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" iconName="Download" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportOptions;