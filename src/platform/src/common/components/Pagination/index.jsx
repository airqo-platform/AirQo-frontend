import { AqChevronLeft, AqChevronRight } from '@airqo/icons-react';

const Pagination = ({
  currentPage,
  pageSize,
  totalItems,
  onPrevClick,
  onNextClick,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const isPrevDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Number of visible page buttons
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`w-7 h-7 flex justify-center items-center mx-1 text-sm ${
            currentPage === i ? 'border border-[#363A4429] rounded-[4px]' : ''
          }`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>,
      );
    }

    if (startPage > 2) {
      pageNumbers.unshift(
        <button
          key={1}
          className="w-7 h-7 flex justify-center items-center mx-1 text-sm"
          onClick={() => onPageChange(1)}
        >
          1
        </button>,
      );
      if (startPage > 3) {
        pageNumbers.unshift(
          <span key="start-ellipsis" className="mx-1">
            ...
          </span>,
        );
      }
    }

    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        pageNumbers.push(
          <span key="end-ellipsis" className="mx-1">
            ...
          </span>,
        );
      }
      pageNumbers.push(
        <button
          key={totalPages}
          className="w-7 h-7 flex justify-center items-center text-sm mx-1"
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </button>,
      );
    }

    return pageNumbers;
  };

  return (
    <div className="flex justify-center mb-10">
      <button
        className="w-7 h-7 flex justify-center items-center border border-[#363A4429] rounded-[4px] mr-2 disabled:opacity-40"
        onClick={onPrevClick}
        disabled={isPrevDisabled}
      >
        <div className="w-[16.8px] h-[16.8px] flex justify-center items-center">
          <AqChevronLeft />
        </div>
      </button>
      {renderPageNumbers()}
      <button
        className={`w-7 h-7 flex justify-center items-center border border-[#363A4429] rounded-[4px] disabled:opacity-40`}
        onClick={onNextClick}
        disabled={isNextDisabled}
      >
        <div className="w-[16.8px] h-[16.8px] flex justify-center items-center">
          <AqChevronRight />
        </div>
      </button>
    </div>
  );
};

export default Pagination;
