import { useState, useMemo, useCallback } from 'react';

/**
 * Custom hook for handling table sorting functionality
 * @param {Array} data - The data to sort
 * @param {boolean} sortable - Whether sorting is enabled
 * @returns {Object} Sort state and handlers
 */
export const useTableSorting = (data, sortable = true) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortable) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

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
  }, [data, sortConfig, sortable]);

  const handleSort = useCallback(
    (key) => {
      if (!sortable) return;
      setSortConfig((prev) => ({
        key,
        direction:
          prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
      }));
    },
    [sortable],
  );

  return {
    sortConfig,
    sortedData,
    handleSort,
  };
};
