import React, { useState, useMemo } from 'react';
import CardWrapper from '@/common/components/CardWrapper';
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaSort,
  FaSortUp,
  FaSortDown,
} from 'react-icons/fa';

// Custom Filter Component using react-select styling
const CustomFilter = ({
  options,
  value,
  onChange,
  placeholder,
  isMulti = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white border border-primary/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
      >
        <span className="block truncate">{getDisplayValue()}</span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
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
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-primary/30 rounded focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="max-h-60 overflow-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 ${
                  (
                    isMulti
                      ? value.includes(option.value)
                      : value === option.value
                  )
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-900'
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
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterValues, setFilterValues] = useState({});

  // Initialize filter values
  React.useEffect(() => {
    const initialFilters = {};
    filters.forEach((filter) => {
      initialFilters[filter.key] = filter.isMulti ? [] : '';
    });
    setFilterValues(initialFilters);
  }, [filters]);

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        columns.some((column) => {
          const value = item[column.key];
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        }),
      );
    }

    // Apply filters
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && (Array.isArray(value) ? value.length > 0 : value !== '')) {
        filtered = filtered.filter((item) => {
          if (Array.isArray(value)) {
            return value.includes(item[key]);
          }
          return item[key] === value;
        });
      }
    });

    return filtered;
  }, [data, searchTerm, filterValues, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

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
      <FaSortUp className="w-3 h-3 text-primary" />
    ) : (
      <FaSortDown className="w-3 h-3 text-primary" />
    );
  };

  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item[column.key], item);
    }
    return item[column.key];
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
      className={`overflow-hidden shadow ${className}`}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* Search */}
            {searchable && (
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm w-full sm:w-64"
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    sortable && column.sortable !== false
                      ? 'cursor-pointer hover:bg-gray-100'
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
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr key={index} className="hover:bg-primary/10">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
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
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing{' '}
              {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} to{' '}
              {Math.min(currentPage * pageSize, sortedData.length)} of{' '}
              {sortedData.length} results
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-primary/30 rounded-md hover:bg-primary/10 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-primary/30 flex items-center space-x-1 transition-colors"
              >
                <FaChevronLeft className="w-3 h-3" />
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
                          ? 'border-primary/30 hover:bg-primary/10 hover:border-primary'
                          : 'border-transparent cursor-default'
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
                className="px-3 py-1 text-sm border border-primary/30 rounded-md hover:bg-primary/10 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-primary/30 flex items-center space-x-1 transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <FaChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </CardWrapper>
  );
};

export default ReusableTable;
