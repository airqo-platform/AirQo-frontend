import React from 'react';

/**
 * @param {Object} props
 * @param {String} props.month
 * @param {Function} props.onNext
 * @param {Function} props.onPrev
 * @returns {JSX.Element}
 * @description CalendarHeader component
 */
const CalendarHeader = ({ month, onNext, onPrev }) => {
  return (
    <div className="flex items-center justify-between">
      <button
        className="flex items-center justify-center p-2 w-10 h-10 hover:bg-gray-50 border border-gray-300 rounded-xl"
        onClick={onPrev}
      >
        <svg className="w-6 h-6 text-gray-500 stroke-current" fill="none">
          <path
            d="M13.25 8.75L9.75 12l3.5 3.25"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="text-sm text-gray-700 font-semibold">{month}</div>
      <button
        className="flex items-center justify-center p-2 hover:bg-gray-50 border border-gray-300 rounded-xl w-10 h-10"
        onClick={onNext}
      >
        <svg className="w-6 h-6 text-gray-500 stroke-current" fill="none">
          <path
            d="M10.75 8.75l3.5 3.25-3.5 3.25"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default CalendarHeader;
