import React, { useState, useCallback, useMemo } from 'react';
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
  isSameMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import Footer from './components/Footer';
import ShortCuts from './components/ShortCuts';
import CalendarHeader from './components/CalendarHeader';
import PropTypes from 'prop-types';

const Calendar = ({
  initialMonth1,
  initialMonth2,
  handleValueChange,
  closeDatePicker,
  showTwoCalendars = true,
}) => {
  const daysOfWeek = useMemo(
    () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    [],
  );
  const [selectedDays1, setSelectedDays1] = useState([]);
  const [selectedDays2, setSelectedDays2] = useState([]);
  const [month1, setMonth1] = useState(initialMonth1);
  const [month2, setMonth2] = useState(initialMonth2);
  const [selectedRange, setSelectedRange] = useState({
    start: null,
    end: null,
  });

  const handleDayClick = useCallback(
    (day, setSelectedDays) => {
      setSelectedDays((prev) => [...prev, day]);

      let newSelectedRange;

      if (!selectedRange.start) {
        newSelectedRange = { start: day, end: null };
      } else if (!selectedRange.end) {
        newSelectedRange = {
          start: isBefore(day, selectedRange.start) ? day : selectedRange.start,
          end: isBefore(day, selectedRange.start) ? selectedRange.start : day,
        };
      } else {
        newSelectedRange = { start: day, end: null };
      }

      setSelectedRange(newSelectedRange);

      if (!showTwoCalendars) {
        handleValueChange(newSelectedRange);
      }
    },
    [selectedRange, showTwoCalendars, handleValueChange],
  );

  const renderDays = useCallback(
    (month, selectedDays, setSelectedDays) => {
      const startDay = showTwoCalendars
        ? startOfWeek(startOfMonth(month))
        : startOfMonth(month);
      const endDay = showTwoCalendars
        ? endOfWeek(endOfMonth(month))
        : endOfMonth(month);
      const daysOfMonth = eachDayOfInterval({
        start: startDay,
        end: endDay,
      });

      return daysOfMonth.map((day) => {
        const isStartOrEndDay =
          (selectedRange.start && isSameDay(day, selectedRange.start)) ||
          (selectedRange.end && isSameDay(day, selectedRange.end));
        const isInBetween =
          selectedRange.start &&
          selectedRange.end &&
          isWithinInterval(day, selectedRange) &&
          !isStartOrEndDay;
        const isStartOfWeek = day.getDay() === 0;
        const isEndOfWeek = day.getDay() === 6;
        const isToday = isSameDay(day, new Date());
        const isCurrentMonth = isSameMonth(day, month);

        return (
          <div
            key={day.toISOString()}
            className={`flex justify-center items-center ${
              isInBetween || isStartOrEndDay
                ? 'bg-gray-100 text-gray-800 dark:bg-gray-800'
                : ''
            } ${
              (selectedRange.start && isSameDay(day, selectedRange.start)) ||
              isStartOfWeek
                ? 'rounded-l-full'
                : ''
            } ${
              (selectedRange.end && isSameDay(day, selectedRange.end)) ||
              isEndOfWeek
                ? 'rounded-r-full'
                : ''
            }`}
          >
            <button
              onClick={() => handleDayClick(day, setSelectedDays)}
              className={`
            w-10 h-10 text-sm flex justify-center items-center 
            ${
              selectedDays.some((d) => isSameDay(d, day)) || isStartOrEndDay
                ? 'bg-blue-600 dark:bg-blue-500 rounded-full text-red-50 hover:text-red-50'
                : ''
            }
            ${
              isToday
                ? 'text-blue-600'
                : isCurrentMonth
                  ? 'text-gray-800 dark:text-gray-200'
                  : showTwoCalendars
                    ? 'text-gray-300'
                    : 'hidden'
            }
            hover:border-blue-600 hover:text-blue-600 hover:rounded-full hover:border dark:hover:border-gray-500 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600 
            disabled:text-gray-300 disabled:pointer-events-none md:w-14 lg:w-16
          `}
            >
              {format(day, 'd')}
            </button>
          </div>
        );
      });
    },
    [showTwoCalendars, selectedRange, handleDayClick],
  );

  const CalendarSection = useCallback(
    ({ month, selectedDays, setSelectedDays, onNextMonth, onPrevMonth }) => (
      <div
        className={`${showTwoCalendars ? 'px-6 pt-5 pb-6' : 'px-2 pt-2 pb-5'} flex flex-col`}
      >
        <CalendarHeader
          month={format(month, 'MMMM yyyy')}
          onNext={onNextMonth}
          onPrev={onPrevMonth}
          selectedRange={selectedRange}
          handleValueChange={handleValueChange}
          showTwoCalendars={showTwoCalendars}
        />
        <div className="grid grid-cols-7 text-xs text-center text-gray-900 space-y-[1px]">
          {daysOfWeek.map((day) => (
            <span
              key={day}
              className="flex text-gray-600 items-center justify-center w-10 h-10 font-semibold rounded-lg"
            >
              {day}
            </span>
          ))}
          {renderDays(month, selectedDays, setSelectedDays)}
        </div>
      </div>
    ),
    [
      daysOfWeek,
      renderDays,
      selectedRange,
      handleValueChange,
      showTwoCalendars,
    ],
  );

  CalendarSection.propTypes = {
    month: PropTypes.instanceOf(Date).isRequired,
    selectedDays: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
    setSelectedDays: PropTypes.func.isRequired,
    onNextMonth: PropTypes.func.isRequired,
    onPrevMonth: PropTypes.func.isRequired,
  };

  const handleNextMonth = useCallback(
    (currentMonth, otherMonth, setMonth) => {
      const nextMonth = addMonths(currentMonth, 1);
      if (!showTwoCalendars || !isSameMonth(nextMonth, otherMonth)) {
        setMonth(nextMonth);
      }
    },
    [showTwoCalendars],
  );

  const handlePrevMonth = useCallback(
    (currentMonth, otherMonth, setMonth) => {
      const prevMonth = subMonths(currentMonth, 1);
      if (!showTwoCalendars || !isSameMonth(prevMonth, otherMonth)) {
        setMonth(prevMonth);
      }
    },
    [showTwoCalendars],
  );

  return (
    <div
      className={`${
        showTwoCalendars
          ? 'flex flex-col items-center justify-center w-full bg-none md:flex-row mb-10'
          : ''
      }`}
    >
      <div
        className={`z-[1000] border border-gray-100 bg-white shadow-lg rounded-xl ${
          showTwoCalendars
            ? 'max-w-full min-w-[260px] md:min-w-[660px] lg:min-w-[800px]'
            : 'w-full max-w-[241px]'
        }`}
      >
        <div className="flex flex-col">
          <div className="divide-x flex flex-col md:flex-row lg:flex-row">
            {showTwoCalendars && (
              <ShortCuts setSelectedRange={setSelectedRange} />
            )}

            <CalendarSection
              month={month1}
              selectedDays={selectedDays1}
              setSelectedDays={setSelectedDays1}
              onNextMonth={() => handleNextMonth(month1, month2, setMonth1)}
              onPrevMonth={() => handlePrevMonth(month1, month2, setMonth1)}
            />

            {showTwoCalendars && (
              <CalendarSection
                month={month2}
                selectedDays={selectedDays2}
                setSelectedDays={setSelectedDays2}
                onNextMonth={() => handleNextMonth(month2, month1, setMonth2)}
                onPrevMonth={() => handlePrevMonth(month2, month1, setMonth2)}
              />
            )}
          </div>

          {showTwoCalendars && (
            <Footer
              showTwoCalendars={showTwoCalendars}
              selectedRange={selectedRange}
              setSelectedRange={setSelectedRange}
              handleValueChange={handleValueChange}
              close={closeDatePicker}
            />
          )}
        </div>
      </div>
    </div>
  );
};

Calendar.propTypes = {
  initialMonth1: PropTypes.instanceOf(Date),
  initialMonth2: PropTypes.instanceOf(Date),
  handleValueChange: PropTypes.func.isRequired,
  closeDatePicker: PropTypes.func.isRequired,
  showTwoCalendars: PropTypes.bool,
};

Calendar.displayName = 'Calendar';

export default Calendar;
