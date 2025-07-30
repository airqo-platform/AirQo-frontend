import { useState, useMemo, useCallback, useEffect } from 'react';

/**
 * Custom hook for handling table filtering functionality
 * @param {Array} data - The data to filter
 * @param {Array} filters - Filter configuration array
 * @returns {Object} Filter state and handlers
 */
export const useTableFilters = (data, filters = []) => {
  const [filterValues, setFilterValues] = useState({});

  // Initialize filter values
  useEffect(() => {
    const initialFilters = {};
    filters.forEach((filter) => {
      initialFilters[filter.key] = filter.isMulti ? [] : '';
    });
    setFilterValues(initialFilters);
  }, [filters]);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply filters
    Object.entries(filterValues).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        result = result.filter((item) => {
          if (Array.isArray(value)) {
            return value.includes(item[key]);
          }
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

    return result;
  }, [data, filterValues]);

  const handleFilterChange = useCallback((key, value) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  return {
    filterValues,
    filteredData,
    handleFilterChange,
  };
};
