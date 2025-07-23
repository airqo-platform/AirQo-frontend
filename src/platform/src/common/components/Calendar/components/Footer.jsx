import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import Button from '../../Button';

/**
 * Footer component contains Cancel and Apply buttons with date inputs for larger screens.
 */
const Footer = ({
  selectedRange,
  setSelectedRange,
  handleValueChange,
  close,
}) => {
  const [errorMsg, setErrorMsg] = useState('');

  const handleCancel = () => {
    setSelectedRange({ start: null, end: null });
    close();
  };

  const handleApply = () => {
    if (!selectedRange.start || !selectedRange.end) {
      setErrorMsg('Please select both start and end dates.');
      setTimeout(() => {
        setErrorMsg('');
      }, 3000);
      return;
    }
    handleValueChange(selectedRange);
    close();
  };

  return (
    <div className="flex flex-col items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700 md:flex-row">
      <form className="hidden md:flex md:items-center md:space-x-2">
        <input
          type="text"
          readOnly
          value={
            selectedRange.start
              ? format(selectedRange.start, 'MMM d, yyyy')
              : ''
          }
          className="flex items-center shadow-sm w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 dark:bg-gray-800 rounded-lg focus:bg-white dark:focus:bg-gray-700 focus:ring-1 focus:ring-primary focus:outline-none md:w-32"
          placeholder="Start date"
          disabled
          aria-label="Start Date"
        />
        <div className="px-2">
          <span className="text-gray-600 dark:text-gray-400 text-[16px]">
            -
          </span>
        </div>
        <input
          type="text"
          readOnly
          value={
            selectedRange.end ? format(selectedRange.end, 'MMM d, yyyy') : ''
          }
          className="flex items-center shadow-sm w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 dark:bg-gray-800 rounded-lg focus:bg-white dark:focus:bg-gray-700 focus:ring-1 focus:ring-primary focus:outline-none md:w-32"
          placeholder="End date"
          disabled
          aria-label="End Date"
        />
      </form>

      <div className="flex items-center space-x-2 mt-2 md:mt-0">
        <Button
          onClick={handleCancel}
          type="button"
          variant="outlined"
          aria-label="Cancel Selection"
          className="dark:bg-transparent"
        >
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          type="button"
          variant="filled"
          aria-label="Apply Selection"
        >
          Apply
        </Button>
      </div>

      {errorMsg && (
        <div className="text-red-500 dark:text-red-400 text-sm mt-2 md:mt-0">
          {errorMsg}
        </div>
      )}
    </div>
  );
};

Footer.propTypes = {
  selectedRange: PropTypes.shape({
    start: PropTypes.instanceOf(Date),
    end: PropTypes.instanceOf(Date),
  }).isRequired,
  setSelectedRange: PropTypes.func.isRequired,
  handleValueChange: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
};

export default React.memo(Footer);
