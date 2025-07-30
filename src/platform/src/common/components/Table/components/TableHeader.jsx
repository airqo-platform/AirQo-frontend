import React, { memo } from 'react';
import { AqSearchSm } from '@airqo/icons-react';
import { FaTimes } from 'react-icons/fa';
import CustomFilter from './CustomFilter';

/**
 * Table header component with search and filters
 */
const TableHeader = ({
  title,
  searchable,
  searchTerm,
  onSearchChange,
  onClearSearch,
  filterable,
  filters,
  filterValues,
  onFilterChange,
}) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600 dark:bg-[#1d1f20]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {searchable && (
            <div className="relative">
              <AqSearchSm className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60 dark:text-primary/80 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-10 py-2 border border-primary/30 dark:border-primary/40 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm w-full sm:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
              {searchTerm && (
                <button
                  onClick={onClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          {filterable && filters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <div key={filter.key} className="min-w-[150px]">
                  <CustomFilter
                    options={filter.options}
                    value={
                      filterValues[filter.key] || (filter.isMulti ? [] : '')
                    }
                    onChange={(value) => onFilterChange(filter.key, value)}
                    placeholder={filter.placeholder}
                    isMulti={filter.isMulti}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(TableHeader);
