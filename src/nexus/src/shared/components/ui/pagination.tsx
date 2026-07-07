import React from 'react';
import { AqChevronLeft, AqChevronRight } from '@airqo/icons-react';

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPrevClick: () => void;
  onNextClick: () => void;
  onPageChange: (page: number) => void;
  className?: string;
  showTotal?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPrevClick,
  onNextClick,
  onPageChange,
  className = '',
  showTotal = false,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const isPrevDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;

  const renderPageNumbers = (): React.ReactNode[] => {
    const pageNumbers: React.ReactNode[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`w-8 h-8 flex justify-center items-center mx-1 text-sm font-medium rounded-md transition-colors duration-200 ${
            currentPage === i
              ? 'bg-primary text-primary-foreground border border-primary'
              : 'text-foreground hover:bg-muted border border-transparent'
          }`}
          onClick={() => onPageChange(i)}
          aria-label={`Go to page ${i}`}
          aria-current={currentPage === i ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }

    if (startPage > 2) {
      pageNumbers.unshift(
        <button
          key={1}
          className="flex items-center justify-center w-8 h-8 mx-1 text-sm font-medium text-foreground transition-colors duration-200 rounded-md hover:bg-muted"
          onClick={() => onPageChange(1)}
          aria-label="Go to first page"
        >
          1
        </button>
      );
      if (startPage > 3) {
        pageNumbers.unshift(
          <span key="start-ellipsis" className="mx-1 text-muted-foreground">
            ...
          </span>
        );
      }
    }

    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        pageNumbers.push(
          <span key="end-ellipsis" className="mx-1 text-muted-foreground">
            ...
          </span>
        );
      }
      pageNumbers.push(
        <button
          key={totalPages}
          className="flex items-center justify-center w-8 h-8 mx-1 text-sm font-medium text-foreground transition-colors duration-200 rounded-md hover:bg-muted"
          onClick={() => onPageChange(totalPages)}
          aria-label="Go to last page"
        >
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className={`flex items-center justify-center space-x-2 ${className}`}
      aria-label="Pagination Navigation"
    >
      {showTotal && (
        <span className="mr-4 text-sm text-muted-foreground">
          {totalItems} items total
        </span>
      )}
      <button
        className={`w-8 h-8 flex justify-center items-center rounded-md border transition-colors duration-200 ${
          isPrevDisabled
            ? 'border-input text-muted-foreground cursor-not-allowed'
            : 'border-input text-foreground hover:bg-muted'
        }`}
        onClick={onPrevClick}
        disabled={isPrevDisabled}
        aria-label="Previous page"
      >
        <AqChevronLeft className="w-4 h-4" />
      </button>
      <div className="flex items-center">{renderPageNumbers()}</div>
      <button
        className={`w-8 h-8 flex justify-center items-center rounded-md border transition-colors duration-200 ${
          isNextDisabled
            ? 'border-input text-muted-foreground cursor-not-allowed'
            : 'border-input text-foreground hover:bg-muted'
        }`}
        onClick={onNextClick}
        disabled={isNextDisabled}
        aria-label="Next page"
      >
        <AqChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};

export { Pagination };
