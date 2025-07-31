import React, { memo } from 'react';
import { AqChevronLeft, AqChevronRight } from '@airqo/icons-react';
import PageSizeSelector from './PageSizeSelector';

/**
 * Table pagination component
 */
const TablePagination = ({
  currentPage,
  totalPages,
  currentPageSize,
  totalItems,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  generatePageNumbers,
}) => {
  if (totalItems === 0) return null;

  return (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#1d1f20]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <PageSizeSelector
            pageSize={currentPageSize}
            onPageSizeChange={onPageSizeChange}
            options={pageSizeOptions}
          />
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing{' '}
            {Math.min((currentPage - 1) * currentPageSize + 1, totalItems)} to{' '}
            {Math.min(currentPage * currentPageSize, totalItems)} of{' '}
            {totalItems} results
          </div>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-primary/30 dark:border-primary/40 rounded-md hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary dark:hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-primary/30 dark:disabled:hover:border-primary/40 flex items-center space-x-1 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <AqChevronLeft className="w-3 h-3" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            <div className="flex items-center space-x-1">
              {generatePageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && onPageChange(page)}
                  disabled={typeof page !== 'number'}
                  className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                    page === currentPage
                      ? 'bg-primary text-white border-primary'
                      : typeof page === 'number'
                        ? 'border-primary/30 dark:border-primary/40 hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary dark:hover:border-primary text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900'
                        : 'border-transparent cursor-default bg-transparent dark:bg-transparent text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() =>
                onPageChange(Math.min(currentPage + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-primary/30 dark:border-primary/40 rounded-md hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary dark:hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-primary/30 dark:disabled:hover:border-primary/40 flex items-center space-x-1 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <span className="hidden sm:inline">Next</span>
              <AqChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(TablePagination);
