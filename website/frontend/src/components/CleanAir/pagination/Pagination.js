import React, { useState, useMemo } from 'react';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';

/**
 * @description Custom hook for pagination
 * @param {Array} items
 * @param {Number} itemsPerPage
 * @returns {Object}
 */
const usePagination = (items, itemsPerPage) => {
  // State
  const [currentPage, setCurrentPage] = useState(1);

  // Derived data
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  }, [items, currentPage]);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  return { currentItems, currentPage, setCurrentPage, totalPages };
};

/**
 * @description Pagination component
 * @param {Number} currentPage
 * @param {Function} setCurrentPage
 * @param {Number} totalPages
 * @returns {JSX.Element}
 */
const Pagination = ({ currentPage, setCurrentPage, totalPages }) =>
  totalPages > 1 && (
    <div className="events">
      <div className="event-cards">
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <KeyboardDoubleArrowLeftIcon
              sx={{ fill: currentPage === 1 ? '#D1D1D1' : '#000' }}
            />
          </button>
          <p>
            {currentPage} of {totalPages}
          </p>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <KeyboardDoubleArrowRightIcon
              sx={{ fill: currentPage === totalPages ? '#D1D1D1' : '#000' }}
            />
          </button>
        </div>
      </div>
    </div>
  );

export { usePagination, Pagination };
