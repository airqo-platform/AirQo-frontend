import React, { useState, useRef } from 'react';
import CalendarIcon from '@/icons/calendar.svg';
import ChevronDownIcon from '@/icons/Common/chevron_down.svg';
import { useSelector, useDispatch } from 'react-redux';
import { setChartDataRange } from '@/lib/store/services/charts/ChartSlice';
import Calendar from './Calendar';
import useOutsideClick from '@/core/utils/useOutsideClick';
import {
  differenceInDays,
  isSameDay,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  subMonths,
  subDays,
} from 'date-fns';

/**
 * @param {Object} props
 * @param {Date} props.initialStartDate
 * @param {Date} props.initialEndDate
 *  @param {String} props.id
 * @param {Function} props.Icon
 * @param {Boolean} props.dropdown
 * @param {String} props.position
 * @param {String} props.className
 * @returns {JSX.Element}
 * @description CustomCalendar component
 */
const CustomCalendar = ({ initialStartDate, initialEndDate, Icon, dropdown, className }) => {
  const containerRef = useRef(null);
  const dispatch = useDispatch();
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const chartData = useSelector((state) => state.chart);
  const [value, setValue] = useState({
    startDate: initialStartDate,
    endDate: initialEndDate,
  });

  /**
   * @returns {void}
   * @description Handles the value change
   * @param {Object} newValue
   * @param {Date} newValue.start
   * @param {Date} newValue.end
   * @returns {void}
   */
  const handleValueChange = (newValue) => {
    const handleDateChange = (newValue) => {
      const startDate = new Date(newValue.start);
      const endDate = new Date(newValue.end);

      const today = new Date();

      const yesterday = subDays(today, 1);

      const computedValue = Math.abs(differenceInDays(startDate, endDate));

      let label = `Last ${computedValue} days`;

      if (isSameDay(startDate, yesterday) && isSameDay(endDate, yesterday)) {
        label = 'Yesterday';
      } else if (isSameDay(startDate, endDate)) {
        label = 'Today';
      } else if (computedValue === 7 || computedValue === 6) {
        label = 'Last 7 days';
      } else if (computedValue === 30 || computedValue === 29) {
        label = 'Last 30 days';
      } else if (computedValue === 90 || computedValue === 89) {
        label = 'Last 90 days';
      } else if (computedValue === 365 || computedValue === 364) {
        label = 'This year';
      } else if (computedValue === 730 || computedValue === 729) {
        label = 'Last year';
      }

      const thisMonthStart = startOfMonth(today);
      const lastMonthStart = startOfMonth(subMonths(today, 1));
      const lastMonthEnd = endOfMonth(subMonths(today, 1));

      if (isSameDay(startDate, thisMonthStart) && isSameDay(endDate, today)) {
        label = 'This month';
      } else if (isSameDay(startDate, lastMonthStart) && isSameDay(endDate, lastMonthEnd)) {
        label = 'Last month';
      }

      const thisQuarterStart = startOfQuarter(today);
      const lastQuarterStart = startOfQuarter(subMonths(today, 3));
      const lastQuarterEnd = endOfQuarter(subMonths(today, 3));

      if (isSameDay(startDate, thisQuarterStart) && isSameDay(endDate, today)) {
        label = 'This quarter';
      } else if (isSameDay(startDate, lastQuarterStart) && isSameDay(endDate, lastQuarterEnd)) {
        label = 'Last quarter';
      }

      dispatch(setChartDataRange({ startDate, endDate, label }));
      setValue(newValue);
    };

    handleDateChange(newValue);
  };

  /**
   * @returns {void}
   * @description Renders the hidden input for the date picker
   * @returns {JSX.Element}
   * @description DatePickerHiddenInput component
   */
  const DatePickerHiddenInput = () => (
    <Calendar
      initialMonth1={new Date(2023, 1)}
      initialMonth2={new Date(2023, 2)}
      handleValueChange={handleValueChange}
      closeDatePicker={() => setOpenDatePicker(false)}
    />
  );

  /**
   * @returns {void}
   * @description Handles the click event
   * @param {Event} event
   */
  const handleClick = (event) => {
    event.stopPropagation();
    setOpenDatePicker(!openDatePicker);
  };

  /**
   * @returns {void}
   * @description Handles the outside click event
   * @param {String} selector
   * @param {Function} callback
   */
  useOutsideClick(containerRef, () => {
    setOpenDatePicker(false);
  });

  return (
    <div className='relative cursor-pointer date-picker-container' ref={containerRef}>
      <button
        onClick={handleClick}
        type='button'
        className='relative border border-grey-750 rounded flex items-center justify-between gap-2 px-4 py-3'>
        {Icon ? <Icon /> : <CalendarIcon />}
        <span className='hidden sm:inline-block text-sm font-medium'>
          {chartData.chartDataRange.label}
        </span>
        {dropdown && <ChevronDownIcon />}
      </button>
      <div
        className={`absolute top-[50px] z-[900] ${className} ${
          openDatePicker ? 'block' : 'hidden'
        }`}>
        <DatePickerHiddenInput />
      </div>
    </div>
  );
};

export default CustomCalendar;
