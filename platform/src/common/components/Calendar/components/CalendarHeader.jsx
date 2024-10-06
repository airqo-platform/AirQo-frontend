import React, { useEffect } from 'react';
import ShortLeftArrow from '@/icons/Analytics/shortLeftArrow';
import ShortRightArrow from '@/icons/Analytics/shortRightArrow';
import Button from '../../Button';
import { format } from 'date-fns';

/**
 * @param {Object} props
 * @param {String} props.month
 * @param {Function} props.onNext
 * @param {Function} props.onPrev
 * @returns {JSX.Element}
 * @description CalendarHeader component
 */
const CalendarHeader = ({
  month,
  onNext,
  onPrev,
  selectedRange,
  showTwoCalendars,
}) => {
  return (
    <>
      {showTwoCalendars ? (
        <div className="flex items-center justify-between">
          <Button
            onClick={onPrev}
            Icon={ShortLeftArrow}
            variant={'outlined'}
            paddingStyles="p-2"
          />
          <div className="text-sm text-gray-700 font-semibold">{month}</div>
          <Button
            onClick={onNext}
            Icon={ShortRightArrow}
            variant={'outlined'}
            paddingStyles="p-2"
          />
        </div>
      ) : (
        <div>
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
            />
            <div className="p-2">
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
            />
          </form>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 font-semibold">{month}</div>
            <div className="flex items-center gap-2">
              <Button
                onClick={onPrev}
                Icon={ShortLeftArrow}
                variant={'outlined'}
                paddingStyles="p-2"
              />
              <Button
                onClick={onNext}
                Icon={ShortRightArrow}
                variant={'outlined'}
                paddingStyles="p-2"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarHeader;
