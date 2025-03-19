import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MdIndeterminateCheckBox,
  MdErrorOutline,
  MdRefresh,
} from 'react-icons/md';
import ShortLeftArrow from '@/icons/Analytics/shortLeftArrow';
import ShortRightArrow from '@/icons/Analytics/shortRightArrow';
import TableLoadingSkeleton from './TableLoadingSkeleton';
import TopBarSearch from '../../../search/TopBarSearch';
import InfoMessage from './InfoMessage';

/**
 * DataTable Props:
 * - data (Array): The raw data items.
 * - columns (Array): Default column definitions.
 *   Each column can have:
 *     - key (string): The property name in the data item.
 *     - label (string): Column header text.
 *     - render (function): (item, index) => JSX.Element. If provided, used to render the cell.
 * - columnsByFilter (Object): An object mapping filter keys to column definitions.
 * - filters (Array): Filter definitions.
 * - onFilter (Function): (allData, activeFilter) => filteredData.
 * - loading (Boolean): Whether to show a loading skeleton.
 * - error (Boolean): If true, shows a global error fallback.
 * - errorMessage (String): Error message to display in the global fallback.
 * - onRetry (Function): Function to call when the user clicks "Try Again" in the error fallback.
 * - itemsPerPage (Number): Defaults to 6.
 * - selectedRows (Array): Currently selected items.
 * - setSelectedRows (Function): Sets the selectedRows array.
 * - clearSelectionTrigger (any): Changing this resets selectedRows.
 * - onToggleRow (Function): Called when a checkbox is toggled. If omitted, the default row toggle logic is used.
 * - searchKeys (Array): Keys used by Fuse.js for searching. Defaults to ['name'].
 */
