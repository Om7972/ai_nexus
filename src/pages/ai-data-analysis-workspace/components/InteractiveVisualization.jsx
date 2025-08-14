import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const InteractiveVisualization = ({ data, analysisResults, isLoading }) => {
  const [activeChart, setActiveChart] = useState('bar');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [chartSize, setChartSize] = useState('medium');

  const mockData = data || [
    { name: 'Jan', revenue: 4000, orders: 240, customers: 180 },
    { name: 'Feb', revenue: 3000, orders: 198, customers: 150 },
    { name: 'Mar', revenue: 2000, orders: 180, customers: 120 },
    { name: 'Apr', revenue: 2780, orders: 220, customers: 160 },
    { name: 'May', revenue: 1890, orders: 160, customers: 110 },
    { name: 'Jun', revenue: 2390, orders: 200, customers: 140 },
    { name: 'Jul', revenue: 3490, orders: 280, customers: 200 },
    { name: 'Aug', revenue: 4200, orders: 320, customers: 230 },
    { name: 'Sep', revenue: 3800, orders: 290, customers: 210 },
    { name: 'Oct', revenue: 4100, orders: 310, customers: 220 },
    { name: 'Nov', revenue: 4500, orders: 340, customers: 250 },
    { name: 'Dec', revenue: 5200, orders: 380, customers: 280 }
  ];

  const pieData = [
    { name: 'Electronics', value: 35, color: '#36454F' },
    { name: 'Clothing', value: 25, color: '#9CAF88' },
    { name: 'Home & Garden', value: 20, color: '#7A8B7F' },
    { name: 'Sports', value: 12, color: '#F5F5DC' },
    { name: 'Books', value: 8, color: '#2A2A2A' }
  ];

  const scatterData = [
    { x: 100, y: 200, z: 200 },
    { x: 120, y: 100, z: 260 },
    { x: 170, y: 300, z: 400 },
    { x: 140, y: 250, z: 280 },
    { x: 150, y: 400, z: 500 },
    { x: 110, y: 280, z: 200 }
  ];

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart', icon: 'BarChart3' },
    { value: 'line', label: 'Line Chart', icon: 'TrendingUp' },
    { value: 'pie', label: 'Pie Chart', icon: 'PieChart' },
    { value: 'scatter', label: 'Scatter Plot', icon: 'Scatter' }
  ];

  const metricOptions = [
    { value: 'revenue', label: 'Revenue' },
    { value: 'orders', label: 'Orders' },
    { value: 'customers', label: 'Customers' }
  ];

  const sizeOptions = [
    { value: 'small', label: 'Small (300px)' },
    { value: 'medium', label: 'Medium (400px)' },
    { value: 'large', label: 'Large (500px)' }
  ];

  const getChartHeight = () => {
    switch (chartSize) {
      case 'small': return 300;
      case 'medium': return 400;
      case 'large': return 500;
      default: return 400;
    }
  };

  const renderChart = () => {
    const height = getChartHeight();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Generating visualization...</p>
          </div>
        </div>
      );
    }

    switch (activeChart) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey={selectedMetric} fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="var(--color-secondary)" 
                strokeWidth={3}
                dot={{ fill: 'var(--color-secondary)', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100)?.toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="x" stroke="var(--color-muted-foreground)" />
              <YAxis dataKey="y" stroke="var(--color-muted-foreground)" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }}
              />
              <Scatter dataKey="z" fill="var(--color-secondary)" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Interactive Visualization</h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" iconName="Download" iconPosition="left">
            Export
          </Button>
          <Button variant="ghost" size="sm" iconName="Maximize2" iconPosition="left">
            Fullscreen
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select
          label="Chart Type"
          options={chartTypes}
          value={activeChart}
          onChange={setActiveChart}
        />
        
        {(activeChart === 'bar' || activeChart === 'line') && (
          <Select
            label="Metric"
            options={metricOptions}
            value={selectedMetric}
            onChange={setSelectedMetric}
          />
        )}
        
        <Select
          label="Chart Size"
          options={sizeOptions}
          value={chartSize}
          onChange={setChartSize}
        />
      </div>

      <div className="bg-muted/30 rounded-lg p-4 mb-4">
        {renderChart()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-secondary rounded-full"></div>
          <span className="text-muted-foreground">Primary Data</span>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="TrendingUp" size={12} color="var(--color-success)" />
          <span className="text-success">Positive Trend</span>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Target" size={12} color="var(--color-warning)" />
          <span className="text-warning">Key Insights</span>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={12} color="var(--color-muted-foreground)" />
          <span className="text-muted-foreground">Filtered View</span>
        </div>
      </div>

      {analysisResults && (
        <div className="mt-6 p-4 bg-secondary/10 rounded-lg">
          <h4 className="text-sm font-medium text-foreground mb-2">Analysis Insights</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Peak performance observed in December with 5,200 revenue units</p>
            <p>• Consistent growth trend from May to December</p>
            <p>• Strong correlation between customer count and revenue (r=0.89)</p>
            <p>• Seasonal patterns detected with Q4 showing highest performance</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveVisualization;