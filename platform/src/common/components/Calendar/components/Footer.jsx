import React, { useState } from 'react';
import { format } from 'date-fns';
import Button from '../../Button';

/**
 * @param {Object} props
 * @param {Object} props.selectedRange
 * @param {Function} props.setSelectedRange
 * @param {Function} props.handleValueChange
 * @param {Function} props.close
 * @param {Boolean} props.showTwoCalendars
 * @returns {JSX.Element}
 * @description Footer component
 */
const Footer = ({
  selectedRange,
  setSelectedRange,
  handleValueChange,
  close,
}) => {
  const [errorMsg, setErrorMsg] = useState('');

  /**
   * @returns {void}
   * @description Handles the cancel button click event
   */
  const handleCancel = () => {
    setSelectedRange({ start: null, end: null });
    close();
  };

  /**
   * @returns {void}
   * @description Handles the apply button click event
   */
  const handleApply = () => {
    if (!selectedRange.start && !selectedRange.end) {
      setErrorMsg('No date selected!');
      setTimeout(() => {
        setErrorMsg('');
      }, 3000);
      return;
    }
    handleValueChange(selectedRange);
    close();
  };

  return (
    <div className="flex flex-col items-center justify-between px-6 py-4 border-t border-gray-100 md:flex-row w-auto">
      <form className="hidden md:flex md:items-center md:space-x-2">
        <input
          type="text"
          readOnly
          value={
            selectedRange.start
              ? format(selectedRange.start, 'MMM d, yyyy')
              : ''
          }
          className="flex items-center shadow-sm w-full px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none md:w-32"
          placeholder="Start date"
          disabled
        />
        <div className="p-2">
          <span className="text-gray-600 text-[16px]">-</span>
        </div>
        <input
          type="text"
          readOnly
          value={
            selectedRange.end ? format(selectedRange.end, 'MMM d, yyyy') : ''
          }
          className="flex items-center shadow-sm w-full px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none md:w-32"
          placeholder="End date"
          disabled
        />
      </form>

      <div className="flex items-center space-x-2 mt-2 md:mt-0">
        <Button onClick={handleCancel} type="button" variant={'outlined'}>
          Cancel
        </Button>
        <Button onClick={handleApply} type="button" variant={'filled'}>
          Apply
        </Button>
      </div>
      {errorMsg && (
        <div className="text-red-500 text-sm w-auto">Select date range</div>
      )}
    </div>
  );
};

export default Footer;
