import React, { useEffect } from 'react';
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  startOfYear,
  endOfMonth,
  endOfYear,
  startOfQuarter,
  endOfQuarter,
  subQuarters,
} from 'date-fns';

const timePeriods = [
  { label: 'Today', range: () => [startOfDay(new Date()), endOfDay(new Date())] },
  {
    label: 'Yesterday',
    range: () => [startOfDay(subDays(new Date(), 1)), endOfDay(subDays(new Date(), 1))],
  },
  { label: 'Last 7 days', range: () => [startOfDay(subDays(new Date(), 7)), endOfDay(new Date())] },
  {
    label: 'Last 30 days',
    range: () => [startOfDay(subDays(new Date(), 30)), endOfDay(new Date())],
  },
  {
    label: 'Last 90 days',
    range: () => [startOfDay(subDays(new Date(), 90)), endOfDay(new Date())],
  },
  { label: 'This month', range: () => [startOfMonth(new Date()), endOfMonth(new Date())] },
  { label: 'This year', range: () => [startOfYear(new Date()), endOfYear(new Date())] },
  {
    label: 'Last year',
    range: () => [startOfYear(subDays(new Date(), 365)), endOfYear(subDays(new Date(), 365))],
  },
  { label: 'This quarter', range: () => [startOfQuarter(new Date()), endOfQuarter(new Date())] },
  {
    label: 'Last quarter',
    range: () => [
      startOfQuarter(subQuarters(new Date(), 1)),
      endOfQuarter(subQuarters(new Date(), 1)),
    ],
  },
];

const ShortCuts = ({ setSelectedRange }) => {
  const handleShortcutClick = (range) => {
    setSelectedRange({ start: range()[0], end: range()[1] });
  };

  return (
    <div className='py-6 border-r border-gray-100 w-full md:w-[260px] max-h-[350px] overflow-y-auto scr'>
      <ul className='text-sm leading-5 font-normal flex flex-wrap md:flex-col lg:flex-col'>
        {timePeriods.map((period) => (
          <li key={period.label}>
            <button
              onClick={() => handleShortcutClick(period.range)}
              className='px-6 py-[10px] w-full leading-5 hover:bg-gray-50 text-gray-700 text-left'>
              {period.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShortCuts;
