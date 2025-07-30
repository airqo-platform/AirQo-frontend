import { useState, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';

/**
 * Custom hook for handling table search functionality
 * @param {Array} data - The data to search through
 * @param {Array} columns - The table columns configuration
 * @param {Array} searchableColumns - Specific columns to search in (optional)
 * @returns {Object} Search state and handlers
 */
export const useTableSearch = (data, columns, searchableColumns = null) => {
  const [searchTerm, setSearchTerm] = useState('');

  const searchedData = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) {
      return data;
    }

    // Determine searchable keys
    let fuseKeys;
    if (Array.isArray(searchableColumns) && searchableColumns.length > 0) {
      fuseKeys = searchableColumns;
    } else {
      const allKeys = columns.map((col) => col.key);
      const keysWithData = allKeys.filter((key) =>
        data.some(
          (item) =>
            item[key] !== null &&
            item[key] !== undefined &&
            String(item[key]).trim() !== '',
        ),
      );
      fuseKeys = keysWithData.length > 0 ? keysWithData : allKeys;
    }

    if (fuseKeys.length === 0) {
      return data;
    }

    const getSearchableString = (item, key) => {
      const col = columns.find((c) => c.key === key);
      let value = item[key];

      // If column has a render function, attempt to get a searchable string from it
      if (col && typeof col.render === 'function') {
        try {
          const rendered = col.render(item[key], item);
          if (typeof rendered === 'string') return rendered;
          if (typeof rendered === 'number') return String(rendered);

          // Handle JSX elements
          if (rendered && typeof rendered === 'object' && rendered.props) {
            if (typeof rendered.props.children === 'string') {
              return rendered.props.children;
            }
            if (Array.isArray(rendered.props.children)) {
              return rendered.props.children
                .map((child) => (typeof child === 'string' ? child : ''))
                .join(' ');
            }
          }
        } catch {
          // If render throws or is complex, fallback to raw value stringification
        }
      }

      // Default stringification
      if (value && typeof value === 'object') {
        return JSON.stringify(value);
      }
      return value === null || value === undefined ? '' : String(value);
    };

    // Prepare data for Fuse.js
    const fuseData = data.map((item) => {
      const obj = {};
      fuseKeys.forEach((key) => {
        obj[key] = getSearchableString(item, key);
      });
      return obj;
    });

    // Configure and execute Fuse.js search
    const fuseOptions = {
      keys: fuseKeys,
      threshold: searchTerm.length === 1 ? 0.8 : 0.4,
      ignoreLocation: true,
      minMatchCharLength: 1,
      isCaseSensitive: false,
      includeScore: true,
    };

    const fuse = new Fuse(fuseData, fuseOptions);
    const fuseResults = fuse.search(searchTerm.trim());

    // Map search results back to original data items
    const result = fuseResults
      .filter((res) => (searchTerm.length === 1 ? res.score <= 0.8 : true))
      .map((result) => data[result.refIndex]);

    return result;
  }, [data, searchTerm, columns, searchableColumns]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    searchedData,
    handleClearSearch,
  };
};
