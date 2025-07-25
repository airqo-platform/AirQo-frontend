import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { formatTimeForInput } from '../utils/calendarUtils';
import { AqChevronLeft, AqChevronRight } from '@airqo/icons-react';
import Button from '../../Button';

const CalendarHeader = ({
  month,
  onNext,
  onPrev,
  selectedRange,
  showTwoCalendars,
  enableTimePicker,
  handleStartTimeChange,
  handleEndTimeChange,
}) => {
  return (
    <div className="flex items-center justify-between">
      {showTwoCalendars ? (
        <>
          <Button
            onClick={onPrev}
            variant="outlined"
            padding="p-2"
            aria-label="Previous Month"
          >
            <AqChevronLeft size={16} />
          </Button>
          <div className="text-sm text-gray-700 dark:text-gray-200 font-semibold">
            {month}
          </div>
          <Button
            onClick={onNext}
            variant="outlined"
            padding="p-2"
            aria-label="Next Month"
          >
            <AqChevronRight size={16} />
          </Button>
        </>
      ) : (
        <div className="flex flex-col w-full">
          {/* Date/Time Inputs for Single Calendar Mode */}
          {enableTimePicker && (
            <form className="flex items-center mb-1">
              <div className="flex flex-col">
                <input
                  type="text"
                  readOnly
                  value={
                    selectedRange.start
                      ? format(selectedRange.start, 'MMM d, yyyy')
                      : ''
                  }
                  className="flex items-center shadow-sm w-[98px] h-8 px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 dark:bg-gray-800 rounded-xl focus:bg-white dark:focus:bg-gray-700 focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="Start date"
                  disabled
                  aria-label="Start Date"
                />
                <input
                  type="time"
                  value={
                    selectedRange.start
                      ? formatTimeForInput(selectedRange.startTime)
                      : '00:00'
                  }
                  onChange={handleStartTimeChange}
                  className="mt-1 flex items-center shadow-sm w-[98px] h-8 px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 dark:bg-gray-800 rounded-xl focus:bg-white dark:focus:bg-gray-700 focus:ring-1 focus:ring-primary focus:outline-none"
                  aria-label="Start Time"
                  disabled={!selectedRange.start}
                />
              </div>

              <div className="px-2 flex items-center">
                <span className="text-gray-600 dark:text-gray-400 text-[16px]">
                  -
                </span>
              </div>

              <div className="flex flex-col">
                <input
                  type="text"
                  readOnly
                  value={
                    selectedRange.end
                      ? format(selectedRange.end, 'MMM d, yyyy')
                      : ''
                  }
                  className="flex items-center shadow-sm w-[98px] h-8 px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 dark:bg-gray-800 rounded-xl focus:bg-white dark:focus:bg-gray-700 focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="End date"
                  disabled
                  aria-label="End Date"
                />
                <input
                  type="time"
                  value={
                    selectedRange.end
                      ? formatTimeForInput(selectedRange.endTime)
                      : '23:59'
                  }
                  onChange={handleEndTimeChange}
                  className="mt-1 flex items-center shadow-sm w-[98px] h-8 px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 dark:bg-gray-800 rounded-xl focus:bg-white dark:focus:bg-gray-700 focus:ring-1 focus:ring-primary focus:outline-none"
                  aria-label="End Time"
                  disabled={!selectedRange.end}
                />
              </div>
            </form>
          )}

          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-200 font-semibold">
              {month}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={onPrev}
                Icon={ShortLeftArrow} // Assuming Button component handles Icon prop
                variant="outlined"
                paddingStyles="p-2" // Note: Prop name mismatch in original, using standard one
                aria-label="Previous Month"
              />
              <Button
                onClick={onNext}
                Icon={ShortRightArrow}
                variant="outlined"
                paddingStyles="p-2"
                aria-label="Next Month"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

CalendarHeader.propTypes = {
  month: PropTypes.string.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  selectedRange: PropTypes.shape({
    start: PropTypes.instanceOf(Date),
    end: PropTypes.instanceOf(Date),
    startTime: PropTypes.instanceOf(Date), // Added for time picker
    endTime: PropTypes.instanceOf(Date), // Added for time picker
  }),
  showTwoCalendars: PropTypes.bool.isRequired,
  enableTimePicker: PropTypes.bool.isRequired, // Added for time picker toggle
  handleStartTimeChange: PropTypes.func, // Added for time picker
  handleEndTimeChange: PropTypes.func, // Added for time picker
};

export default React.memo(CalendarHeader);
