/**
 * Example usage of the enhanced ReusableTable with multi-select functionality
 */
import React, { useState } from 'react';
import ReusableTable from '@/components/Table';

const ExampleTableUsage = () => {
  const [selectedItems, setSelectedItems] = useState([]);

  // Sample data
  const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'inactive',
    },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
  ];

  // Column configuration
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            value === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  // Filter configuration
  const filters = [
    {
      key: 'status',
      placeholder: 'Filter by status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      isMulti: false,
    },
  ];

  // Multi-select actions
  const actions = [
    {
      label: 'Activate Users',
      value: 'activate',
      handler: (selectedIds) => {
        // Your activation logic here
        alert(`Activating users: ${selectedIds.join(', ')}`);
      },
    },
    {
      label: 'Deactivate Users',
      value: 'deactivate',
      handler: (selectedIds) => {
        // Your deactivation logic here
        alert(`Deactivating users: ${selectedIds.join(', ')}`);
      },
    },
    {
      label: 'Delete Users',
      value: 'delete',
      handler: (selectedIds) => {
        // Your deletion logic here
        alert(`Deleting users: ${selectedIds.join(', ')}`);
      },
    },
  ];

  const handleSelectedItemsChange = (items) => {
    setSelectedItems(items);
    // Handle selection change as needed
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Enhanced Table with Multi-Select
      </h1>

      <ReusableTable
        title="Users Management"
        data={data}
        columns={columns}
        filters={filters}
        multiSelect={true}
        actions={actions}
        onSelectedItemsChange={handleSelectedItemsChange}
        searchable={true}
        filterable={true}
        sortable={true}
        showPagination={true}
        pageSize={10}
      />

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold">Selected Items:</h3>
        <pre>{JSON.stringify(selectedItems, null, 2)}</pre>
      </div>
    </div>
  );
};

export default ExampleTableUsage;
