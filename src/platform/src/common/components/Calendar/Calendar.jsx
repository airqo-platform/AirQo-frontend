// Calendar.js
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
  startOfDay,
} from 'date-fns';
import Footer from './components/Footer';
import ShortCuts from './components/ShortCuts';
import CalendarHeader from './components/CalendarHeader';

/**
 * Helper function to compute dynamic class names for each day.
 */
const getDayClassNames = (day, month, selectedRange) => {
  const isStartOrEndDay =
    (selectedRange.start && isSameDay(day, selectedRange.start)) ||
    (selectedRange.end && isSameDay(day, selectedRange.end));
  const isInBetween =
    selectedRange.start &&
    selectedRange.end &&
    isWithinInterval(day, selectedRange) &&
    !isStartOrEndDay;
  const isStartOfWeek = day.getDay() === 1; // Monday
  const isEndOfWeek = day.getDay() === 0; // Sunday

  let classNames = 'flex justify-center items-center ';

  if (isInBetween || isStartOrEndDay) {
    classNames +=
      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 ';
  }

  if (
    (selectedRange.start && isSameDay(day, selectedRange.start)) ||
    isStartOfWeek
  ) {
    classNames += 'rounded-l-full ';
  }

  if ((selectedRange.end && isSameDay(day, selectedRange.end)) || isEndOfWeek) {
    classNames += 'rounded-r-full ';
  }

  return classNames;
};

/**
 * Calendar Component
 * @param {Object} props - Component props.
 * @returns {JSX.Element} - Rendered component.
 */
