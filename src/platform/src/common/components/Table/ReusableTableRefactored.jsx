'use client';
import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { FaSort } from 'react-icons/fa';
import { AqChevronDown, AqChevronUp } from '@airqo/icons-react';
import { FiCheck, FiMinus } from 'react-icons/fi';
import Spinner from '@/components/Spinner';
import CardWrapper from '@/components/CardWrapper';

// Hooks
import { useTableSearch } from './hooks/useTableSearch';
import { useTableFilters } from './hooks/useTableFilters';
import { useTableSorting } from './hooks/useTableSorting';
import { useTablePagination } from './hooks/useTablePagination';

// Components
import TableHeader from './components/TableHeader';
import MultiSelectActionBar from './components/MultiSelectActionBar';
import TablePagination from './components/TablePagination';

// Utils
import {
  renderTableCell,
  getSortIcon,
  hasActiveFilters,
} from './utils/tableUtils';

/* ---------------- Helpers ---------------- */
const hashObj = (obj) => {
  const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return (h >>> 0).toString(36);
};

// Unified 16×16 checkbox used for both header and rows
const CheckBox = ({ checked, indeterminate = false, onToggle, ariaLabel }) => {
  const next = () => (indeterminate ? true : !checked);
  return (
    <button
      type="button"
      role="checkbox"
      aria-label={ariaLabel}
      aria-checked={indeterminate ? 'mixed' : checked}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(next());
      }}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onToggle(next());
        }
      }}
      className={`h-4 w-4 flex items-center justify-center rounded border text-white ${
        checked || indeterminate
          ? 'bg-green-600 border-green-600'
          : 'bg-white border-gray-300 dark:border-gray-600 text-transparent'
      }`}
      style={{ lineHeight: 0 }}
    >
      {indeterminate ? (
        <FiMinus size={12} />
      ) : checked ? (
        <FiCheck size={12} />
      ) : null}
    </button>
  );
};
/* ----------------------------------------- */

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

  // Multi-select
  multiSelect = false,
  actions = [], // [{ label, value?, handler:(rows)=>void }]
  onSelectedItemsChange, // (rows)=>void
}) => {
  /* Search */
  const { searchTerm, setSearchTerm, searchedData, handleClearSearch } =
    useTableSearch(data, columns, searchableColumns);

  /* Filters */
  const {
    filterValues,
    filteredData: postFilterData,
    handleFilterChange,
  } = useTableFilters(searchedData, filters);

  /* Sort */
  const { sortConfig, sortedData, handleSort } = useTableSorting(
    postFilterData,
    sortable,
  );

  /* Pagination */
  const {
    currentPage,
    setCurrentPage,
    currentPageSize,
    handlePageSizeChange,
    paginatedData,
    totalPages,
    generatePageNumbers,
  } = useTablePagination(sortedData, pageSize);

  /* -------- Multi-select (object-based) -------- */
  const [selectedSet, setSelectedSet] = useState(() => new Set());
  const [selectedActionValue, setSelectedActionValue] = useState('');

  // Normalize actions: ensure value exists and is a string
  const normalizedActions = useMemo(
    () =>
      actions.map((a) => ({
        ...a,
        value: String(a.value ?? a.label ?? ''),
      })),
    [actions],
  );

  // Keep only rows still present after search/filter/sort
  useEffect(() => {
    if (selectedSet.size === 0) return;
    const present = new Set(sortedData); // reference equality
    const next = new Set();
    selectedSet.forEach((row) => present.has(row) && next.add(row));
    if (next.size !== selectedSet.size) setSelectedSet(next);
  }, [sortedData]); // runs only when sortedData ref changes

  const pageRows = paginatedData;

  const selectedCountOnPage = useMemo(
    () => pageRows.reduce((acc, r) => acc + (selectedSet.has(r) ? 1 : 0), 0),
    [pageRows, selectedSet],
  );
  const isAllSelectedOnPage =
    pageRows.length > 0 && selectedCountOnPage === pageRows.length;
  const isIndeterminate =
    selectedCountOnPage > 0 && selectedCountOnPage < pageRows.length;

  const selectedRows = useMemo(() => Array.from(selectedSet), [selectedSet]);

  const handleSelectItem = useCallback((row, checked) => {
    setSelectedSet((prev) => {
      const next = new Set(prev);
      if (checked) next.add(row);
      else next.delete(row);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(
    (val) => {
      setSelectedSet((prev) => {
        const next = new Set(prev);
        if (val) pageRows.forEach((r) => next.add(r));
        else pageRows.forEach((r) => next.delete(r));
        return next;
      });
    },
    [pageRows],
  );

  // Accept event/string/object from action bar and extract value
  const handleActionChange = useCallback((a) => {
    let v = '';
    if (a && typeof a === 'object') {
      if ('target' in a && a.target && typeof a.target.value !== 'undefined') {
        v = String(a.target.value);
      } else if ('value' in a) {
        v = String(a.value);
      }
    } else if (typeof a === 'string') {
      v = a;
    }
    setSelectedActionValue(v);
  }, []);

  const selectedActionObj = useMemo(
    () =>
      normalizedActions.find((x) => x.value === selectedActionValue) || null,
    [normalizedActions, selectedActionValue],
  );

  const handleActionSubmit = useCallback(() => {
    if (!selectedActionObj || typeof selectedActionObj.handler !== 'function')
      return;
    if (selectedRows.length === 0) return;
    selectedActionObj.handler(selectedRows); // pass FULL ROW OBJECTS
  }, [selectedActionObj, selectedRows]);

  // Notify parent once per change
  useEffect(() => {
    if (onSelectedItemsChange) onSelectedItemsChange(selectedRows);
  }, [selectedRows, onSelectedItemsChange]);

  // Reset to first page when search/filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValues, setCurrentPage]);

  /* Sort icons */
  const getSortIconWithIcons = useCallback(
    (key) =>
      getSortIcon(key, sortConfig, { FaSort, AqChevronUp, AqChevronDown }),
    [sortConfig],
  );

  /* Columns (prepend checkbox column for multiSelect) */
  const displayColumns = useMemo(() => {
    const cols = [...columns];
    if (multiSelect) {
      cols.unshift({
        key: 'checkbox',
        label: (
          <CheckBox
            checked={isAllSelectedOnPage}
            indeterminate={isIndeterminate}
            onToggle={(val) => handleSelectAll(val)}
            ariaLabel="Select all rows on this page"
          />
        ),
        render: (value, item) => (
          <CheckBox
            checked={selectedSet.has(item)}
            onToggle={(val) => handleSelectItem(item, val)}
            ariaLabel="Select row"
          />
        ),
        sortable: false,
      });
    }
    return cols;
  }, [
    columns,
    multiSelect,
    isAllSelectedOnPage,
    isIndeterminate,
    selectedSet,
    handleSelectAll,
    handleSelectItem,
  ]);

  // Stable React key (rendering only; not used for selection)
  const getRowKey = useCallback((item, index) => {
    const k = item?.id ?? item?._id ?? item?.uuid ?? item?.key;
    return k != null ? String(k) : `${hashObj(item)}-${index}`;
  }, []);

  return (
    <CardWrapper
      padding="p-0"
      header={headerComponent}
      className={`overflow-hidden shadow ${className}`}
    >
      {/* Header */}
      <TableHeader
        title={title}
        searchable={searchable}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={handleClearSearch}
        filterable={filterable}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
      />

      {/* Multi-Select Action Bar */}
      {multiSelect && (
        <MultiSelectActionBar
          key={`${selectedActionValue}-${selectedRows.length}`} /* force fresh render */
          selectedItems={selectedRows} /* array of full rows */
          actions={normalizedActions}
          selectedAction={selectedActionValue} /* value string */
          onActionChange={handleActionChange} /* event/string/object safe */
          onActionSubmit={handleActionSubmit} /* calls handler(rows) */
        />
      )}

      {/* Table / Loading */}
      <div className="overflow-x-auto">
        {loading ? (
          (loadingComponent ?? (
            <div className="w-full py-12 flex justify-center items-center">
              <Spinner size={30} />
            </div>
          ))
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-gray-200 dark:border-gray-600 border-b dark:bg-[#1d1f20]">
              <tr>
                {displayColumns.map((column) => (
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
                        getSortIconWithIcons(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1d1f20] divide-y divide-gray-200 dark:divide-gray-800">
              {pageRows.length > 0 ? (
                pageRows.map((item, index) => (
                  <tr
                    key={getRowKey(item, index)}
                    className="hover:bg-primary/5 dark:hover:bg-primary/20"
                  >
                    {displayColumns.map((column) => (
                      <td
                        key={column.key}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                      >
                        {renderTableCell(item, column)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={displayColumns.length}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {searchTerm || hasActiveFilters(filterValues)
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
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          currentPageSize={currentPageSize}
          totalItems={sortedData.length}
          pageSizeOptions={pageSizeOptions}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
          generatePageNumbers={generatePageNumbers}
        />
      )}
    </CardWrapper>
  );
};

export default ReusableTable;
