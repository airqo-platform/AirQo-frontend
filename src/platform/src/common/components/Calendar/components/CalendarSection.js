import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  startOfDay,
} from 'date-fns';
import CalendarHeader from './CalendarHeader';

const getDayClassNames = (day, month, selectedRange) => {
  const isStartOrEnd =
    (selectedRange.start && isSameDay(day, selectedRange.start)) ||
    (selectedRange.end && isSameDay(day, selectedRange.end));
  const isInBetween =
    selectedRange.start &&
    selectedRange.end &&
    isWithinInterval(day, selectedRange) &&
    !isStartOrEnd;
  const isStartOfWeek = day.getDay() === 1;
  const isEndOfWeek = day.getDay() === 0;
  let classNames = 'flex justify-center items-center ';
  if (isInBetween || isStartOrEnd)
    classNames +=
      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 ';
  if (
    (selectedRange.start && isSameDay(day, selectedRange.start)) ||
    isStartOfWeek
  )
    classNames += 'rounded-l-full ';
  if ((selectedRange.end && isSameDay(day, selectedRange.end)) || isEndOfWeek)
    classNames += 'rounded-r-full ';
  return classNames;
};

const isWithinInterval = (date, interval) => {
  const time = date.getTime();
  return time >= interval.start.getTime() && time <= interval.end.getTime();
};

const CalendarSection = ({
  month,
  onNextMonth,
  onPrevMonth,
  selectedRange,
  handleDayClick,
  today,
  showTwoCalendars,
  enableTimePicker,
  handleStartTimeChange,
  handleEndTimeChange,
  daysOfWeek,
}) => {
  const renderDays = useCallback(() => {
    const startDay = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const endDay = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDay, end: endDay });

    return days.map((day) => {
      const normalizedDay = startOfDay(day);
      const isToday = isSameDay(normalizedDay, today);
      const isCurrentMonth = isSameMonth(normalizedDay, month);
      const dayClasses = getDayClassNames(normalizedDay, month, selectedRange);

      return (
        <div key={normalizedDay.toISOString()} className={dayClasses}>
          <button
            onClick={() => handleDayClick(normalizedDay)}
            className={`
              w-10 h-10 text-sm flex justify-center items-center
              ${(selectedRange.start && isSameDay(normalizedDay, selectedRange.start)) || (selectedRange.end && isSameDay(normalizedDay, selectedRange.end)) ? 'bg-primary dark:bg-primary/50 rounded-full text-white hover:text-white' : ''}
              ${isToday ? 'text-primary dark:text-primary/40' : isCurrentMonth ? 'text-gray-800 dark:text-gray-200' : showTwoCalendars ? 'text-gray-300 dark:text-gray-600' : 'hidden'}
              hover:border-primary hover:text-primary dark:hover:text-primary/40 hover:rounded-full hover:border dark:hover:border-primary/50
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
  }, [month, selectedRange, handleDayClick, today, showTwoCalendars]);

  return (
    <div
      className={`${showTwoCalendars ? 'px-6 pt-5 pb-5' : 'px-2 pt-2 w-[200px] '} flex flex-col`}
    >
      <CalendarHeader
        month={format(month, 'MMMM yyyy')}
        onNext={onNextMonth}
        onPrev={onPrevMonth}
        selectedRange={selectedRange}
        showTwoCalendars={showTwoCalendars}
        enableTimePicker={enableTimePicker}
        handleStartTimeChange={handleStartTimeChange}
        handleEndTimeChange={handleEndTimeChange}
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
        {renderDays()}
      </div>
    </div>
  );
};

CalendarSection.propTypes = {
  month: PropTypes.instanceOf(Date).isRequired,
  onNextMonth: PropTypes.func.isRequired,
  onPrevMonth: PropTypes.func.isRequired,
  selectedRange: PropTypes.shape({
    start: PropTypes.instanceOf(Date),
    end: PropTypes.instanceOf(Date),
    startTime: PropTypes.instanceOf(Date),
    endTime: PropTypes.instanceOf(Date),
  }).isRequired,
  handleDayClick: PropTypes.func.isRequired,
  today: PropTypes.instanceOf(Date).isRequired,
  showTwoCalendars: PropTypes.bool.isRequired,
  enableTimePicker: PropTypes.bool.isRequired,
  handleStartTimeChange: PropTypes.func,
  handleEndTimeChange: PropTypes.func,
  daysOfWeek: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default React.memo(CalendarSection);
