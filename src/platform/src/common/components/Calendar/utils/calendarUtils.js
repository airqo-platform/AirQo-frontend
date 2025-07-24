import { isSameDay, isWithinInterval } from 'date-fns';

/**
 * Helper function to compute dynamic class names for each day.
 * @param {Date} day - The day to style.
 * @param {Date} month - The month currently being rendered.
 * @param {Object} selectedRange - Object containing start and end dates/times.
 * @returns {string} - Concatenated class names.
 */
export const getDayClassNames = (day, month, selectedRange) => {
  const isStartOrEndDay =
    (selectedRange.start && isSameDay(day, selectedRange.start)) ||
    (selectedRange.end && isSameDay(day, selectedRange.end));
  const isInBetween =
    selectedRange.start &&
    selectedRange.end &&
    isWithinInterval(day, {
      start: selectedRange.start,
      end: selectedRange.end,
    }) &&
    !isStartOrEndDay;
  const isStartOfWeek = day.getDay() === 1; // Monday
  const isEndOfWeek = day.getDay() === 0; // Sunday

  let classNames = 'flex justify-center items-center ';

  if (isInBetween || isStartOrEndDay) {
    classNames +=
      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 ';
  }

  // Apply rounded corners for start/end of selection or week
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
