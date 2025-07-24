import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { format, getHours, getMinutes, isValid } from 'date-fns';
import { Tooltip } from 'flowbite-react';
import { FaRegQuestionCircle } from 'react-icons/fa';
import Button from '../../Button';

const Footer = ({
  selectedRange,
  handleValueChange,
  close,
  enableTimePicker: initialEnableTimePicker = false,
  handleStartTimeChange,
  handleEndTimeChange,
  onTimePickerToggle,
  showTimePickerToggle = false, // New prop to control toggle visibility
}) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [enableTimePicker, setEnableTimePicker] = useState(
    initialEnableTimePicker,
  );

  const formatTimeForInput = (date) => {
    if (!date || !isValid(date)) return '00:00';
    return `${String(getHours(date)).padStart(2, '0')}:${String(getMinutes(date)).padStart(2, '0')}`;
  };

  const handleCancel = () => {
    close();
  };

  const handleApply = () => {
    if (!selectedRange.start || !selectedRange.end) {
      setErrorMsg('Please select both start and end dates.');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    handleValueChange(selectedRange);
    close();
  };

  const handleTimePickerToggle = () => {
    const newValue = !enableTimePicker;
    setEnableTimePicker(newValue);
    if (onTimePickerToggle) {
      onTimePickerToggle(newValue);
    }
  };

  const ToggleSwitch = () => (
    <div className="flex items-center space-x-2 mb-3 md:mb-0">
      <span className="text-xs text-gray-600 dark:text-gray-300 flex items-center">
        <Tooltip
          content={
            <span>
              You must select a date from the calendar to set the time.
              <br />
              Click the clock icon to select time.
            </span>
          }
          placement="top"
          trigger="hover"
          className="z-50"
        >
          <div className="flex items-center">
            Include Time
            <span className="ml-1 cursor-pointer">
              <FaRegQuestionCircle className="w-3 h-3 text-primary" />
            </span>
          </div>
        </Tooltip>
      </span>
      <button
        type="button"
        onClick={handleTimePickerToggle}
        className={`relative inline-flex h-4 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          enableTimePicker ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
        }`}
        aria-label="Toggle time picker"
        aria-pressed={enableTimePicker}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
            enableTimePicker ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const DateTimeInputs = () => (
    <form className="hidden md:flex md:items-center md:space-x-2">
      <div className="flex flex-col">
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
        {enableTimePicker && (
          <input
            type="time"
            value={
              selectedRange.start
                ? formatTimeForInput(selectedRange.startTime)
                : '00:00'
            }
            onChange={handleStartTimeChange}
            className="mt-1 flex items-center shadow-sm w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 dark:bg-gray-800 rounded-lg focus:bg-white dark:focus:bg-gray-700 focus:ring-1 focus:ring-primary focus:outline-none md:w-32"
            aria-label="Start Time"
            disabled={!selectedRange.start}
          />
        )}
      </div>
      <div className={`px-2 ${enableTimePicker ? 'flex items-center' : ''}`}>
        <span className="text-gray-600 dark:text-gray-400 text-[16px]">-</span>
      </div>
      <div className="flex flex-col">
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
        {enableTimePicker && (
          <input
            type="time"
            value={
              selectedRange.end
                ? formatTimeForInput(selectedRange.endTime)
                : '23:59'
            }
            onChange={handleEndTimeChange}
            className="mt-1 flex items-center shadow-sm w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 dark:bg-gray-800 rounded-lg focus:bg-white dark:focus:bg-gray-700 focus:ring-1 focus:ring-primary focus:outline-none md:w-32"
            aria-label="End Time"
            disabled={!selectedRange.end}
          />
        )}
      </div>
    </form>
  );

  return (
    <div className="flex flex-col px-6 py-4 border-t border-gray-100 dark:border-gray-700">
      {/* Mobile Layout */}
      <div className="flex flex-col space-y-3 md:hidden">
        {showTimePickerToggle && <ToggleSwitch />}

        {/* Mobile Date/Time Display */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 w-12">
              From:
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {selectedRange.start
                ? `${format(selectedRange.start, 'MMM d, yyyy')}${enableTimePicker && selectedRange.startTime ? ` at ${formatTimeForInput(selectedRange.startTime)}` : ''}`
                : 'Select start date'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 w-12">
              To:
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {selectedRange.end
                ? `${format(selectedRange.end, 'MMM d, yyyy')}${enableTimePicker && selectedRange.endTime ? ` at ${formatTimeForInput(selectedRange.endTime)}` : ''}`
                : 'Select end date'}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex md:items-center md:justify-between">
        <div className="flex items-center space-x-4">
          {showTimePickerToggle && <ToggleSwitch />}
          <DateTimeInputs />
        </div>

        <div className="flex items-center space-x-2">
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
      </div>

      {/* Mobile Action Buttons */}
      <div className="flex items-center justify-center space-x-2 mt-4 md:hidden">
        <Button
          onClick={handleCancel}
          type="button"
          variant="outlined"
          aria-label="Cancel Selection"
          className="dark:bg-transparent flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          type="button"
          variant="filled"
          aria-label="Apply Selection"
          className="flex-1"
        >
          Apply
        </Button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="text-red-500 dark:text-red-400 text-sm mt-3 text-center md:text-left">
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
    startTime: PropTypes.instanceOf(Date),
    endTime: PropTypes.instanceOf(Date),
  }).isRequired,
  handleValueChange: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  enableTimePicker: PropTypes.bool,
  handleStartTimeChange: PropTypes.func,
  handleEndTimeChange: PropTypes.func,
  onTimePickerToggle: PropTypes.func,
  showTimePickerToggle: PropTypes.bool,
};

export default React.memo(Footer);
