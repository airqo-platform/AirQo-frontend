import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Transition } from '@headlessui/react';
import {
  differenceInDays,
  isSameDay,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  subMonths,
  subDays,
  startOfYear,
  endOfYear,
  format,
  getYear,
} from 'date-fns';
import CalendarIcon from '@/icons/Analytics/calendarIcon';
import CustomDropdown from '../Button/CustomDropdown';
import Calendar from './Calendar';
import { useOutsideClick } from '@/core/hooks';

/**
 * Helper function to check if a value is a valid Date object.
 *
 * @param {any} date - The value to check.
 * @returns {boolean} - True if valid Date, else false.
 */
const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

/**
 * CustomCalendar Component with dark mode support
 */
const CustomCalendar = ({
  initialStartDate,
  initialEndDate,
  initial_label,
  onChange,
  className = '',
  isLoading = false,
}) => {
  const containerRef = useRef(null);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [value, setValue] = useState({
    startDate: initialStartDate,
    endDate: initialEndDate,
    label: initial_label,
  });

  /**
   * Computes the label based on the selected date range.
   *
   * @param {Date} startDate - Selected start date.
   * @param {Date} endDate - Selected end date.
   * @returns {Object} - Contains startDate, endDate, and label.
   */
  const computeDateLabel = useCallback((startDate, endDate) => {
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      console.error('Invalid startDate or endDate provided.');
      return {
        startDate: new Date(),
        endDate: new Date(),
        label: 'Invalid Date Range',
      };
    }

    const today = new Date();
    const yesterday = subDays(today, 1);
    const computedValue = Math.abs(differenceInDays(startDate, endDate));
    let label;

    try {
      if (isSameDay(startDate, yesterday) && isSameDay(endDate, yesterday)) {
        label = 'Yesterday';
      } else if (isSameDay(startDate, endDate)) {
        label = 'Today';
      } else if (isSameDay(endDate, today) && computedValue === 7) {
        label = 'Last 7 days';
      } else if (isSameDay(endDate, today) && computedValue === 30) {
        label = 'Last 30 days';
      } else if (
        isSameDay(startDate, startOfQuarter(today)) &&
        isSameDay(endDate, endOfQuarter(today))
      ) {
        label = 'This quarter';
      } else if (
        isSameDay(startDate, startOfQuarter(subMonths(today, 3))) &&
        isSameDay(endDate, endOfQuarter(subMonths(today, 3)))
      ) {
        label = 'Last quarter';
      } else if (isSameDay(endDate, today) && computedValue === 90) {
        label = 'Last 90 days';
      } else if (
        isSameDay(startDate, startOfMonth(today)) &&
        isSameDay(endDate, endOfMonth(today))
      ) {
        label = 'This month';
      } else if (
        isSameDay(startDate, startOfYear(today)) &&
        isSameDay(endDate, endOfYear(today))
      ) {
        label = 'This year';
      } else if (
        isSameDay(startDate, startOfYear(subDays(today, 365))) &&
        isSameDay(endDate, endOfYear(subDays(today, 365)))
      ) {
        label = 'Last year';
      } else {
        const startYear = getYear(startDate);
        const endYear = getYear(endDate);
        if (startYear !== endYear) {
          label = `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`;
        } else {
          label = `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`;
        }
      }
    } catch (error) {
      console.error('Error formatting dates:', error);
      label = 'Invalid Date Range';
    }

    return { startDate, endDate, label };
  }, []);

  /**
   * Handles the value change from the Calendar component.
   *
   * @param {Object} newValue - New date range values.
   * @param {Date} newValue.start - New start date.
   * @param {Date} newValue.end - New end date.
   */
  const handleValueChange = useCallback(
    (newValue) => {
      if (
        !newValue ||
        !isValidDate(newValue.start) ||
        !isValidDate(newValue.end)
      ) {
        console.warn('Invalid date range selected.');
        return;
      }

      const { startDate, endDate, label } = computeDateLabel(
        newValue.start,
        newValue.end,
      );

      // Update local state
      setValue({ startDate, endDate, label });

      // Call the onChange prop if provided
      if (onChange) {
        onChange(startDate, endDate, label);
      }

      // Close the date picker after selection
      setOpenDatePicker(false);
    },
    [computeDateLabel, onChange],
  );

  /**
   * Closes the date picker when clicking outside the component.
   */
  useOutsideClick(containerRef, () => {
    setOpenDatePicker(false);
  });

  /**
   * Toggles the visibility of the date picker.
   */
  const handleToggleDatePicker = useCallback(() => {
    if (isLoading) return; // Prevent toggling if loading
    setOpenDatePicker((prev) => !prev);
  }, [isLoading]);

  /**
   * Closes the date picker.
   */
  const handleCloseDatePicker = useCallback(() => {
    setOpenDatePicker(false);
  }, []);

  /**
   * Effect to update local state when initialStartDate or initialEndDate props change.
   */
  useEffect(() => {
    if (!isValidDate(initialStartDate) || !isValidDate(initialEndDate)) {
      console.error('Invalid initialStartDate or initialEndDate props.');
      setValue({
        startDate: new Date(),
        endDate: new Date(),
        label: 'Invalid Date Range',
      });
      return;
    }

    const { label } = computeDateLabel(initialStartDate, initialEndDate);
    setValue({
      startDate: initialStartDate,
      endDate: initialEndDate,
      label,
    });
  }, [initialStartDate, initialEndDate, computeDateLabel]);

  /**
   * Renders the Calendar component within a Transition for animation.
   *
   * @returns {JSX.Element}
   */
  const renderCalendar = () => (
    <Transition
      show={openDatePicker}
      enter="transition ease-out duration-200"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-150"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <div className={`absolute z-50 max-w-[350px] ${className}`}>
        <Calendar
          initialMonth1={
            new Date(new Date().getFullYear(), new Date().getMonth() - 1)
          }
          initialMonth2={new Date()}
          handleValueChange={handleValueChange}
          closeDatePicker={handleCloseDatePicker}
        />
      </div>
    </Transition>
  );

  return (
    <div
      className="relative cursor-pointer date-picker-container"
      ref={containerRef}
    >
      <CustomDropdown
        text={value.label || 'Select Date Range'}
        icon={<CalendarIcon />}
        iconPosition="left"
        onClick={handleToggleDatePicker}
        isButton={true}
        showArrowWithButton={true}
        disabled={isLoading}
      />
      {renderCalendar()}
    </div>
  );
};

CustomCalendar.propTypes = {
  initialStartDate: PropTypes.instanceOf(Date).isRequired,
  initialEndDate: PropTypes.instanceOf(Date).isRequired,
  onChange: PropTypes.func,
  className: PropTypes.string,
  dropdown: PropTypes.bool,
  isLoading: PropTypes.bool,
  darkMode: PropTypes.bool,
};

CustomCalendar.defaultProps = {
  onChange: null,
  className: '',
  dropdown: false,
  isLoading: false,
  darkMode: false,
};

export default CustomCalendar;
