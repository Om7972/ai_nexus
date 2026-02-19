import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DatasetStructure = ({ dataset, onColumnSelect, selectedColumns = [] }) => {
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    columns: true,
    sample: false
  });

  const mockDataset = dataset || {
    name: 'sales_data.csv',
    rows: 15420,
    size: '2.3 MB',
    uploadedAt: new Date()?.toISOString(),
    columns: [
      { name: 'customer_id', type: 'Integer', nulls: 0, unique: 8945, sample: '12345' },
      { name: 'product_name', type: 'String', nulls: 23, unique: 156, sample: 'Wireless Headphones' },
      { name: 'category', type: 'String', nulls: 5, unique: 8, sample: 'Electronics' },
      { name: 'price', type: 'Float', nulls: 12, unique: 89, sample: '299.99' },
      { name: 'quantity', type: 'Integer', nulls: 0, unique: 25, sample: '2' },
      { name: 'order_date', type: 'Date', nulls: 8, unique: 365, sample: '2024-08-14' },
      { name: 'customer_age', type: 'Integer', nulls: 156, unique: 65, sample: '34' },
      { name: 'region', type: 'String', nulls: 2, unique: 5, sample: 'North America' },
      { name: 'sales_rep', type: 'String', nulls: 89, unique: 45, sample: 'John Smith' },
      { name: 'discount', type: 'Float', nulls: 234, unique: 15, sample: '0.15' },
      { name: 'revenue', type: 'Float', nulls: 0, unique: 1245, sample: '599.98' },
      { name: 'rating', type: 'Float', nulls: 567, unique: 9, sample: '4.5' }
    ],
    sampleData: [
      { customer_id: 12345, product_name: 'Wireless Headphones', category: 'Electronics', price: 299.99, quantity: 2 },
      { customer_id: 12346, product_name: 'Smart Watch', category: 'Electronics', price: 399.99, quantity: 1 },
      { customer_id: 12347, product_name: 'Coffee Maker', category: 'Appliances', price: 149.99, quantity: 1 }
    ]
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'integer': return 'Hash';
      case 'float': return 'Calculator';
      case 'string': return 'Type';
      case 'date': return 'Calendar';
      default: return 'Database';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'integer': return 'text-blue-600';
      case 'float': return 'text-green-600';
      case 'string': return 'text-purple-600';
      case 'date': return 'text-orange-600';
      default: return 'text-muted-foreground';
    }
  };

  const handleColumnToggle = (columnName) => {
    const isSelected = selectedColumns?.includes(columnName);
    if (isSelected) {
      onColumnSelect(selectedColumns?.filter(col => col !== columnName));
    } else {
      onColumnSelect([...selectedColumns, columnName]);
    }
  };

  const selectAllColumns = () => {
    onColumnSelect(mockDataset?.columns?.map(col => col?.name));
  };

  const deselectAllColumns = () => {
    onColumnSelect([]);
  };

  if (!dataset && !mockDataset) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="text-center py-8">
          <Icon name="Database" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Dataset Loaded</h3>
          <p className="text-muted-foreground">Upload a dataset to view its structure and columns</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Dataset Overview */}
      <div className="p-4 border-b border-border">
        <button
          onClick={() => toggleSection('overview')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-semibold text-foreground">Dataset Overview</h3>
          <Icon
            name={expandedSections?.overview ? "ChevronUp" : "ChevronDown"}
            size={16}
          />
        </button>

        {expandedSections?.overview && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Icon name="FileText" size={16} color="var(--color-secondary)" />
              <span className="text-sm font-medium text-foreground">{mockDataset?.name}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rows:</span>
                <span className="font-medium text-foreground">{mockDataset?.rows?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Columns:</span>
                <span className="font-medium text-foreground">{mockDataset?.columns?.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Size:</span>
                <span className="font-medium text-foreground">{mockDataset?.size}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Uploaded:</span>
                <span className="font-medium text-foreground">
                  {new Date(mockDataset.uploadedAt)?.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Column Information */}
      <div className="p-4 border-b border-border">
        <button
          onClick={() => toggleSection('columns')}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <h3 className="text-lg font-semibold text-foreground">Columns</h3>
          <Icon
            name={expandedSections?.columns ? "ChevronUp" : "ChevronDown"}
            size={16}
          />
        </button>

        {expandedSections?.columns && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedColumns?.length} of {mockDataset?.columns?.length} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={selectAllColumns}
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={deselectAllColumns}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {mockDataset?.columns?.map((column, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedColumns?.includes(column?.name)
                      ? 'bg-primary/10 border border-primary/20' : 'hover:bg-accent/50'
                    }`}
                  onClick={() => handleColumnToggle(column?.name)}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedColumns?.includes(column?.name)
                      ? 'bg-primary border-primary' : 'border-border'
                    }`}>
                    {selectedColumns?.includes(column?.name) && (
                      <Icon name="Check" size={12} color="white" />
                    )}
                  </div>

                  <Icon
                    name={getTypeIcon(column?.type)}
                    size={16}
                    className={getTypeColor(column?.type)}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground truncate">
                        {column?.name}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getTypeColor(column?.type)} bg-current/10`}>
                        {column?.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                      <span>Unique: {column?.unique}</span>
                      <span>Nulls: {column?.nulls}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Sample Data */}
      <div className="p-4">
        <button
          onClick={() => toggleSection('sample')}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <h3 className="text-lg font-semibold text-foreground">Sample Data</h3>
          <Icon
            name={expandedSections?.sample ? "ChevronUp" : "ChevronDown"}
            size={16}
          />
        </button>

        {expandedSections?.sample && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {Object.keys(mockDataset?.sampleData?.[0] || {})?.map((key) => (
                    <th key={key} className="text-left p-2 font-medium text-foreground">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockDataset?.sampleData?.map((row, index) => (
                  <tr key={index} className="border-b border-border/50">
                    {Object.values(row)?.map((value, cellIndex) => (
                      <td key={cellIndex} className="p-2 text-muted-foreground">
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatasetStructure;