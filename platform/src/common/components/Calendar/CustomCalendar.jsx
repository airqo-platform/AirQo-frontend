import React, { useState } from 'react';
import DatePicker from 'react-tailwindcss-datepicker';
import CalendarIcon from '@/icons/calendar.svg';
import ChevronDownIcon from '@/icons/Common/chevron_down.svg';
import { useSelector, useDispatch } from 'react-redux';
import { setChartDataRange } from '@/lib/store/services/charts/ChartSlice';
const CustomCalendar = ({ initialStartDate, initialEndDate, id, Icon, dropdown, position }) => {
  const dispatch = useDispatch();
  const chartData = useSelector((state) => state.chart);
  const [value, setValue] = useState({
    startDate: initialStartDate,
    endDate: initialEndDate,
  });

  const handleValueChange = (newValue) => {
    const startDate = new Date(newValue.startDate);
    const endDate = new Date(newValue.endDate);
    const computedValue = computeDaysBetweenDates(startDate, endDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (computedValue <= 7) {
      setValue('last 7 days');
      dispatch(setChartDataRange('last 7 days'));
    } else if (computedValue <= 30) {
      setValue('last 30 days');
      dispatch(setChartDataRange('last 30 days'));
    } else if (computedValue <= 90) {
      setValue('last 90 days');
      dispatch(setChartDataRange('last 90 days'));
    } else if (computedValue <= 365) {
      setValue('last 365 days');
      dispatch(setChartDataRange('last 365 days'));
    } else {
      setValue(`last ${computedValue} days`);
      dispatch(setChartDataRange(`last ${computedValue} days`));
    }

    if (isSameDay(startDate, endDate)) {
      setValue('Today');
      dispatch(setChartDataRange('Today'));
    } else if (isSameDay(startDate, yesterday) && isSameDay(endDate, yesterday)) {
      setValue('Yesterday');
      dispatch(setChartDataRange('Yesterday'));
    }

    // include also for This month and Last month
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    if (isSameDay(startDate, thisMonthStart) && isSameDay(endDate, today)) {
      setValue('This month');
      dispatch(setChartDataRange('This month'));
    } else if (isSameDay(startDate, lastMonthStart) && isSameDay(endDate, lastMonthEnd)) {
      setValue('Last month');
      dispatch(setChartDataRange('Last month'));
    }
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const computeDaysBetweenDates = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((start.getTime() - end.getTime()) / oneDay));

    console.log(`Difference in days: ${diffDays}`);
    return diffDays;
  };

  const DatePickerHiddenInput = () => (
    <DatePicker
      onChange={handleValueChange}
      showShortcuts
      showFooter
      inputId={id}
      inputClassName='absolute opacity-0 pointer-events-none w-0 h-0 z-[-1]'
      toggleClassName='absolute opacity-0 pointer-events-none w-0 h-0 z-[-1]'
      //   configs={{
      //     shortcuts: {
      //       Today: new Date(),
      //       Yesterday: new Date(new Date().setDate(new Date().getDate() - 1)),
      //       'Last 7 days': new Date(new Date().setDate(new Date().getDate() - 7)),
      //       'Last 30 days': new Date(new Date().setDate(new Date().getDate() - 30)),
      //       'Last 90 days': new Date(new Date().setDate(new Date().getDate() - 90)),
      //       'Last month': new Date(new Date().setMonth(new Date().getMonth() - 1)),
      //       'This year': new Date(new Date().getFullYear(), 0),
      //       'Last year': new Date(new Date().getFullYear() - 1, 0),
      //     },
      //   }}
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
        className='relative border border-grey-750 w-15 h-10 rounded-lg flex items-center justify-between gap-2 p-[10px]'>
        {Icon ? <Icon /> : <CalendarIcon />}
        <span className='text-sm font-medium'>{chartData.chartDataRange}</span>
        {dropdown && <ChevronDownIcon />}
      </button>
      <div className='absolute' style={position}>
        <DatePickerHiddenInput />
      </div>
    </div>
  );
};

export default CustomCalendar;