const Calendar = ({
  initialMonth1,
  initialMonth2,
  handleValueChange,
  closeDatePicker,
  showTwoCalendars = true,
}) => {
  // Days of the week, starting with Monday
  const daysOfWeek = useMemo(
    () => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    [],
  );

  // Initialize current date at the start of the day to avoid timezone issues
  const today = startOfDay(new Date());

  // State hooks for months and selected date range
  const [month1, setMonth1] = useState(
    showTwoCalendars
      ? initialMonth1 || startOfMonth(today)
      : startOfMonth(today),
  );
  const [month2, setMonth2] = useState(
    showTwoCalendars
      ? initialMonth2 || addMonths(startOfMonth(today), 1)
      : null,
  );
  const [selectedRange, setSelectedRange] = useState({
    start: showTwoCalendars ? null : today,
    end: showTwoCalendars ? null : today,
  });

  /**
   * Handles the selection of a day.
   * @param {Date} day - The day that was clicked.
   */
  const handleDayClick = useCallback(
    (day) => {
      const normalizedDay = startOfDay(day);
      let newSelectedRange = { ...selectedRange };

      if (
        !newSelectedRange.start ||
        (newSelectedRange.start && newSelectedRange.end)
      ) {
        newSelectedRange = { start: normalizedDay, end: null };
      } else if (!newSelectedRange.end) {
        const isBeforeStart = isBefore(normalizedDay, newSelectedRange.start);
        newSelectedRange = {
          start: isBeforeStart ? normalizedDay : newSelectedRange.start,
          end: isBeforeStart ? newSelectedRange.start : normalizedDay,
        };
      }

      setSelectedRange(newSelectedRange);

      if (!showTwoCalendars && newSelectedRange.start && newSelectedRange.end) {
        handleValueChange(newSelectedRange);
        closeDatePicker();
      }
    },
    [selectedRange, showTwoCalendars, handleValueChange, closeDatePicker],
  );

  /**
   * Renders the days of the month.
   * @param {Date} month - The month for which to render days.
   * @returns {JSX.Element[]} - Array of day elements.
   */
  const renderDays = useCallback(
    (month) => {
      const startDay = startOfWeek(startOfMonth(month), { weekStartsOn: 1 }); // Monday
      const endDay = endOfWeek(endOfMonth(month), { weekStartsOn: 1 }); // Sunday
      const daysOfMonth = eachDayOfInterval({
        start: startDay,
        end: endDay,
      });

      return daysOfMonth.map((day) => {
        const normalizedDay = startOfDay(day);
        const isToday = isSameDay(normalizedDay, today);
        const isCurrentMonth = isSameMonth(normalizedDay, month);
        const dayClasses = getDayClassNames(
          normalizedDay,
          month,
          selectedRange,
        );

        return (
          <div key={normalizedDay.toISOString()} className={dayClasses}>
            <button
              onClick={() => handleDayClick(normalizedDay)}
              className={`
                w-10 h-10 text-sm flex justify-center items-center 
                ${
                  (selectedRange.start &&
                    isSameDay(normalizedDay, selectedRange.start)) ||
                  (selectedRange.end &&
                    isSameDay(normalizedDay, selectedRange.end))
                    ? 'bg-blue-600 dark:bg-blue-500 rounded-full text-white hover:text-white'
                    : ''
                }
                ${
                  isToday
                    ? 'text-blue-600 dark:text-blue-400'
                    : isCurrentMonth
                      ? 'text-gray-800 dark:text-gray-200'
                      : showTwoCalendars
                        ? 'text-gray-300 dark:text-gray-600'
                        : 'hidden'
                }
                hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 hover:rounded-full hover:border dark:hover:border-blue-500 
                disabled:text-gray-300 dark:disabled:text-gray-600 disabled:pointer-events-none md:w-14 lg:w-16
              `}
              aria-pressed={
                isSameDay(normalizedDay, selectedRange.start) ||
                isSameDay(normalizedDay, selectedRange.end)
              }
              aria-label={`Select ${format(normalizedDay, 'PPP')}`}
            >
              {format(normalizedDay, 'd')}
            </button>
          </div>
        );
      });
    },
    [showTwoCalendars, selectedRange, handleDayClick, today],
  );

  /**
   * Calendar Section Component
   * @param {Object} props - Component props.
   * @returns {JSX.Element} - Rendered component.
   */
  const CalendarSectionComponent = ({ month, onNextMonth, onPrevMonth }) => (
    <div
      className={`${
        showTwoCalendars ? 'px-6 pt-5 pb-5' : 'px-2 pt-2'
      } flex flex-col`}
    >
      <CalendarHeader
        month={format(month, 'MMMM yyyy')}
        onNext={onNextMonth}
        onPrev={onPrevMonth}
        selectedRange={selectedRange}
        handleValueChange={handleValueChange}
        showTwoCalendars={showTwoCalendars}
      />
      <div className="grid grid-cols-7 text-xs text-center text-gray-900 dark:text-gray-300 space-y-[1px]">
        {daysOfWeek.map((day) => (
          <span
            key={day}
            className="flex text-gray-600 dark:text-gray-400 items-center justify-center w-10 h-10 font-semibold rounded-lg"
          >
            {day}
          </span>
        ))}
        {renderDays(month)}
      </div>
    </div>
  );

  // Memoize the CalendarSection component to prevent unnecessary re-renders
  const CalendarSection = React.memo(CalendarSectionComponent);
  CalendarSection.displayName = 'CalendarSection';

  /**
   * Handles navigating to the next month.
   * @param {Date} currentMonth - The current month.
   * @param {Date} otherMonth - The other month being displayed.
   * @param {Function} setMonth - State setter for the month.
   */
  const handleNextMonth = useCallback(
    (currentMonth, otherMonth, setMonth) => {
      const nextMonth = addMonths(currentMonth, 1);
      if (!showTwoCalendars || !isSameMonth(nextMonth, otherMonth)) {
        setMonth(nextMonth);
      }
    },
    [showTwoCalendars],
  );

  /**
   * Handles navigating to the previous month.
   * @param {Date} currentMonth - The current month.
   * @param {Date} otherMonth - The other month being displayed.
   * @param {Function} setMonth - State setter for the month.
   */
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
        style={{
          zIndex: 10000,
        }}
        className={`border border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1d1f20] dark:text-gray-100 shadow-lg rounded-xl ${
          showTwoCalendars
            ? 'max-w-full min-w-[260px] md:min-w-[660px] lg:min-w-[700px]'
            : 'w-full max-w-[241px]'
        }`}
      >
        <div className="flex flex-col">
          <div className="divide-x dark:divide-gray-700 flex flex-col md:flex-row lg:flex-row">
            {showTwoCalendars && (
              <ShortCuts setSelectedRange={setSelectedRange} />
            )}

            {/* First Calendar */}
            <CalendarSection
              month={month1}
              onNextMonth={() => handleNextMonth(month1, month2, setMonth1)}
              onPrevMonth={() => handlePrevMonth(month1, month2, setMonth1)}
            />

            {/* Second Calendar (if showTwoCalendars is true) */}
            {showTwoCalendars && month2 && (
              <CalendarSection
                month={month2}
                onNextMonth={() => handleNextMonth(month2, month1, setMonth2)}
                onPrevMonth={() => handlePrevMonth(month2, month1, setMonth2)}
              />
            )}
          </div>

          {/* Footer (only for two calendars) */}
          {showTwoCalendars && (
            <Footer
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

Calendar.displayName = 'Calendar';

export default Calendar;
