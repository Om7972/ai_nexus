import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const DataTable = ({ data, columns, isLoading, onRowSelect, selectedRows = [] }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterText, setFilterText] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedColumns, setSelectedColumns] = useState(columns?.map(col => col?.key) || []);

  const mockData = data || [
    { id: 1, customer_id: 12345, product_name: 'Wireless Headphones', category: 'Electronics', price: 299.99, quantity: 2, order_date: '2024-08-14', region: 'North America', revenue: 599.98 },
    { id: 2, customer_id: 12346, product_name: 'Smart Watch', category: 'Electronics', price: 399.99, quantity: 1, order_date: '2024-08-13', region: 'Europe', revenue: 399.99 },
    { id: 3, customer_id: 12347, product_name: 'Coffee Maker', category: 'Appliances', price: 149.99, quantity: 1, order_date: '2024-08-12', region: 'Asia', revenue: 149.99 },
    { id: 4, customer_id: 12348, product_name: 'Running Shoes', category: 'Sports', price: 129.99, quantity: 1, order_date: '2024-08-11', region: 'North America', revenue: 129.99 },
    { id: 5, customer_id: 12349, product_name: 'Laptop Stand', category: 'Electronics', price: 79.99, quantity: 3, order_date: '2024-08-10', region: 'Europe', revenue: 239.97 },
    { id: 6, customer_id: 12350, product_name: 'Yoga Mat', category: 'Sports', price: 49.99, quantity: 2, order_date: '2024-08-09', region: 'Asia', revenue: 99.98 },
    { id: 7, customer_id: 12351, product_name: 'Bluetooth Speaker', category: 'Electronics', price: 199.99, quantity: 1, order_date: '2024-08-08', region: 'North America', revenue: 199.99 },
    { id: 8, customer_id: 12352, product_name: 'Kitchen Scale', category: 'Appliances', price: 39.99, quantity: 1, order_date: '2024-08-07', region: 'Europe', revenue: 39.99 },
    { id: 9, customer_id: 12353, product_name: 'Gaming Mouse', category: 'Electronics', price: 89.99, quantity: 2, order_date: '2024-08-06', region: 'Asia', revenue: 179.98 },
    { id: 10, customer_id: 12354, product_name: 'Water Bottle', category: 'Sports', price: 24.99, quantity: 4, order_date: '2024-08-05', region: 'North America', revenue: 99.96 },
    { id: 11, customer_id: 12355, product_name: 'Desk Lamp', category: 'Home', price: 69.99, quantity: 1, order_date: '2024-08-04', region: 'Europe', revenue: 69.99 },
    { id: 12, customer_id: 12356, product_name: 'Phone Case', category: 'Electronics', price: 19.99, quantity: 3, order_date: '2024-08-03', region: 'Asia', revenue: 59.97 }
  ];

  const mockColumns = columns || [
    { key: 'customer_id', label: 'Customer ID', type: 'number', sortable: true },
    { key: 'product_name', label: 'Product Name', type: 'string', sortable: true },
    { key: 'category', label: 'Category', type: 'string', sortable: true },
    { key: 'price', label: 'Price', type: 'currency', sortable: true },
    { key: 'quantity', label: 'Quantity', type: 'number', sortable: true },
    { key: 'order_date', label: 'Order Date', type: 'date', sortable: true },
    { key: 'region', label: 'Region', type: 'string', sortable: true },
    { key: 'revenue', label: 'Revenue', type: 'currency', sortable: true }
  ];

  const pageSizeOptions = [
    { value: 5, label: '5 rows' },
    { value: 10, label: '10 rows' },
    { value: 25, label: '25 rows' },
    { value: 50, label: '50 rows' }
  ];

  const filteredAndSortedData = useMemo(() => {
    let filtered = mockData?.filter(row =>
      Object.values(row)?.some(value =>
        String(value)?.toLowerCase()?.includes(filterText?.toLowerCase())
      )
    );

    if (sortConfig?.key) {
      filtered?.sort((a, b) => {
        const aValue = a?.[sortConfig?.key];
        const bValue = b?.[sortConfig?.key];
        
        if (aValue < bValue) return sortConfig?.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig?.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [mockData, filterText, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedData?.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedData?.length / pageSize);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig?.key === key && prevConfig?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = () => {
    if (selectedRows?.length === paginatedData?.length) {
      onRowSelect([]);
    } else {
      onRowSelect(paginatedData?.map(row => row?.id));
    }
  };

  const handleRowSelect = (rowId) => {
    if (selectedRows?.includes(rowId)) {
      onRowSelect(selectedRows?.filter(id => id !== rowId));
    } else {
      onRowSelect([...selectedRows, rowId]);
    }
  };

  const formatCellValue = (value, type) => {
    switch (type) {
      case 'currency':
        return `$${Number(value)?.toFixed(2)}`;
      case 'date':
        return new Date(value)?.toLocaleDateString();
      case 'number':
        return Number(value)?.toLocaleString();
      default:
        return String(value);
    }
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig?.key !== columnKey) return 'ArrowUpDown';
    return sortConfig?.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading data table...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Table Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Data Table</h3>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" iconName="Download" iconPosition="left">
              Export
            </Button>
            <Button variant="ghost" size="sm" iconName="Filter" iconPosition="left">
              Filter
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search data..."
              value={filterText}
              onChange={(e) => setFilterText(e?.target?.value)}
              className="max-w-sm"
            />
          </div>
          
          <Select
            options={pageSizeOptions}
            value={pageSize}
            onChange={setPageSize}
            className="w-32"
          />
        </div>
      </div>
      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 p-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows?.length === paginatedData?.length && paginatedData?.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border"
                />
              </th>
              {mockColumns?.filter(col => selectedColumns?.includes(col?.key))?.map((column) => (
                <th key={column?.key} className="p-3 text-left">
                  <button
                    onClick={() => column?.sortable && handleSort(column?.key)}
                    className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <span>{column?.label}</span>
                    {column?.sortable && (
                      <Icon name={getSortIcon(column?.key)} size={14} />
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData?.map((row, index) => (
              <tr
                key={row?.id}
                className={`border-b border-border hover:bg-accent/50 transition-colors ${
                  selectedRows?.includes(row?.id) ? 'bg-primary/5' : ''
                }`}
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedRows?.includes(row?.id)}
                    onChange={() => handleRowSelect(row?.id)}
                    className="rounded border-border"
                  />
                </td>
                {mockColumns?.filter(col => selectedColumns?.includes(col?.key))?.map((column) => (
                  <td key={column?.key} className="p-3 text-sm text-foreground">
                    {formatCellValue(row?.[column?.key], column?.type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Table Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedData?.length)} of {filteredAndSortedData?.length} results
            {selectedRows?.length > 0 && (
              <span className="ml-2 text-primary">
                ({selectedRows?.length} selected)
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              iconName="ChevronLeft"
            />
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              iconName="ChevronRight"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;