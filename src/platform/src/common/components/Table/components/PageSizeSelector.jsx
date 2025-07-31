import React, { memo } from 'react';

/**
 * Page size selector component
 */
const PageSizeSelector = ({
  pageSize,
  onPageSizeChange,
  options = [5, 10, 20, 50, 100],
}) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
      <span>Show</span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
        className="border border-primary/30 dark:border-primary/40 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        {options.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <span>entries</span>
    </div>
  );
};

export default memo(PageSizeSelector);