function DataTable({
  data = [],
  columns = [],
  columnsByFilter,
  filters = [],
  onFilter = null,
  loading = false,
  error = false,
  errorMessage = 'Something went wrong. Please try again.',
  onRetry = null,
  itemsPerPage = 6,
  selectedRows = [],
  setSelectedRows = () => {},
  clearSelectionTrigger,
  onToggleRow,
  searchKeys = ['name'],
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [activeFilter, setActiveFilter] = useState(filters[0] || null);
  const [searchResults, setSearchResults] = useState([]);
  const [filterErrors, setFilterErrors] = useState({});

  /**
   * Deduplicate data by _id (if present)
   */
  const uniqueData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const seen = new Set();
    return data.filter((item) => {
      if (!item || !item._id || seen.has(item._id)) return false;
      seen.add(item._id);
      return true;
    });
  }, [data]);

  /**
   * Clear selections if trigger changes
   */
  useEffect(() => {
    setSelectedRows([]);
    setSelectAll(false);
    setIndeterminate(false);
  }, [clearSelectionTrigger, setSelectedRows]);

  /**
   * Apply filters if provided, then override with search results
   */
  const filteredData = useMemo(() => {
    let result = [...uniqueData];
    if (onFilter && activeFilter) {
      try {
        const filteredResult = onFilter(uniqueData, activeFilter);
        if (Array.isArray(filteredResult)) {
          result = filteredResult;
          // Clear error for this filter if it was previously set
          if (filterErrors[activeFilter.key]) {
            setFilterErrors((prev) => ({
              ...prev,
              [activeFilter.key]: null,
            }));
          }
        }
      } catch (err) {
        console.error(`Filter error for ${activeFilter.key}:`, err);
        setFilterErrors((prev) => ({
          ...prev,
          [activeFilter.key]: err.message || 'Error applying filter',
        }));
      }
    }

    // If there are search results, they override the filtered data
    if (searchResults.length > 0) {
      result = searchResults.map((r) => r.item);
    }
    return result;
  }, [uniqueData, onFilter, activeFilter, searchResults, filterErrors]);

  /**
   * Determine effective columns:
   * If a columnsByFilter mapping is provided and contains the active filter key,
   * use that; otherwise, fall back to the default columns.
   */
  const effectiveColumns = useMemo(() => {
    if (columnsByFilter && activeFilter && columnsByFilter[activeFilter.key]) {
      return columnsByFilter[activeFilter.key] || [];
    }
    return columns || [];
  }, [columnsByFilter, activeFilter, columns]);

  /**
   * Pagination calculations
   */
  const totalPages = useMemo(() => {
    return Math.ceil(filteredData.length / itemsPerPage) || 1;
  }, [filteredData, itemsPerPage]);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages],
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = useMemo(() => {
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, startIndex, endIndex]);

  /**
   * Row selection logic
   */
  const defaultOnToggleRow = (item) => {
    const isSelected = selectedRows.some((row) => row._id === item._id);
    if (isSelected) {
      setSelectedRows(selectedRows.filter((row) => row._id !== item._id));
    } else {
      setSelectedRows([...selectedRows, item]);
    }
  };

  const handleRowToggle = useCallback(
    (item) => {
      if (onToggleRow) {
        onToggleRow(item);
      } else {
        defaultOnToggleRow(item);
      }
    },
    [onToggleRow, selectedRows],
  );

  /**
   * Select all / Deselect all (for current page)
   */
  const handleSelectAllChange = useCallback(() => {
    if (selectAll || indeterminate) {
      setSelectedRows([]);
      setSelectAll(false);
      setIndeterminate(false);
    } else {
      setSelectedRows(currentPageData);
      setSelectAll(true);
      setIndeterminate(false);
    }
  }, [selectAll, indeterminate, setSelectedRows, currentPageData]);

  /**
   * Update selectAll & indeterminate states
   */
  useEffect(() => {
    if (!currentPageData.length) {
      setSelectAll(false);
      setIndeterminate(false);
      return;
    }
    if (selectedRows.length === currentPageData.length) {
      setSelectAll(true);
      setIndeterminate(false);
    } else if (selectedRows.length > 0) {
      setSelectAll(false);
      setIndeterminate(true);
    } else {
      setSelectAll(false);
      setIndeterminate(false);
    }
  }, [selectedRows, currentPageData]);

  /**
   * Search handling
   */
  const handleSearch = useCallback((results) => {
    setSearchResults(results);
    setCurrentPage(1);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  /**
   * Handle switching filter tabs
   */
  const handleFilterChange = (filterDef) => {
    setActiveFilter(filterDef);
    setCurrentPage(1);
  };

  /**
   * Filter-specific error message
   */
  const renderFilterError = () => {
    const errorText = filterErrors[activeFilter?.key];
    if (errorText) {
      return (
        <div className="flex flex-col items-start p-4 mb-4 space-y-2 bg-red-50 border-l-4 border-red-500 rounded-md">
          <div className="flex items-center space-x-2">
            <MdErrorOutline className="text-red-500 text-2xl" />
            <p className="text-red-700 font-semibold text-sm">
              Unable to load {activeFilter?.label || 'data'}
            </p>
          </div>
          <p className="text-sm text-red-600">{errorText}</p>
          {onRetry && (
            <button
              onClick={() => onRetry(activeFilter.key)}
              className="inline-flex items-center px-3 py-1.5 space-x-2 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <MdRefresh size={16} />
              <span>Retry Loading</span>
            </button>
          )}
        </div>
      );
    }
    return null;
  };

  /**
   * Global error fallback
   */
  if (error && !activeFilter) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-red-50 border border-red-200 rounded-lg text-center">
        <MdErrorOutline className="text-red-500 text-6xl" />
        <h3 className="text-xl font-semibold text-red-800">
          Oops! Something went wrong.
        </h3>
        <p className="text-red-700 text-sm max-w-sm">
          {errorMessage || 'Unable to load data.'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 space-x-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <MdRefresh size={18} />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  /**
   * Loading skeleton
   */
  if (loading && !activeFilter) {
    return <TableLoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Filters + Search */}
      <div className="flex flex-wrap items-center justify-between mb-2">
        {/* Filter Buttons */}
        <div className="flex gap-2">
          {filters.map((filterDef) => {
            const isActive = activeFilter?.key === filterDef.key;
            const hasError = !!filterErrors[filterDef.key];

            return (
              <button
                key={filterDef.key}
                type="button"
                onClick={() => handleFilterChange(filterDef)}
                className={`px-4 py-2 shadow rounded-xl text-sm font-medium border transition-colors relative
                  ${
                    isActive
                      ? hasError
                        ? 'bg-red-600 text-white'
                        : 'bg-blue-600 text-white'
                      : hasError
                        ? 'bg-white text-red-700 border-red-300 hover:bg-red-50'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }
                `}
              >
                {filterDef.label}
                {hasError && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
        {/* Search Bar */}
        <div>
          <TopBarSearch
            data={uniqueData}
            onSearch={handleSearch}
            onClearSearch={handleClearSearch}
            fuseOptions={{ keys: searchKeys, threshold: 0.3 }}
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Filter-specific error message (if any) */}
      {renderFilterError()}

      {/* Main Table Container */}
      <div className="relative overflow-x-auto border border-gray-200 rounded-lg bg-white">
        {/* Show a loading skeleton if we're actively loading and do have an active filter */}
        {loading && activeFilter ? (
          <TableLoadingSkeleton />
        ) : currentPageData.length === 0 ? (
          <InfoMessage
            title="No data available."
            description="Try adjusting your search or filter criteria."
            variant="info"
          />
        ) : (
          <table className="w-full text-sm text-left text-gray-900">
            <thead className="border-b bg-gray-50 border-gray-200">
              <tr className="text-gray-500 text-sm font-normal">
                {/* Checkbox column */}
                <th scope="col" className="w-4 p-4">
                  <div className="flex items-center">
                    {indeterminate ? (
                      <button
                        type="button"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border border-gray-300 rounded cursor-pointer flex items-center justify-center"
                        onClick={handleSelectAllChange}
                        aria-label="Select all items"
                      >
                        <MdIndeterminateCheckBox size={16} />
                      </button>
                    ) : (
                      <input
                        id="checkbox-all-search"
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border border-gray-300 rounded focus:ring-blue-500"
                        checked={selectAll}
                        onChange={handleSelectAllChange}
                        aria-label="Select all items"
                      />
                    )}
                  </div>
                </th>
                {/* Render column headers dynamically using effectiveColumns */}
                {effectiveColumns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className="py-3 px-3 font-normal"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentPageData.map((item, idx) => {
                const isSelected = selectedRows.some(
                  (row) => row._id === item._id,
                );
                return (
                  <tr
                    key={item._id || idx}
                    className="border-b py-4 border-gray-100 hover:bg-slate-50"
                  >
                    {/* Checkbox column */}
                    <td className="w-4 p-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border border-gray-300 rounded focus:ring-blue-500"
                          checked={isSelected}
                          onChange={() => handleRowToggle(item)}
                        />
                      </div>
                    </td>
                    {/* Render each cell based on effectiveColumns */}
                    {effectiveColumns.map((col, colIdx) => {
                      let cellContent;
                      if (col.render && typeof col.render === 'function') {
                        try {
                          cellContent = col.render(item, idx);
                        } catch (err) {
                          console.error(
                            `Error rendering column ${col.key}:`,
                            err,
                          );
                          cellContent = 'Error';
                        }
                      } else {
                        cellContent =
                          item[col.key] !== undefined && item[col.key] !== null
                            ? item[col.key]
                            : 'N/A';
                      }
                      return (
                        <td key={`${col.key}-${colIdx}`} className="py-2 px-3">
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-end items-center mt-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className={`mr-2 w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 ${
              currentPage === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShortLeftArrow />
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className={`w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 ${
              currentPage === totalPages
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShortRightArrow />
          </button>
        </div>
      )}
    </div>
  );
}

export default DataTable;
