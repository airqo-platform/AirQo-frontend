import React from 'react';
import PropTypes from 'prop-types';
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
  {
    label: 'Today',
    range: () => [startOfDay(new Date()), endOfDay(new Date())],
  },
  {
    label: 'Yesterday',
    range: () => {
      const d = subDays(new Date(), 1);
      return [startOfDay(d), endOfDay(d)];
    },
  },
  {
    label: 'Last 7 days',
    range: () => [startOfDay(subDays(new Date(), 6)), endOfDay(new Date())],
  },
  {
    label: 'Last 30 days',
    range: () => [startOfDay(subDays(new Date(), 29)), endOfDay(new Date())],
  },
  {
    label: 'Last 90 days',
    range: () => [startOfDay(subDays(new Date(), 89)), endOfDay(new Date())],
  },
  {
    label: 'This month',
    range: () => [startOfMonth(new Date()), endOfMonth(new Date())],
  },
  {
    label: 'This year',
    range: () => [startOfYear(new Date()), endOfYear(new Date())],
  },
  {
    label: 'Last year',
    range: () => {
      const y = subDays(new Date(), 365);
      return [startOfYear(y), endOfYear(y)];
    },
  },
  {
    label: 'This quarter',
    range: () => [startOfQuarter(new Date()), endOfQuarter(new Date())],
  },
  {
    label: 'Last quarter',
    range: () => {
      const q = subQuarters(new Date(), 1);
      return [startOfQuarter(q), endOfQuarter(q)];
    },
  },
];

const ShortCuts = ({ handleShortcutClick }) => (
  <div className="py-6 border-r border-gray-100 dark:border-gray-700 w-full md:w-[260px] max-h-[350px] overflow-y-auto">
    <ul className="text-xs leading-5 font-normal flex flex-wrap md:flex-col lg:flex-col">
      {timePeriods.map((period) => (
        <li key={period.label}>
          <button
            onClick={() => handleShortcutClick(period.range)}
            className="px-6 py-[10px] w-full leading-5 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-left"
            aria-label={`Select ${period.label}`}
          >
            {period.label}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

ShortCuts.propTypes = { handleShortcutClick: PropTypes.func.isRequired };
export default React.memo(ShortCuts);
