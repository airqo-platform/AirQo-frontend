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
  startOfYear,
  endOfYear,
  format,
  getYear,
} from 'date-fns';
import {
  updateUserPreferences,
  getIndividualUserPreferences,
} from '@/lib/store/services/account/UserDefaultsSlice';

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
  const userInfo = useSelector((state) => state.login.userInfo);

  /**
   * @returns {void}
   * @description Handles the value change
   * @param {Object} newValue
   * @param {Date} newValue.start
   * @param {Date} newValue.end
   * @returns {void}
   */
  const handleValueChange = (newValue) => {
    if (!newValue || !newValue.start || !newValue.end) {
      return;
    }

    const handleDateChange = async (newValue) => {
      const startDate = new Date(newValue.start);
      const endDate = new Date(newValue.end);

      const today = new Date();
      const yesterday = subDays(today, 1);

      const computedValue = Math.abs(differenceInDays(startDate, endDate));

      let label;

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
      } else if (isSameDay(startDate, startOfYear(today)) && isSameDay(endDate, endOfYear(today))) {
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

      await dispatch(setChartDataRange({ startDate, endDate, label }));
      const userId = userInfo?._id;
      const data = {
        user_id: userId,
        startDate,
        endDate,
        period: { label },
      };
      const updatePreferencesresponse = await dispatch(updateUserPreferences(data));
      if (updatePreferencesresponse?.payload?.success) {
        await dispatch(getIndividualUserPreferences(userId));
      }
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
      initialMonth1={new Date(new Date().getFullYear(), new Date().getMonth() - 1)}
      initialMonth2={new Date()}
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
        className='relative border border-grey-750 rounded-xl flex items-center justify-between gap-2 px-4 py-3'
      >
        {Icon ? <Icon /> : <CalendarIcon />}
        <span className='hidden sm:inline-block text-sm font-medium'>
          {chartData.chartDataRange.label}
        </span>
        {dropdown && <ChevronDownIcon />}
      </button>
      <div
        className={`absolute z-50 max-w-[350px] ${className} ${
          openDatePicker
            ? 'opacity-100 translate-y-0 visible'
            : 'opacity-0 -translate-y-2 invisible'
        } transition-all duration-400 ease-in-out transform`}
      >
        <DatePickerHiddenInput />
      </div>
    </div>
  );
};

export default CustomCalendar;
