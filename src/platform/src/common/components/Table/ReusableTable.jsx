'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import CardWrapper from '@/components/CardWrapper';
import { FaSort } from 'react-icons/fa';
import {
  AqSearchSm,
  AqChevronDown,
  AqChevronUp,
  AqChevronLeft,
  AqChevronRight,
} from '@airqo/icons-react';
import { useThemeSafe } from '@/common/features/theme-customizer/hooks/useThemeSafe';

// Custom Filter Component with outside click close
const CustomFilter = ({
  options,
  value,
  onChange,
  placeholder,
  isMulti = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSelect = (option) => {
    if (isMulti) {
      const newValue = value.includes(option.value)
        ? value.filter((v) => v !== option.value)
        : [...value, option.value];
      onChange(newValue);
    } else {
      onChange(option.value);
      setIsOpen(false);
    }
  };

  const getDisplayValue = () => {
    if (isMulti) {
      return value.length > 0 ? `${value.length} selected` : placeholder;
    }
    const selected = options.find((opt) => opt.value === value);
    return selected ? selected.label : placeholder;
  };

  return (
    <div className="relative" ref={filterRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white dark:bg-[#1d1f20] border border-primary/30 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm text-gray-900 dark:text-gray-100"
      >
        <span className="block truncate">{getDisplayValue()}</span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#1d1f20] border border-gray-300 dark:border-gray-700 rounded-md shadow-lg">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-primary/30 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-primary bg-white dark:bg-[#232425] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <div className="max-h-60 overflow-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  (
                    isMulti
                      ? value.includes(option.value)
                      : value === option.value
                  )
                    ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {isMulti && (
                  <input
                    type="checkbox"
                    checked={value.includes(option.value)}
                    onChange={() => {}}
                    className="mr-2"
                  />
                )}
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Page Size Selector Component
const PageSizeSelector = ({
  pageSize,
  onPageSizeChange,
  options = [5, 10, 20, 50, 100],
}) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-700">
      <span>Show</span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
        className="border border-primary/30 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
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

// Main Reusable Table Component
const ReusableTable = ({
  title = 'Table',
  data = [],
  columns = [],
  searchable = true,
  filterable = true,
  filters = [],
  pageSize = 10,
  showPagination = true,
  sortable = true,
  className = '',
  pageSizeOptions = [5, 10, 20, 50, 100],
  searchableColumns = null,
  loading = false,
  loadingComponent = null,
  headerComponent = null,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterValues, setFilterValues] = useState({});
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const { primaryColor } = useThemeSafe();

  // Initialize filter values
  React.useEffect(() => {
    const initialFilters = {};
    filters.forEach((filter) => {
      initialFilters[filter.key] = filter.isMulti ? [] : '';
    });
    setFilterValues(initialFilters);
  }, [filters]);

  // Filter and search data using fuse.js and improved filter logic
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply filters first
    Object.entries(filterValues).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        filtered = filtered.filter((item) => {
          if (Array.isArray(value)) {
            return value.includes(item[key]);
          }
          // For boolean filters, handle string/boolean conversion
          if (
            typeof value === 'boolean' ||
            value === 'true' ||
            value === 'false'
          ) {
            return String(item[key]) === String(value);
          }
          return item[key] === value;
        });
      }
    });

    // Determine which columns to search
    let fuseKeys;
    if (Array.isArray(searchableColumns) && searchableColumns.length > 0) {
      fuseKeys = searchableColumns;
    } else {
      // Default: all columns that have at least one non-null/non-undefined value in data
      const allKeys = columns.map((col) => col.key);
      const keysWithData = allKeys.filter((key) =>
        filtered.some(
          (item) =>
            item[key] !== null &&
            item[key] !== undefined &&
            String(item[key]).trim() !== '',
        ),
      );
      fuseKeys = keysWithData.length > 0 ? keysWithData : allKeys;
    }

    // Prepare data for Fuse.js: flatten values for custom renderers and nested objects
    const getSearchableString = (item, key) => {
      const col = columns.find((c) => c.key === key);
      let value = item[key];
      // If column has a custom render, try to extract text
      if (col && typeof col.render === 'function') {
        // Try to get a string representation from the rendered value
        try {
          const rendered = col.render(item[key], item);
          if (typeof rendered === 'string') return rendered;
          if (typeof rendered === 'number') return String(rendered);
          // If it's a React element, try to extract text
          if (rendered && rendered.props && rendered.props.children) {
            if (typeof rendered.props.children === 'string')
              return rendered.props.children;
            if (Array.isArray(rendered.props.children)) {
              return rendered.props.children
                .map((child) => (typeof child === 'string' ? child : ''))
                .join(' ');
            }
          }
        } catch {
          // fallback to value
        }
      }
      // If value is an object, flatten to string
      if (value && typeof value === 'object') {
        return JSON.stringify(value);
      }
      return value === null || value === undefined ? '' : String(value);
    };

    // Build a new array for Fuse.js with only searchable keys as strings
    const fuseData = filtered.map((item) => {
      const obj = {};
      fuseKeys.forEach((key) => {
        obj[key] = getSearchableString(item, key);
      });
      return obj;
    });

    // Apply fuzzy search using fuse.js
    if (searchTerm && searchTerm.trim() && fuseKeys.length > 0) {
      const fuse = new Fuse(fuseData, {
        keys: fuseKeys,
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 2,
      });
      const fuseResults = fuse.search(searchTerm.trim());
      // Map back to original filtered data by index
      filtered = fuseResults.map((result) => filtered[result.refIndex]);
    }

    return filtered;
  }, [data, searchTerm, filterValues, columns, searchableColumns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Convert to strings for comparison if needed
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aStr > bStr) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * currentPageSize;
    const end = start + currentPageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, currentPageSize]);

  const totalPages = Math.ceil(sortedData.length / currentPageSize);

  // Reset to first page when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValues]);

  // Reset to first page when page size changes
  const handlePageSizeChange = (newPageSize) => {
    setCurrentPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    if (!sortable) return;

    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <FaSort className="w-3 h-3 text-gray-400" />;
    return sortConfig.direction === 'asc' ? (
      <AqChevronUp className="w-3 h-3 text-primary" />
    ) : (
      <AqChevronDown className="w-3 h-3 text-primary" />
    );
  };

  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item[column.key], item);
    }
    const value = item[column.key];
    return value === null || value === undefined ? '' : String(value);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          '...',
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages,
        );
      }
    }

    return pages;
  };

  return (
    <CardWrapper
      padding="p-0"
      header={headerComponent}
      className={`overflow-hidden shadow ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600 dark:bg-[#1d1f20]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* Search */}
            {searchable && (
              <div className="relative">
                <AqSearchSm className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60 dark:text-primary/80 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-primary/30 dark:border-primary/40 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm w-full sm:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            )}

            {/* Filters */}
            {filterable && filters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <div key={filter.key} className="min-w-[150px]">
                    <CustomFilter
                      options={filter.options}
                      value={
                        filterValues[filter.key] || (filter.isMulti ? [] : '')
                      }
                      onChange={(value) =>
                        handleFilterChange(filter.key, value)
                      }
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

      {/* Table or Loading */}
      <div className="overflow-x-auto">
        {loading ? (
          loadingComponent ? (
            loadingComponent
          ) : (
            <div className="w-full py-12 flex justify-center items-center">
              <div
                className="SecondaryMainloader"
                aria-label="Loading"
                style={{
                  '--color-primary': primaryColor,
                }}
              ></div>
            </div>
          )
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-gray-200 dark:border-gray-600 border-b dark:bg-[#1d1f20]">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                      sortable && column.sortable !== false
                        ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
                        : ''
                    }`}
                    onClick={() =>
                      sortable &&
                      column.sortable !== false &&
                      handleSort(column.key)
                    }
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {sortable &&
                        column.sortable !== false &&
                        getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1d1f20] divide-y divide-gray-200 dark:divide-gray-800">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-primary/5 dark:hover:bg-primary/20"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                      >
                        {renderCell(item, column)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {searchTerm ||
                    Object.values(filterValues).some(
                      (v) => v && (Array.isArray(v) ? v.length > 0 : v !== ''),
                    )
                      ? 'No matching results found'
                      : 'No data available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && showPagination && sortedData.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#1d1f20]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <PageSizeSelector
                pageSize={currentPageSize}
                onPageSizeChange={handlePageSizeChange}
                options={pageSizeOptions}
              />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing{' '}
                {Math.min(
                  (currentPage - 1) * currentPageSize + 1,
                  sortedData.length,
                )}{' '}
                to {Math.min(currentPage * currentPageSize, sortedData.length)}{' '}
                of {sortedData.length} results
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-primary/30 dark:border-primary/40 rounded-md hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary dark:hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-primary/30 dark:disabled:hover:border-primary/40 flex items-center space-x-1 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <AqChevronLeft className="w-3 h-3" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex items-center space-x-1">
                  {generatePageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        typeof page === 'number' && setCurrentPage(page)
                      }
                      disabled={typeof page !== 'number'}
                      className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                        page === currentPage
                          ? 'bg-primary text-white border-primary'
                          : typeof page === 'number'
                            ? 'border-primary/30 dark:border-primary/40 hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary dark:hover:border-primary text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900'
                            : 'border-transparent cursor-default bg-transparent dark:bg-transparent text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-primary/30 dark:border-primary/40 rounded-md hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary dark:hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-primary/30 dark:disabled:hover:border-primary/40 flex items-center space-x-1 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <span className="hidden sm:inline">Next</span>
                  <AqChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </CardWrapper>
  );
};

export default ReusableTable;
