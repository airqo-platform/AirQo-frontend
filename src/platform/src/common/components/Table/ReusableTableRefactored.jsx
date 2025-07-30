'use client';
import React, { useMemo, useCallback, useEffect } from 'react';
import { FaSort } from 'react-icons/fa';
import { AqChevronDown, AqChevronUp } from '@airqo/icons-react';
import Spinner from '@/components/Spinner';
import CardWrapper from '@/components/CardWrapper';

// Hooks
import { useTableSearch } from './hooks/useTableSearch';
import { useTableFilters } from './hooks/useTableFilters';
import { useTableSorting } from './hooks/useTableSorting';
import { useTablePagination } from './hooks/useTablePagination';
import { useTableMultiSelect } from './hooks/useTableMultiSelect';

// Components
import TableHeader from './components/TableHeader';
import MultiSelectActionBar from './components/MultiSelectActionBar';
import TablePagination from './components/TablePagination';

// Utils
import {
  renderTableCell,
  getSortIcon,
  hasActiveFilters,
} from './utils/tableUtils';

/**
 * Reusable table component with search, filtering, sorting, pagination, and multi-select
 */
const ReusableTable = ({
  title = 'Table',
  data = [],
  columns = [],
  searchable = true,
  filterable = true,
  filters = [],
  pageSize = 10,
  showPagination = true,
  sortable = true,
  className = '',
  pageSizeOptions = [5, 10, 20, 50, 100],
  searchableColumns = null,
  loading = false,
  loadingComponent = null,
  headerComponent = null,
  // Multi-Select Props
  multiSelect = false,
  actions = [], // Array of { label, value, handler }
  onSelectedItemsChange, // Callback for parent to know selected items
}) => {
  // Search functionality
  const { searchTerm, setSearchTerm, searchedData, handleClearSearch } =
    useTableSearch(data, columns, searchableColumns);

  // Filter functionality
  const {
    filterValues,
    filteredData: postFilterData,
    handleFilterChange,
  } = useTableFilters(searchedData, filters);

  // Sort functionality
  const { sortConfig, sortedData, handleSort } = useTableSorting(
    postFilterData,
    sortable,
  );

  // Pagination functionality
  const {
    currentPage,
    setCurrentPage,
    currentPageSize,
    handlePageSizeChange,
    paginatedData,
    totalPages,
    generatePageNumbers,
  } = useTablePagination(sortedData, pageSize);

  // Multi-select functionality
  const {
    selectedItems,
    selectedAction,
    isAllSelectedOnPage,
    handleSelectAll,
    handleSelectItem,
    handleActionChange,
    handleActionSubmit,
  } = useTableMultiSelect(paginatedData, onSelectedItemsChange);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValues, setCurrentPage]);

  // Enhanced getSortIcon with required icons
  const getSortIconWithIcons = useCallback(
    (key) =>
      getSortIcon(key, sortConfig, { FaSort, AqChevronUp, AqChevronDown }),
    [sortConfig],
  );

  // Handle action submit with actions array
  const handleMultiSelectAction = useCallback(() => {
    handleActionSubmit(actions);
  }, [handleActionSubmit, actions]);

  // Determine columns to display (include checkbox column if multi-select is enabled)
  const displayColumns = useMemo(() => {
    const cols = [...columns];
    if (multiSelect) {
      cols.unshift({
        key: 'checkbox',
        label: (
          <input
            type="checkbox"
            checked={isAllSelectedOnPage}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="rounded text-primary focus:ring-primary"
          />
        ),
        render: (value, item) => (
          <input
            type="checkbox"
            checked={selectedItems.includes(item.id)}
            onChange={(e) => handleSelectItem(item.id, e.target.checked)}
            className="rounded text-primary focus:ring-primary"
          />
        ),
        sortable: false,
      });
    }
    return cols;
  }, [
    columns,
    multiSelect,
    isAllSelectedOnPage,
    selectedItems,
    handleSelectAll,
    handleSelectItem,
  ]);

  return (
    <CardWrapper
      padding="p-0"
      header={headerComponent}
      className={`overflow-hidden shadow ${className}`}
    >
      {/* Header */}
      <TableHeader
        title={title}
        searchable={searchable}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={handleClearSearch}
        filterable={filterable}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
      />

      {/* Multi-Select Action Bar */}
      {multiSelect && (
        <MultiSelectActionBar
          selectedItems={selectedItems}
          actions={actions}
          selectedAction={selectedAction}
          onActionChange={handleActionChange}
          onActionSubmit={handleMultiSelectAction}
        />
      )}

      {/* Table or Loading */}
      <div className="overflow-x-auto">
        {loading ? (
          loadingComponent ? (
            loadingComponent
          ) : (
            <div className="w-full py-12 flex justify-center items-center">
              <Spinner size={30} />
            </div>
          )
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-gray-200 dark:border-gray-600 border-b dark:bg-[#1d1f20]">
              <tr>
                {displayColumns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                      sortable && column.sortable !== false
                        ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
                        : ''
                    }`}
                    onClick={() =>
                      sortable &&
                      column.sortable !== false &&
                      handleSort(column.key)
                    }
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {sortable &&
                        column.sortable !== false &&
                        getSortIconWithIcons(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1d1f20] divide-y divide-gray-200 dark:divide-gray-800">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr
                    key={item.id ?? index}
                    className="hover:bg-primary/5 dark:hover:bg-primary/20"
                  >
                    {displayColumns.map((column) => (
                      <td
                        key={column.key}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                      >
                        {renderTableCell(item, column)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={displayColumns.length}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {searchTerm || hasActiveFilters(filterValues)
                      ? 'No matching results found'
                      : 'No data available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && showPagination && sortedData.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          currentPageSize={currentPageSize}
          totalItems={sortedData.length}
          pageSizeOptions={pageSizeOptions}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
          generatePageNumbers={generatePageNumbers}
        />
      )}
    </CardWrapper>
  );
};

export default ReusableTable;
