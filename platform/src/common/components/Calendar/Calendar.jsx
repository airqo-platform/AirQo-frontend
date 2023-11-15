import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isWithinInterval,
  isSameDay,
  isBefore,
} from 'date-fns';
import Footer from './components/Footer';
import ShortCuts from './components/ShortCuts';
import CalendarHeader from './components/CalendarHeader';

const Calendar = ({ initialMonth1, initialMonth2, handleValueChange, closeDatePicker }) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [selectedDays1, setSelectedDays1] = useState([]);
  const [selectedDays2, setSelectedDays2] = useState([]);
  const [month1, setMonth1] = useState(initialMonth1);
  const [month2, setMonth2] = useState(initialMonth2);
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null });

  const handleDayClick = (day, setSelectedDays) => {
    setSelectedDays((prev) => [...prev, day]);
    if (!selectedRange.start) {
      setSelectedRange({ start: day, end: null });
    } else if (!selectedRange.end) {
      if (isBefore(day, selectedRange.start)) {
        setSelectedRange({ start: day, end: selectedRange.start });
      } else {
        setSelectedRange({ start: selectedRange.start, end: day });
      }
    } else {
      setSelectedRange({ start: day, end: null });
    }
  };

  const renderDays = (month, selectedDays, setSelectedDays, closeDatePicker) => {
    const daysOfMonth = eachDayOfInterval({
      start: startOfMonth(month),
      end: endOfMonth(month),
    });

    return daysOfMonth.map((day, index) => {
      let isStartOrEndDay =
        (selectedRange.start && isSameDay(day, selectedRange.start)) ||
        (selectedRange.end && isSameDay(day, selectedRange.end));
      let isInBetween =
        selectedRange.start &&
        selectedRange.end &&
        isWithinInterval(day, selectedRange) &&
        !isStartOrEndDay;
      let isFirstOrLast = index === 0 || index === daysOfMonth.length - 1;
      let isToday = isSameDay(day, new Date());

      return (
        <div
          key={day}
          className={`flex justify-center items-center ${
            isInBetween
              ? 'bg-gray-100 first:rounded-s-full last:rounded-e-full dark:bg-gray-800'
              : ''
          }`}>
          <button
            onClick={() => handleDayClick(day, setSelectedDays)}
            className={`w-10 h-10 flex justify-center items-center ${
              selectedDays.includes(day)
                ? 'bg-blue-600 hover:text-white text-white dark:bg-blue-500 rounded-full'
                : isStartOrEndDay
                ? 'bg-blue-600 hover:text-white text-white dark:bg-blue-500 rounded-full'
                : isToday
                ? 'text-blue-600'
                : 'text-gray-800 dark:text-gray-200'
            } ${
              isFirstOrLast ? 'rounded-s-full' : 'rounded-e-full'
            } hover:border-blue-600 hover:text-blue-600 dark:hover:border-gray-500 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600 disabled:text-gray-300 disabled:pointer-events-none md:w-14 lg:w-16`}>
            {format(day, 'd')}
          </button>
        </div>
      );
    });
  };

  return (
    <div className='flex flex-col items-center justify-center w-auto bg-none md:flex-row mb-10'>
      <div className='z-50 flex flex-col border border-gray-100 bg-white shadow-lg rounded-xl max-w-full min-w-[260px] md:min-w-[660px] lg:min-w-[800px]'>
        <div className='flex flex-col'>
          <div className='divide-x flex flex-col md:flex-row lg:flex-row'>
            {/* shortcut section */}
            <ShortCuts setSelectedRange={setSelectedRange} />

            {/* calendar section one */}
            <div className='flex flex-col px-6 pt-5 pb-6'>
              <CalendarHeader
                month={format(month1, 'MMMM yyyy')}
                onNext={() => setMonth1(addMonths(month1, 1))}
                onPrev={() => setMonth1(subMonths(month1, 1))}
              />
              <div className='grid grid-cols-7 text-xs text-center text-gray-900'>
                {daysOfWeek.map((day) => (
                  <span
                    key={day}
                    className='flex text-gray-600 items-center justify-center w-10 h-10 font-semibold rounded-lg'>
                    {day}
                  </span>
                ))}
                {renderDays(month1, selectedDays1, setSelectedDays1)}
              </div>
            </div>
            {/* calendar section two */}
            <div className='flex flex-col px-6 pt-5 pb-6'>
              <CalendarHeader
                month={format(month2, 'MMMM yyyy')}
                onNext={() => setMonth2(addMonths(month2, 1))}
                onPrev={() => setMonth2(subMonths(month2, 1))}
              />
              <div className='grid grid-cols-7 text-xs text-center text-gray-900'>
                {daysOfWeek.map((day) => (
                  <span
                    key={day}
                    className='flex text-gray-600 items-center justify-center w-10 h-10 font-semibold rounded-lg'>
                    {day}
                  </span>
                ))}
                {renderDays(month2, selectedDays2, setSelectedDays2)}
              </div>
            </div>
          </div>
          {/* footer section */}
          <Footer
            selectedRange={selectedRange}
            setSelectedRange={setSelectedRange}
            handleValueChange={handleValueChange}
            close={closeDatePicker}
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
