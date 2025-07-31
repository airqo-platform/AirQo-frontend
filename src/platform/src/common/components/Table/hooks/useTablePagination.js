import { useState, useMemo, useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for handling table pagination functionality
 * @param {Array} data - The data to paginate
 * @param {number} initialPageSize - Initial page size
 * @returns {Object} Pagination state and handlers
 */
export const useTablePagination = (data, initialPageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(initialPageSize);
  const previousDataLength = useRef(data.length);

  // Only reset to first page when data length changes significantly or is filtered
  // This prevents pagination reset during multi-select operations
  useEffect(() => {
    const dataLengthChanged =
      Math.abs(data.length - previousDataLength.current) > 1;
    if (dataLengthChanged) {
      setCurrentPage(1);
      previousDataLength.current = data.length;
    }
  }, [data.length]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * currentPageSize;
    const end = start + currentPageSize;
    return data.slice(start, end);
  }, [data, currentPage, currentPageSize]);

  const totalPages = Math.ceil(data.length / currentPageSize);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setCurrentPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  const generatePageNumbers = useCallback(() => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          '...',
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages,
        );
      }
    }
    return pages;
  }, [totalPages, currentPage]);

  return {
    currentPage,
    setCurrentPage,
    currentPageSize,
    handlePageSizeChange,
    paginatedData,
    totalPages,
    generatePageNumbers,
  };
};
