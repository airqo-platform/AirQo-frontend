// CalendarHeader.js
import React from 'react';
import PropTypes from 'prop-types';
import ShortLeftArrow from '@/icons/Analytics/shortLeftArrow';
import ShortRightArrow from '@/icons/Analytics/shortRightArrow';
import Button from '../../Button';
import { format } from 'date-fns';

/**
 * CalendarHeader component displays the month and navigation buttons.
 */
const CalendarHeader = ({
  month,
  onNext,
  onPrev,
  selectedRange,
  showTwoCalendars,
}) => {
  return (
    <div className="flex items-center justify-between">
      {showTwoCalendars ? (
        <>
          <Button
            onClick={onPrev}
            Icon={ShortLeftArrow}
            variant="outlined"
            paddingStyles="p-2"
            aria-label="Previous Month"
          />
          <div className="text-sm text-gray-700 font-semibold">{month}</div>
          <Button
            onClick={onNext}
            Icon={ShortRightArrow}
            variant="outlined"
            paddingStyles="p-2"
            aria-label="Next Month"
          />
        </>
      ) : (
        <div className="flex flex-col">
          <form className="flex items-center mb-1">
            <input
              type="text"
              readOnly
              value={
                selectedRange.start
                  ? format(selectedRange.start, 'MMM d, yyyy')
                  : ''
              }
              className="flex items-center shadow-sm w-[98px] h-8 px-3 py-2 text-xs border border-gray-300 text-gray-600 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
              placeholder="Start date"
              disabled
              aria-label="Start Date"
            />
            <div className="px-2">
              <span className="text-gray-600 text-[16px]">-</span>
            </div>
            <input
              type="text"
              readOnly
              value={
                selectedRange.end
                  ? format(selectedRange.end, 'MMM d, yyyy')
                  : ''
              }
              className="flex items-center shadow-sm w-[98px] h-8 px-3 py-2 text-xs border border-gray-300 text-gray-600 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
              placeholder="End date"
              disabled
              aria-label="End Date"
            />
          </form>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 font-semibold">{month}</div>
            <div className="flex items-center gap-2">
              <Button
                onClick={onPrev}
                Icon={ShortLeftArrow}
                variant="outlined"
                paddingStyles="p-2"
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
  }),
  showTwoCalendars: PropTypes.bool.isRequired,
};

export default React.memo(CalendarHeader);
