import React, { useState, useEffect } from 'react';
import CalendarIcon from '@/icons/calendar.svg';
import ChevronDownIcon from '@/icons/Common/chevron_down.svg';
import { useSelector, useDispatch } from 'react-redux';
import { setChartDataRange } from '@/lib/store/services/charts/ChartSlice';
import Calendar from './Calendar';
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
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const chartData = useSelector((state) => state.chart);
  const [value, setValue] = useState({
    startDate: initialStartDate,
    endDate: initialEndDate,
  });

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

  const DatePickerHiddenInput = () => (
    <Calendar
      initialMonth1={new Date(2023, 1)}
      initialMonth2={new Date(2023, 2)}
      handleValueChange={handleValueChange}
      closeDatePicker={() => setOpenDatePicker(false)}
    />
  );
  const handleClick = (event) => {
    event.stopPropagation();
    setOpenDatePicker(!openDatePicker);
  };

  const handleClickOutside = (event) => {
    if (event.target.closest('.date-picker-container') === null) {
      setOpenDatePicker(false);
    }
  };

  useEffect(() => {
    if (openDatePicker) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDatePicker]);

  return (
    <div className='relative cursor-pointer date-picker-container'>
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
      <div className={`absolute top-[50px] ${className} ${openDatePicker ? 'block' : 'hidden'}`}>
        <DatePickerHiddenInput />
      </div>
    </div>
  );
};
export default CustomCalendar;
