/**
 * Utility functions for table operations
 */

/**
 * Renders a table cell value
 * @param {*} item - The row item
 * @param {Object} column - The column configuration
 * @returns {*} Rendered cell value
 */
export const renderTableCell = (item, column) => {
  if (column.render) {
    return column.render(item[column.key], item);
  }
  const value = item[column.key];
  return value === null || value === undefined ? '' : String(value);
};

/**
 * Gets the appropriate sort icon for a column
 * @param {string} key - Column key
 * @param {Object} sortConfig - Current sort configuration
 * @param {Object} icons - Icon components
 * @returns {JSX.Element} Sort icon component
 */
export const getSortIcon = (key, sortConfig, icons) => {
  if (sortConfig.key !== key) {
    return (
      <icons.FaSort className="w-3 h-3 text-gray-400 dark:text-gray-300" />
    );
  }
  return sortConfig.direction === 'asc' ? (
    <icons.AqChevronUp className="w-3 h-3 text-primary" />
  ) : (
    <icons.AqChevronDown className="w-3 h-3 text-primary" />
  );
};

/**
 * Determines if any filters are active
 * @param {Object} filterValues - Current filter values
 * @returns {boolean} Whether any filters are active
 */
export const hasActiveFilters = (filterValues) => {
  return Object.values(filterValues).some(
    (v) => v && (Array.isArray(v) ? v.length > 0 : v !== ''),
  );
};
