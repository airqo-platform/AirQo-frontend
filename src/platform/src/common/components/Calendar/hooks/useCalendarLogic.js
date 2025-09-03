import { useState, useCallback, useMemo } from 'react';
import {
  startOfMonth,
  addMonths,
  subMonths,
  isBefore,
  startOfDay,
  setHours,
  setMinutes,
} from 'date-fns';

export const useCalendarLogic = ({
  initialMonth1,
  initialMonth2,
  showTwoCalendars = true,
  enableTimePicker = false,
  handleValueChange,
  closeDatePicker,
  initialSelectedRange,
}) => {
  const today = useMemo(() => startOfDay(new Date()), []);

  const [month1, setMonth1] = useState(() =>
    showTwoCalendars
      ? initialMonth1 || startOfMonth(today)
      : startOfMonth(today),
  );

  const [month2, setMonth2] = useState(() =>
    showTwoCalendars
      ? initialMonth2 || addMonths(startOfMonth(today), 1)
      : null,
  );

  const [selectedRange, setSelectedRange] = useState(() => {
    let range = initialSelectedRange || { start: null, end: null };
    if (showTwoCalendars === false) {
      range = { start: today, end: today };
    }

    if (enableTimePicker) {
      if (!range.startTime && range.start) {
        range.startTime = setHours(setMinutes(range.start, 0), 0);
      }
      if (!range.endTime && range.end) {
        range.endTime = setHours(setMinutes(range.end, 59), 23);
      }
    }
    return range;
  });

  const handleDayClick = useCallback(
    (day) => {
      const normalizedDay = startOfDay(day);
      let newRange = { ...selectedRange };

      if (!newRange.start || (newRange.start && newRange.end)) {
        newRange = { start: normalizedDay, end: null };
        if (enableTimePicker) {
          newRange.startTime = setHours(setMinutes(normalizedDay, 0), 0);
          delete newRange.endTime;
        }
      } else if (!newRange.end) {
        const isBeforeStart = isBefore(normalizedDay, newRange.start);
        newRange = {
          start: isBeforeStart ? normalizedDay : newRange.start,
          end: isBeforeStart ? newRange.start : normalizedDay,
        };
        if (enableTimePicker) {
          newRange.endTime = setHours(setMinutes(newRange.end, 59), 23);
        }
      }

      setSelectedRange(newRange);

      if (!showTwoCalendars && newRange.start && newRange.end) {
        handleValueChange(newRange);
        closeDatePicker();
      }
    },
    [
      selectedRange,
      showTwoCalendars,
      enableTimePicker,
      handleValueChange,
      closeDatePicker,
    ],
  );

  const handleStartTimeChange = useCallback(
    (event) => {
      const timeValue = event.target.value;
      if (!timeValue || !selectedRange.start) return;

      const [hours, minutes] = timeValue.split(':').map(Number);
      const newStartTime = setHours(
        setMinutes(selectedRange.start, minutes),
        hours,
      );
      setSelectedRange((prev) => ({ ...prev, startTime: newStartTime }));
    },
    [selectedRange.start],
  );

  const handleEndTimeChange = useCallback(
    (event) => {
      const timeValue = event.target.value;
      if (!timeValue || !selectedRange.end) return;

      const [hours, minutes] = timeValue.split(':').map(Number);
      const newEndTime = setHours(
        setMinutes(selectedRange.end, minutes),
        hours,
      );
      setSelectedRange((prev) => ({ ...prev, endTime: newEndTime }));
    },
    [selectedRange.end],
  );

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

  const handleShortcutClick = useCallback(
    (rangeFunc) => {
      const [start, end] = rangeFunc();
      let newRange = { start, end };
      if (enableTimePicker) {
        newRange.startTime = setHours(setMinutes(start, 0), 0);
        newRange.endTime = setHours(setMinutes(end, 59), 23);
      }
      setSelectedRange(newRange);
    },
    [enableTimePicker],
  );

  // Helper to get the final combined Date object for API
  const getCombinedDateTime = useCallback(
    (datePart, timePart) => {
      if (!datePart) return null;
      if (!timePart || !enableTimePicker) {
        return startOfDay(datePart); // Fallback for date-only mode or missing time
      }
      const hours = timePart.getHours();
      const minutes = timePart.getMinutes();
      return setMinutes(setHours(startOfDay(datePart), hours), minutes);
    },
    [enableTimePicker],
  );

  return {
    today,
    month1,
    setMonth1,
    month2,
    setMonth2,
    selectedRange,
    setSelectedRange,
    handleDayClick,
    handleStartTimeChange,
    handleEndTimeChange,
    handleNextMonth,
    handlePrevMonth,
    handleShortcutClick,
    getCombinedDateTime,
  };
};

// Helper to check if months are the same (used in navigation logic)
const isSameMonth = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
};
