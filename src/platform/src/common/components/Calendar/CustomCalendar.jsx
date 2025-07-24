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
import { useMediaQuery } from 'react-responsive';

const isValidDate = (date) => date instanceof Date && !isNaN(date);

const CustomCalendar = ({
  initialStartDate,
  initialEndDate,
  initial_label = '',
  onChange = null,
  className = '',
  isLoading = false,
  dropdownWidth,
  dropdownAlign = 'left',
  calendarPosition = 'bottom',
  dropdownClassName = '',
  dropdownButtonClassName = '',
  dropdownMenuClassName = '',
  horizontalOffset = 0,
  verticalOffset = 0,
  dropdownStyle = {},
  enableTimePicker = false,
}) => {
  const containerRef = useRef(null);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [value, setValue] = useState({
    startDate: initialStartDate,
    endDate: initialEndDate,
    label: initial_label,
  });

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const computeDateLabel = useCallback((startDate, endDate) => {
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return {
        startDate: new Date(),
        endDate: new Date(),
        label: 'Invalid Date Range',
      };
    }
    const today = new Date();
    const yesterday = subDays(today, 1);
    const diff = Math.abs(differenceInDays(startDate, endDate));
    let label;

    try {
      if (isSameDay(startDate, yesterday) && isSameDay(endDate, yesterday))
        label = 'Yesterday';
      else if (isSameDay(startDate, endDate)) label = 'Today';
      else if (isSameDay(endDate, today) && diff === 7) label = 'Last 7 days';
      else if (isSameDay(endDate, today) && diff === 30) label = 'Last 30 days';
      else if (
        isSameDay(startDate, startOfQuarter(today)) &&
        isSameDay(endDate, endOfQuarter(today))
      )
        label = 'This quarter';
      else if (
        isSameDay(startDate, startOfQuarter(subMonths(today, 3))) &&
        isSameDay(endDate, endOfQuarter(subMonths(today, 3)))
      )
        label = 'Last quarter';
      else if (isSameDay(endDate, today) && diff === 90) label = 'Last 90 days';
      else if (
        isSameDay(startDate, startOfMonth(today)) &&
        isSameDay(endDate, endOfMonth(today))
      )
        label = 'This month';
      else if (
        isSameDay(startDate, startOfYear(today)) &&
        isSameDay(endDate, endOfYear(today))
      )
        label = 'This year';
      else if (
        isSameDay(startDate, startOfYear(subDays(today, 365))) &&
        isSameDay(endDate, endOfYear(subDays(today, 365)))
      )
        label = 'Last year';
      else {
        const sY = getYear(startDate);
        const eY = getYear(endDate);
        label =
          sY !== eY
            ? `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`
            : `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`;
      }
    } catch {
      label = 'Invalid Date Range';
    }
    return { startDate, endDate, label };
  }, []);

  const handleValueChange = useCallback(
    ({ start, end }) => {
      if (!isValidDate(start) || !isValidDate(end)) return;
      const { startDate, endDate, label } = computeDateLabel(start, end);
      setValue({ startDate, endDate, label });
      onChange?.(startDate, endDate, label);
      setOpenDatePicker(false);
    },
    [computeDateLabel, onChange],
  );

  useOutsideClick(containerRef, () => setOpenDatePicker(false));

  const handleToggle = useCallback(() => {
    if (!isLoading) setOpenDatePicker((prev) => !prev);
  }, [isLoading]);

  useEffect(() => {
    if (!isValidDate(initialStartDate) || !isValidDate(initialEndDate)) return;
    const { label } = computeDateLabel(initialStartDate, initialEndDate);
    setValue({ startDate: initialStartDate, endDate: initialEndDate, label });
  }, [initialStartDate, initialEndDate, computeDateLabel]);

  const getPositionClass = () => {
    switch (calendarPosition) {
      case 'top':
        return 'bottom-full mb-1';
      case 'right':
        return 'left-full ml-1';
      case 'left':
        return 'right-full mr-1';
      default:
        return 'top-full mt-1';
    }
  };

  const getPositionStyle = () => {
    const style = { ...dropdownStyle };
    if (horizontalOffset) style.left = `${horizontalOffset}px`;
    if (verticalOffset) style.top = `${verticalOffset}px`;
    return style;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <CustomDropdown
        text={value.label || 'Select Date Range'}
        icon={<CalendarIcon fill="#536A87" />}
        iconPosition="left"
        onClick={handleToggle}
        isButton
        showArrowWithButton
        disabled={isLoading}
        className={`w-full ${dropdownClassName}`}
        buttonClassName={`w-full px-4 py-2 text-gray-700 dark:text-white ${dropdownButtonClassName}`}
        menuClassName={dropdownMenuClassName}
        dropdownWidth={dropdownWidth}
        dropdownAlign={dropdownAlign}
      />

      <Transition
        show={openDatePicker}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
        className={`absolute z-50 ${getPositionClass()}`}
        style={getPositionStyle()}
      >
        <div className={`${isMobile ? '' : 'max-w-[350px]'}`}>
          <Calendar
            initialMonth1={
              new Date(new Date().getFullYear(), new Date().getMonth() - 1)
            }
            initialMonth2={new Date()}
            handleValueChange={handleValueChange}
            closeDatePicker={() => setOpenDatePicker(false)}
            showTwoCalendars={!isMobile}
            enableTimePicker={enableTimePicker}
          />
        </div>
      </Transition>
    </div>
  );
};

CustomCalendar.propTypes = {
  initialStartDate: PropTypes.instanceOf(Date).isRequired,
  initialEndDate: PropTypes.instanceOf(Date).isRequired,
  initial_label: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
  isLoading: PropTypes.bool,
  dropdownWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  dropdownAlign: PropTypes.oneOf(['left', 'right']),
  calendarPosition: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  dropdownClassName: PropTypes.string,
  dropdownButtonClassName: PropTypes.string,
  dropdownMenuClassName: PropTypes.string,
  horizontalOffset: PropTypes.number,
  verticalOffset: PropTypes.number,
  dropdownStyle: PropTypes.object,
};

export default CustomCalendar;
