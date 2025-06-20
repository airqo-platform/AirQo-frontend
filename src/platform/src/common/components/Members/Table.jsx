import React, { useState, useMemo } from 'react';
import CardWrapper from '@/common/components/CardWrapper';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * Reusable Table Component
 * A customizable table component that can be used throughout the application
 */
const Table = ({
  title = '',
  data = [],
  columns = [],
  isLoading = false,
  emptyMessage = 'No data found',
  emptyIcon: EmptyIcon = null,
  actions = null,
  containerProps = {},
  tableProps = {},
  headerProps = {},
  bodyProps = {},
  rowProps = {},
  onRowClick = null,
  className = '',
  // Pagination props
  enablePagination = false,
  initialPageSize = 10,
  pageSizeOptions = [10, 25, 50],
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calculate pagination values
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Get current page data
  const currentPageData = useMemo(() => {
    if (!enablePagination) return data;
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex, enablePagination]);

  // Pagination handlers
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const renderPaginationControls = () => {
    if (!enablePagination || totalItems === 0) return null;

    const startItem = startIndex + 1;
    const endItem = Math.min(endIndex, totalItems);

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        {/* Items per page selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            per page
          </span>
        </div>

        {/* Pagination info and controls */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Showing {startItem} to {endItem} of {totalItems} results
          </span>

          <div className="flex items-center space-x-1">
            {' '}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white dark:hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 dark:disabled:hover:bg-gray-800 dark:disabled:hover:text-gray-400"
            >
              <FaChevronLeft className="h-4 w-4" />
            </button>
            {/* Page numbers */}
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              const isCurrentPage = page === currentPage;

              // Show page number if it's within a reasonable range
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isCurrentPage
                        ? 'bg-primary text-white'
                        : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white dark:hover:bg-primary'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                (page === currentPage - 2 && currentPage > 3) ||
                (page === currentPage + 2 && currentPage < totalPages - 2)
              ) {
                return (
                  <span
                    key={page}
                    className="px-2 text-gray-400 dark:text-gray-500"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-primary hover:text-white dark:hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 dark:disabled:hover:bg-gray-800 dark:disabled:hover:text-gray-400"
            >
              <FaChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };
  return (
    <CardWrapper
      title={title}
      padding="p-0"
      className={`overflow-hidden ${className}`}
      {...containerProps}
    >
      {/* Actions section (if provided) */}
      {actions && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          {actions}
        </div>
      )}

      <div className="overflow-x-auto">
        <table
          className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
          {...tableProps}
        >
          {/* Table Header */}
          <thead className="bg-gray-50 dark:bg-gray-800" {...headerProps}>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                    column.headerClassName || ''
                  }`}
                  style={column.headerStyle || {}}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody
            className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700"
            {...bodyProps}
          >
            {/* Loading state */}
            {isLoading && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                    <span className="ml-2 text-gray-500 dark:text-gray-400">
                      Loading...
                    </span>
                  </div>
                </td>
              </tr>
            )}{' '}
            {/* Data rows */}
            {!isLoading &&
              currentPageData.map((row, rowIndex) => {
                const rowKey = row.id || row._id || rowIndex;
                const isClickable = typeof onRowClick === 'function';

                return (
                  <tr
                    key={rowKey}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      isClickable ? 'cursor-pointer' : ''
                    } ${rowProps.className || ''}`}
                    onClick={
                      isClickable ? () => onRowClick(row, rowIndex) : undefined
                    }
                    {...(typeof rowProps === 'function'
                      ? rowProps(row, rowIndex)
                      : rowProps)}
                  >
                    {columns.map((column, colIndex) => {
                      const cellKey = `${rowKey}-${column.key || colIndex}`;
                      let cellContent;

                      // Determine cell content based on column configuration
                      if (typeof column.render === 'function') {
                        cellContent = column.render(row, rowIndex);
                      } else if (column.accessor) {
                        // Support nested accessors like 'user.name'
                        const value = column.accessor
                          .split('.')
                          .reduce((obj, key) => obj?.[key], row);
                        cellContent = value ?? column.defaultValue ?? '-';
                      } else if (column.key) {
                        cellContent =
                          row[column.key] ?? column.defaultValue ?? '-';
                      } else {
                        cellContent = '-';
                      }

                      return (
                        <td
                          key={cellKey}
                          className={`px-6 py-4 whitespace-nowrap ${
                            column.cellClassName || ''
                          }`}
                          style={column.cellStyle || {}}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>{' '}
        {/* Empty state */}
        {!isLoading && currentPageData.length === 0 && (
          <div className="text-center py-12">
            {EmptyIcon && (
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4 flex items-center justify-center">
                <EmptyIcon className="h-12 w-12" />
              </div>
            )}
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {emptyMessage}
            </h3>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {renderPaginationControls()}
    </CardWrapper>
  );
};

Table.propTypes = {
  title: PropTypes.string,
  data: PropTypes.array,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      header: PropTypes.node.isRequired,
      accessor: PropTypes.string,
      render: PropTypes.func,
      defaultValue: PropTypes.any,
      headerClassName: PropTypes.string,
      headerStyle: PropTypes.object,
      cellClassName: PropTypes.string,
      cellStyle: PropTypes.object,
    }),
  ).isRequired,
  isLoading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  emptyIcon: PropTypes.elementType,
  actions: PropTypes.node,
  containerProps: PropTypes.object,
  tableProps: PropTypes.object,
  headerProps: PropTypes.object,
  bodyProps: PropTypes.object,
  rowProps: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  onRowClick: PropTypes.func,
  className: PropTypes.string,
  // Pagination props
  enablePagination: PropTypes.bool,
  initialPageSize: PropTypes.number,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
};

export default Table;
