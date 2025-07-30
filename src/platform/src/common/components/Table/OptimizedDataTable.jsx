'use client';
import React, { memo, useCallback, useMemo } from 'react';
import ReusableTable from './components/Table';
import {
  useOptimizedState,
  useDebouncedState,
  useCleanup,
} from '@/core/hooks/useOptimizedHooks';
import { standardAPIClient } from '@/core/utils/optimizedApiClient';
import { shouldComponentUpdate } from '@/core/utils/performanceOptimizer';

/**
 * Example optimized component demonstrating best practices
 * This shows how to use the optimized table with performance enhancements
 */
const OptimizedDataTable = memo(
  ({
    apiEndpoint,
    title = 'Data Table',
    searchable = true,
    filterable = true,
    multiSelect = false,
    actions = [],
    onSelectedItemsChange,
    className = '',
    refreshInterval = 0,
    ...props
  }) => {
    // Use optimized state management
    const [data, setData] = useOptimizedState([]);
    const [loading, setLoading] = useOptimizedState(false);
    const [error, setError] = useOptimizedState(null);

    // Debounced search to prevent excessive API calls
    const [searchTerm] = useDebouncedState('', 300);

    // Setup cleanup for memory leak prevention
    const cleanup = useCleanup();

    // Memoized columns configuration
    const columns = useMemo(
      () => [
        {
          key: 'id',
          label: 'ID',
          sortable: true,
        },
        {
          key: 'name',
          label: 'Name',
          sortable: true,
          render: (value) => value || 'N/A',
        },
        {
          key: 'status',
          label: 'Status',
          sortable: true,
          render: (value) => (
            <span
              className={`px-2 py-1 rounded text-sm ${
                value === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {value}
            </span>
          ),
        },
        {
          key: 'createdAt',
          label: 'Created',
          sortable: true,
          render: (value) =>
            value ? new Date(value).toLocaleDateString() : 'N/A',
        },
      ],
      [],
    );

    // Memoized filters configuration
    const filters = useMemo(
      () => [
        {
          key: 'status',
          placeholder: 'Filter by status',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ],
          isMulti: false,
        },
      ],
      [],
    );

    // Optimized data fetching function
    const fetchData = useCallback(
      async (searchQuery = '') => {
        try {
          setLoading(true);
          setError(null);

          // Use optimized API client with caching
          const response = await standardAPIClient.get(apiEndpoint, {
            params: searchQuery ? { search: searchQuery } : {},
          });

          setData(response.data || []);
        } catch (err) {
          setError(err.message || 'Failed to fetch data');
        } finally {
          setLoading(false);
        }
      },
      [apiEndpoint, setData, setLoading, setError],
    );

    // Fetch data when search term changes
    React.useEffect(() => {
      if (apiEndpoint) {
        fetchData(searchTerm);
      }
    }, [fetchData, searchTerm, apiEndpoint]);

    // Setup periodic refresh if specified
    React.useEffect(() => {
      if (refreshInterval > 0) {
        const interval = setInterval(() => {
          fetchData(searchTerm);
        }, refreshInterval);

        cleanup.add(() => clearInterval(interval));

        return () => clearInterval(interval);
      }
    }, [refreshInterval, fetchData, searchTerm, cleanup]);

    // Optimized action handlers
    const handleRefresh = useCallback(() => {
      fetchData(searchTerm);
    }, [fetchData, searchTerm]);

    const handleExport = useCallback(() => {
      // Export functionality
      const csvContent = data
        .map((row) => columns.map((col) => row[col.key]).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_export.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, [data, columns, title]);

    // Memoized action buttons
    const actionButtons = useMemo(
      () => (
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={handleExport}
            disabled={loading || data.length === 0}
            className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>
      ),
      [handleRefresh, handleExport, loading, data.length],
    );

    // Error state
    if (error) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Data
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className={`space-y-4 ${className}`}>
        <ReusableTable
          title={title}
          data={data}
          columns={columns}
          filters={filters}
          searchable={searchable}
          filterable={filterable}
          sortable={true}
          showPagination={true}
          loading={loading}
          multiSelect={multiSelect}
          actions={actions}
          onSelectedItemsChange={onSelectedItemsChange}
          headerComponent={actionButtons}
          pageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          searchableColumns={['name', 'status']}
          {...props}
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for better performance
    return !shouldComponentUpdate(prevProps, nextProps, [
      'apiEndpoint',
      'title',
      'searchable',
      'filterable',
      'multiSelect',
      'actions',
      'className',
      'refreshInterval',
    ]);
  },
);

OptimizedDataTable.displayName = 'OptimizedDataTable';

export default OptimizedDataTable;
