import React, { useState } from 'react';
import DatePicker from 'react-tailwindcss-datepicker';
import CalendarIcon from '@/icons/calendar.svg';
import ChevronDownIcon from '@/icons/Common/chevron_down.svg';
import { useSelector, useDispatch } from 'react-redux';
import { setChartDataRange } from '@/lib/store/services/charts/ChartSlice';

const CustomCalendar = ({
  initialStartDate,
  initialEndDate,
  id,
  Icon,
  dropdown,
  position,
  className,
}) => {
  const dispatch = useDispatch();
  const chartData = useSelector((state) => state.chart);
  const [value, setValue] = useState({
    startDate: initialStartDate,
    endDate: initialEndDate,
  });

  const handleValueChange = (newValue) => {
    const computeDaysBetweenDates = (startDate, endDate) => {
      const oneDay = 24 * 60 * 60 * 1000;
      return Math.round(Math.abs((startDate.getTime() - endDate.getTime()) / oneDay));
    };

    const isSameDay = (date1, date2) =>
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();

    const handleDateChange = (newValue) => {
      const startDate = new Date(newValue.startDate);
      const endDate = new Date(newValue.endDate);

      const today = new Date();

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const computedValue = computeDaysBetweenDates(startDate, endDate);

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
      }

      // include also for This month and Last month
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);

      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

      if (isSameDay(startDate, thisMonthStart) && isSameDay(endDate, today)) {
        label = 'This month';
      } else if (isSameDay(startDate, lastMonthStart) && isSameDay(endDate, lastMonthEnd)) {
        label = 'Last month';
      }

      dispatch(setChartDataRange({ startDate, endDate, label }));
      setValue(newValue);
    };

    handleDateChange(newValue);
  };

  const DatePickerHiddenInput = () => (
    <DatePicker
      onChange={handleValueChange}
      showShortcuts
      showFooter
      inputId={id}
      popoverDirection={position}
      inputClassName='absolute opacity-0 pointer-events-none w-0 h-0 z-[-1]'
      toggleClassName='absolute opacity-0 pointer-events-none w-0 h-0 z-[-1]'
    />
  );

  const handleDatepicker = (e) => {
    e.preventDefault();
    document.getElementById(id).focus();
  };

  return (
    <div className='relative cursor-pointer' onClick={handleDatepicker}>
      <button
        type='button'
        className='relative border w-auto h-full border-grey-750 rounded flex items-center justify-between gap-2 px-4 py-3'>
        {Icon ? <Icon /> : <CalendarIcon />}
        <span className='hidden sm:inline-block text-sm font-medium'>
          {chartData.chartDataRange.label}
        </span>
        {dropdown && <ChevronDownIcon />}
      </button>
      <div className={`absolute top-10 ${className}`}>
        <DatePickerHiddenInput />
      </div>
    </div>
  );
};

export default CustomCalendar;
