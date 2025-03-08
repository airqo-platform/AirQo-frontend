import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MdIndeterminateCheckBox } from 'react-icons/md';
import ShortLeftArrow from '@/icons/Analytics/shortLeftArrow';
import ShortRightArrow from '@/icons/Analytics/shortRightArrow';
import TableLoadingSkeleton from './TableLoadingSkeleton';
import TopBarSearch from '../../../search/TopBarSearch';

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
 * - error (Boolean): If true, shows an error fallback.
 * - itemsPerPage (Number): Defaults to 6.
 * - selectedRows (Array): Currently selected items.
 * - setSelectedRows (Function): Sets the selectedRows array.
 * - clearSelectionTrigger (any): Changing this resets selectedRows.
 * - onToggleRow (Function): Called when a checkbox is toggled.
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

  /**
   * Deduplicate data by _id (if present)
   */
  const uniqueData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const seen = new Set();
    return data.filter((item) => {
      if (!item._id || seen.has(item._id)) return false;
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
      result = onFilter(uniqueData, activeFilter);
    }
    if (searchResults.length > 0) {
      result = searchResults.map((r) => r.item);
    }
    return result;
  }, [uniqueData, onFilter, activeFilter, searchResults]);

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
   * Error fallback
   */
  if (error) {
    return (
      <div className="p-4 text-red-600 text-center">
        <p>Something went wrong. Please try again later.</p>
      </div>
    );
  }

  /**
   * Loading skeleton
   */
  if (loading) {
    return <TableLoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Filters + Search */}
      <div className="flex flex-wrap items-center justify-between">
        {/* Filter Buttons */}
        <div className="flex gap-2">
          {filters.map((filterDef) => {
            const isActive = activeFilter?.key === filterDef.key;
            return (
              <button
                key={filterDef.key}
                type="button"
                onClick={() => {
                  setActiveFilter(filterDef);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 shadow rounded-xl text-sm font-medium border transition-colors
                  ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }
                `}
              >
                {filterDef.label}
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
            placeholder="Search location..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto border border-gray-200 rounded-lg bg-white">
        {currentPageData.length === 0 ? (
          <div className="p-4 text-center text-gray-700">
            No data available.
          </div>
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
                          // Pass item and index to the render function for custom formatting.
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
      {totalPages > 1 && (
        <div className="flex justify-end items-center">
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
