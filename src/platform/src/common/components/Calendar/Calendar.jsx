import { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import CalendarSection from './components/CalendarSection';
import Footer from './components/Footer';
import ShortCuts from './components/ShortCuts';
import { useCalendarLogic } from './hooks/useCalendarLogic';

const Calendar = ({
  initialMonth1,
  initialMonth2,
  handleValueChange,
  closeDatePicker,
  showTwoCalendars = true,
  enableTimePicker = false,
  showTimePickerToggle = false,
  initialValue,
}) => {
  const daysOfWeek = useMemo(
    () => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    [],
  );
  const initialSelectedRange = useMemo(
    () => ({
      start: initialValue?.start || null,
      end: initialValue?.end || null,
      startTime: initialValue?.startTime || null,
      endTime: initialValue?.endTime || null,
    }),
    [initialValue],
  );

  const {
    today,
    month1,
    setMonth1,
    month2,
    setMonth2,
    selectedRange,
    handleDayClick,
    handleStartTimeChange,
    handleEndTimeChange,
    handleNextMonth,
    handlePrevMonth,
    handleShortcutClick,
    getCombinedDateTime,
  } = useCalendarLogic({
    initialMonth1,
    initialMonth2,
    showTwoCalendars,
    enableTimePicker,
    handleValueChange,
    closeDatePicker,
    initialSelectedRange,
  });

  const handleFinalValueChange = useCallback(
    (range) => {
      const finalStart = getCombinedDateTime(range.start, range.startTime);
      const finalEnd = getCombinedDateTime(range.end, range.endTime);
      handleValueChange({
        start: finalStart,
        end: finalEnd,
        startTime: range.startTime,
        endTime: range.endTime,
      });
    },
    [getCombinedDateTime, handleValueChange],
  );

  return (
    <div
      className={`${showTwoCalendars ? 'flex flex-col items-center justify-center w-full bg-none md:flex-row mb-10' : ''}`}
    >
      <div
        style={{ zIndex: 10000 }}
        className={`border border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1d1f20] dark:text-gray-100 shadow-lg rounded-lg ${showTwoCalendars ? 'max-w-full min-w-[260px] md:min-w-[660px] lg:min-w-[700px]' : 'w-full max-w-[241px]'}`}
      >
        <div className="flex flex-col">
          <div className="divide-x dark:divide-gray-700 flex flex-col md:flex-row lg:flex-row">
            {showTwoCalendars && (
              <ShortCuts handleShortcutClick={handleShortcutClick} />
            )}
            <CalendarSection
              month={month1}
              onNextMonth={() => handleNextMonth(month1, month2, setMonth1)}
              onPrevMonth={() => handlePrevMonth(month1, month2, setMonth1)}
              selectedRange={selectedRange}
              handleDayClick={handleDayClick}
              today={today}
              showTwoCalendars={showTwoCalendars}
              enableTimePicker={enableTimePicker}
              handleStartTimeChange={handleStartTimeChange}
              handleEndTimeChange={handleEndTimeChange}
              daysOfWeek={daysOfWeek}
            />
            {showTwoCalendars && month2 && (
              <CalendarSection
                month={month2}
                onNextMonth={() => handleNextMonth(month2, month1, setMonth2)}
                onPrevMonth={() => handlePrevMonth(month2, month1, setMonth2)}
                selectedRange={selectedRange}
                handleDayClick={handleDayClick}
                today={today}
                showTwoCalendars={showTwoCalendars}
                enableTimePicker={enableTimePicker}
                handleStartTimeChange={handleStartTimeChange}
                handleEndTimeChange={handleEndTimeChange}
                daysOfWeek={daysOfWeek}
              />
            )}
          </div>
          {showTwoCalendars && (
            <Footer
              selectedRange={selectedRange}
              handleValueChange={handleFinalValueChange}
              close={closeDatePicker}
              enableTimePicker={enableTimePicker}
              handleStartTimeChange={handleStartTimeChange}
              handleEndTimeChange={handleEndTimeChange}
              showTimePickerToggle={showTimePickerToggle}
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
  enableTimePicker: PropTypes.bool,
  initialValue: PropTypes.shape({
    start: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    end: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    startTime: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    endTime: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
  }),
};
Calendar.displayName = 'Calendar';
export default Calendar;
