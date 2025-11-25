import React, { useCallback } from 'react';
import { MultiSelectTable } from './multi-select-table';

// Define the types locally since they're not exported from multi-select-table
interface TableItem {
  id: string | number;
  [key: string]: unknown;
}

interface TableColumn<T = TableItem> {
  key: string;
  label: string | React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
}

export interface ServerSideTableProps<T = TableItem> {
  title?: string;
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
  multiSelect?: boolean;
  selectedItems?: (string | number)[];
  onSelectedItemsChange?: (selectedIds: (string | number)[]) => void;

  // Server-side pagination props (optional for client-side)
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;

  // Server-side search props (optional for client-side)
  searchTerm?: string;
  onSearchChange?: (search: string) => void;

  // Custom header component
  customHeader?: React.ReactNode;
}

/**
 * Server-side table wrapper that properly handles pagination and search
 * by communicating with backend APIs instead of client-side filtering
 */
export function ServerSideTable<T extends TableItem>({
  title,
  data,
  columns,
  loading = false,
  error,
  onRefresh,
  className,
  multiSelect = false,
  selectedItems,
  onSelectedItemsChange,

  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,

  searchTerm,
  onSearchChange,

  customHeader,
}: ServerSideTableProps<T>) {
  // Pagination controls (only when pagination props are provided)
  const handlePreviousPage = useCallback(() => {
    if (currentPage && currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (currentPage && totalPages && currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  const handlePageSizeChange = useCallback(
    (size: number) => {
      if (onPageSizeChange) {
        onPageSizeChange(size);
      }
    },
    [onPageSizeChange]
  );

  // Custom footer with server-side pagination (only when pagination props are provided)
  const customFooter =
    totalItems &&
    currentPage &&
    pageSize &&
    totalPages &&
    onPageChange &&
    onPageSizeChange ? (
      <div className="mt-4 border shadow-sm rounded-md bg-card">
        <div className="flex flex-col gap-3 sm:gap-4 items-start sm:items-center sm:justify-between p-3 sm:p-4 sm:flex-row">
          <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1 text-center sm:text-left w-full sm:w-auto">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalItems)} of{' '}
            {totalItems.toLocaleString()} results
          </div>

          <div className="flex flex-col gap-2 sm:gap-3 w-full sm:w-auto sm:flex-row sm:items-center order-1 sm:order-2">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                Rows per page:
              </span>
              <select
                value={pageSize}
                onChange={e => handlePageSizeChange(Number(e.target.value))}
                className="px-2 py-1 border border-input rounded text-xs sm:text-sm focus:ring-2 focus:ring-ring focus:border-primary bg-background text-foreground"
              >
                {[6, 10, 20, 40, 80].map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1 sm:gap-2 justify-center sm:justify-end">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage <= 1}
                className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-input rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted text-foreground"
              >
                Prev
              </button>

              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                {currentPage} of {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-input rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted text-foreground"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <MultiSelectTable
        data={data}
        title={`${title}`}
        columns={columns}
        loading={loading}
        error={error}
        onRefresh={onRefresh}
        multiSelect={multiSelect}
        selectedItems={selectedItems}
        onSelectedItemsChange={onSelectedItemsChange}
        searchable={true} // Enable search in table header
        showPagination={true} // Enable built-in pagination for client-side operations
        sortable={true}
        headerComponent={customHeader}
        {...(searchTerm !== undefined && onSearchChange !== undefined
          ? { searchTerm, onSearchChange }
          : {})}
      />

      {/* Only show custom footer if pagination props are provided */}
      {customFooter}
    </div>
  );
}
