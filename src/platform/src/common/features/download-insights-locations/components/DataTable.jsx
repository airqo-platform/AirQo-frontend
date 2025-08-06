import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  MdIndeterminateCheckBox,
  MdErrorOutline,
  MdRefresh,
  MdSort,
  MdArrowUpward,
  MdArrowDownward,
  MdFilterList,
  MdClear,
  MdCheck,
  MdSearch,
} from 'react-icons/md';
import { AqChevronLeft, AqChevronRight } from '@airqo/icons-react';
import TableLoadingSkeleton from './TableLoadingSkeleton';
import TopBarSearch from './TopBarSearch';
import InfoMessage from '@/components/Messages/InfoMessage';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import Button from '@/components/Button';

const ColumnFilter = ({ column, data, onFilter, isActive, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState(new Set());
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const uniqueValues = useMemo(() => {
    if (!data || !column.key) return [];
    return [
      ...new Set(
        data.map((item) =>
          item[column.key] != null ? String(item[column.key]) : '--',
        ),
      ),
    ].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }, [data, column.key]);

  const filteredValues = useMemo(() => {
    if (!searchTerm) return uniqueValues;
    const term = searchTerm.toLowerCase();
    return uniqueValues.filter((value) => value.toLowerCase().includes(term));
  }, [uniqueValues, searchTerm]);

  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const dropdownWidth = 300;
    const dropdownHeight = Math.min(400, filteredValues.length * 40 + 250);
    let top = buttonRect.bottom + 8;
    let left = buttonRect.right - dropdownWidth;

    if (left < 20)
      left = Math.min(buttonRect.left, viewportWidth - dropdownWidth - 20);
    if (left + dropdownWidth > viewportWidth - 20)
      left = Math.max(20, viewportWidth - dropdownWidth - 20);
    if (top + dropdownHeight > viewportHeight - 20)
      top = Math.max(20, buttonRect.top - dropdownHeight - 8);

    setDropdownPosition({ top, left });
  }, [filteredValues.length]);

  const handleValueToggle = useCallback((value) => {
    setSelectedValues((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    });
  }, []);

  const handleApplyFilter = useCallback(() => {
    onFilter(selectedValues.size === 0 ? null : Array.from(selectedValues));
    setIsOpen(false);
  }, [selectedValues, onFilter]);

  const handleClearFilter = useCallback(() => {
    setSelectedValues(new Set());
    onFilter(null);
    setIsOpen(false);
  }, [onFilter]);

  const handleSelectAll = useCallback(() => {
    setSelectedValues((prev) =>
      prev.size === filteredValues.length ? new Set() : new Set(filteredValues),
    );
  }, [filteredValues]);

  const handleToggleOpen = useCallback(() => {
    if (!isOpen) calculatePosition();
    setIsOpen((prev) => !prev);
  }, [isOpen, calculatePosition]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event) => event.key === 'Escape' && setIsOpen(false);
    const handleScroll = () => isOpen && calculatePosition();
    const handleResize = () => isOpen && calculatePosition();

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      setTimeout(calculatePosition, 0);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, calculatePosition]);

  const formatFilterValue = (value) => {
    if (value === '--') return value;
    return value
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={handleToggleOpen}
        className={`p-1 rounded transition-colors ${
          isActive
            ? 'text-primary bg-primary/10'
            : 'text-gray-400 hover:text-gray-600'
        } ${darkMode ? (isActive ? 'bg-primary/20 text-primary' : 'hover:bg-gray-700 hover:text-gray-300') : 'hover:bg-gray-100'}`}
        aria-label={`Filter ${column.label}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MdFilterList size={16} />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            zIndex: 9999,
            width: '300px',
            maxHeight: '400px',
          }}
          className={`shadow-2xl rounded-lg border backdrop-blur-sm ${
            darkMode
              ? 'bg-gray-800/95 border-gray-600 text-white shadow-gray-900/50'
              : 'bg-white/95 border-gray-200 text-gray-900 shadow-gray-500/20'
          }`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Filter {column.label}</h4>
              <button
                onClick={() => setIsOpen(false)}
                className={`text-gray-400 hover:text-gray-600 p-1 rounded transition-colors ${
                  darkMode
                    ? 'hover:text-gray-300 hover:bg-gray-700'
                    : 'hover:bg-gray-100'
                }`}
                aria-label="Close filter"
              >
                <MdClear size={16} />
              </button>
            </div>

            {uniqueValues.length > 10 && (
              <div
                className={`relative mb-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-md`}
              >
                <MdSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search values..."
                  className={`w-full pl-10 pr-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    darkMode
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                />
              </div>
            )}

            <div className="flex gap-2 mb-3">
              <button
                onClick={handleSelectAll}
                className={`text-xs px-3 py-1.5 rounded transition-colors ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {selectedValues.size === filteredValues.length
                  ? 'Deselect All'
                  : 'Select All'}
              </button>
              <button
                onClick={handleClearFilter}
                className={`text-xs px-3 py-1.5 rounded transition-colors ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Clear
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {filteredValues.map((value) => (
                <label
                  key={value}
                  className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                    darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.has(value)}
                    onChange={() => handleValueToggle(value)}
                    className="w-4 h-4 text-primary rounded focus:ring-primary focus:ring-2"
                  />
                  <span
                    className="text-sm truncate flex-1 select-none"
                    title={value}
                  >
                    {formatFilterValue(value)}
                  </span>
                  {selectedValues.has(value) && (
                    <MdCheck size={14} className="text-primary flex-shrink-0" />
                  )}
                </label>
              ))}
              {filteredValues.length === 0 && (
                <div className="p-3 text-center text-gray-500 text-sm">
                  {searchTerm ? 'No matching values' : 'No values available'}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
              <Button
                variant="filled"
                onClick={handleApplyFilter}
                className="flex-1 text-xs py-2 bg-primary hover:bg-primary/90"
              >
                Apply ({selectedValues.size})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DataTable = ({
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
  searchKeys = [],
  showViewDataButton = false,
  onViewDataClick = () => {},
  enableSorting = true,
  enableColumnFilters = true,
  defaultSortColumn = null,
  defaultSortDirection = 'asc',
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [activeFilter, setActiveFilter] = useState(filters[0] || null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [filterErrors, setFilterErrors] = useState({});
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: defaultSortColumn,
    direction: defaultSortDirection,
  });
  const [columnFilters, setColumnFilters] = useState({});
  const mountedRef = useRef(true);
  const { theme, systemTheme } = useTheme();
  const darkMode = useMemo(
    () => theme === 'dark' || (theme === 'system' && systemTheme === 'dark'),
    [theme, systemTheme],
  );

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

  const uniqueData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const seen = new Set();
    return data.filter(
      (item) => item?._id && !seen.has(item._id) && seen.add(item._id),
    );
  }, [data]);

  useEffect(() => {
    if (mountedRef.current) {
      setSelectedRows([]);
      setSelectAll(false);
      setIndeterminate(false);
    }
  }, [clearSelectionTrigger, setSelectedRows]);

  const processedColumns = useMemo(() => {
    const cols = columnsByFilter?.[activeFilter?.key] || columns || [];
    return cols.map((col) => ({
      ...col,
      sortable: col.sortable !== false && enableSorting,
      filterable: col.filterable !== false && enableColumnFilters,
    }));
  }, [
    columnsByFilter,
    activeFilter,
    columns,
    enableSorting,
    enableColumnFilters,
  ]);

  const baseFilteredData = useMemo(() => {
    let result = [...uniqueData];

    if (onFilter && activeFilter && !isSearchActive) {
      try {
        const filtered = onFilter(uniqueData, activeFilter);
        result = Array.isArray(filtered) ? filtered : result;
        setFilterErrors((prev) => ({ ...prev, [activeFilter.key]: null }));
      } catch (err) {
        setFilterErrors((prev) => ({
          ...prev,
          [activeFilter.key]: err.message || 'Filter error',
        }));
      }
    }

    if (isSearchActive) {
      result = searchResults.map((r) => r.item || r);
    }

    return result;
  }, [uniqueData, onFilter, activeFilter, searchResults, isSearchActive]);

  const processedData = useMemo(() => {
    let result = [...baseFilteredData];

    if (enableColumnFilters) {
      Object.entries(columnFilters).forEach(([columnKey, filterValues]) => {
        if (filterValues?.length > 0) {
          result = result.filter((item) => {
            const value = item[columnKey];
            const stringValue = value != null ? String(value) : '--';
            return filterValues.includes(stringValue);
          });
        }
      });
    }

    if (enableSorting && sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;

        const aStr = String(aValue);
        const bStr = String(bValue);

        const aNum = parseFloat(aStr);
        const bNum = parseFloat(bStr);

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        return sortConfig.direction === 'asc'
          ? aStr.localeCompare(bStr, undefined, {
              numeric: true,
              sensitivity: 'base',
            })
          : bStr.localeCompare(aStr, undefined, {
              numeric: true,
              sensitivity: 'base',
            });
      });
    }

    return result;
  }, [
    baseFilteredData,
    columnFilters,
    sortConfig,
    enableColumnFilters,
    enableSorting,
  ]);

  const { totalPages, currentPageData } = useMemo(() => {
    const total = Math.max(1, Math.ceil(processedData.length / itemsPerPage));
    const start = (currentPage - 1) * itemsPerPage;
    const pageData = processedData.slice(start, start + itemsPerPage);
    return { totalPages: total, currentPageData: pageData };
  }, [processedData, currentPage, itemsPerPage]);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        setCurrentPage(page);
      }
    },
    [totalPages, currentPage],
  );

  const handleSort = useCallback(
    (columnKey) => {
      if (!enableSorting) return;
      setSortConfig((prev) => ({
        key: columnKey,
        direction:
          prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc',
      }));
      setCurrentPage(1);
    },
    [enableSorting],
  );

  const handleColumnFilter = useCallback((columnKey, filterValues) => {
    setColumnFilters((prev) => ({ ...prev, [columnKey]: filterValues }));
    setCurrentPage(1);
  }, []);

  const handleRowToggle = useCallback(
    (item) => {
      if (!mountedRef.current) return;
      if (onToggleRow) {
        onToggleRow(item);
      } else {
        const isSelected = selectedRows.some((row) => row._id === item._id);
        setSelectedRows((prev) =>
          isSelected
            ? prev.filter((row) => row._id !== item._id)
            : [...prev, item],
        );
      }
    },
    [onToggleRow, selectedRows, setSelectedRows],
  );

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

  const handleSearch = useCallback(({ results, term }) => {
    if (!mountedRef.current) return;
    setCurrentSearchTerm(term);
    setIsSearchActive(!(!term || term.trim() === ''));
    setSearchResults(results);
    setCurrentPage(1);
  }, []);

  const handleClearSearch = useCallback(() => {
    if (mountedRef.current) setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((filterDef) => {
    if (!mountedRef.current) return;
    setActiveFilter(filterDef);
    setCurrentPage(1);
    setColumnFilters({});
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setColumnFilters({});
    setCurrentPage(1);
  }, []);

  const hasActiveColumnFilters = useMemo(
    () => Object.values(columnFilters).some((filters) => filters?.length > 0),
    [columnFilters],
  );

  useEffect(() => {
    if (!mountedRef.current || !currentPageData.length) {
      setSelectAll(false);
      setIndeterminate(false);
      return;
    }
    const selectedCount = currentPageData.filter((item) =>
      selectedRows.some((row) => row._id === item._id),
    ).length;

    setSelectAll(selectedCount === currentPageData.length);
    setIndeterminate(
      selectedCount > 0 && selectedCount < currentPageData.length,
    );
  }, [selectedRows, currentPageData]);

  const renderCellContent = useCallback((col, item, index) => {
    if (col.render) {
      try {
        return col.render(item, index);
      } catch {
        return <span className="text-red-500">Error</span>;
      }
    }
    const value = item[col.key];
    return value != null ? String(value) : '--';
  }, []);

  const renderSortIcon = useCallback(
    (columnKey) => {
      if (!enableSorting) return null;
      if (sortConfig.key !== columnKey) {
        return (
          <MdSort
            size={16}
            className="text-gray-400 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        );
      }
      return sortConfig.direction === 'asc' ? (
        <MdArrowUpward size={16} className="text-primary ml-1" />
      ) : (
        <MdArrowDownward size={16} className="text-primary ml-1" />
      );
    },
    [sortConfig, enableSorting],
  );

  const renderFilterError = () => {
    const errorText = filterErrors[activeFilter?.key];
    if (!errorText) return null;
    return (
      <div className="flex items-start p-4 mb-4 space-x-2 bg-red-50 border-l-4 border-red-500 rounded-md">
        <MdErrorOutline className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-red-700 font-semibold text-sm">
            Unable to load {activeFilter?.label || 'data'}
          </p>
          <p className="text-sm text-red-600 mt-1">{errorText}</p>
          {onRetry && (
            <button
              onClick={() => onRetry(activeFilter.key)}
              className="inline-flex items-center px-3 py-1.5 mt-2 space-x-1 text-xs text-white bg-primary rounded-md hover:bg-primary/80 transition-colors"
            >
              <MdRefresh size={14} />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  if (error && !activeFilter) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-red-50 border border-red-200 rounded-lg text-center">
        <MdErrorOutline className="text-red-500 text-6xl" />
        <h3 className="text-xl font-semibold text-red-800">
          Something went wrong
        </h3>
        <p className="text-red-700 text-sm max-w-sm">{errorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 space-x-2 text-sm text-white bg-primary rounded-md hover:bg-primary/80 transition-colors"
          >
            <MdRefresh size={16} />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  if (loading && !activeFilter) {
    return <TableLoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.map((filterDef) => (
              <Button
                key={filterDef.key}
                variant={
                  activeFilter?.key === filterDef.key ? 'filled' : 'outlined'
                }
                onClick={() => handleFilterChange(filterDef)}
              >
                {filterDef.label}
              </Button>
            ))}
          </div>
        )}
        <TopBarSearch
          data={uniqueData}
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
          searchKeys={searchKeys}
          placeholder="Search..."
        />
      </div>

      {renderFilterError()}

      <div
        className={`relative border rounded-lg ${darkMode ? 'border-gray-700 bg-transparent' : 'border-gray-200 bg-white'}`}
      >
        {loading && activeFilter ? (
          <TableLoadingSkeleton />
        ) : currentPageData.length === 0 ? (
          <InfoMessage
            title="No data available"
            description={
              isSearchActive
                ? `No results found for "${currentSearchTerm}". Try different search terms.`
                : 'Try adjusting your filters.'
            }
            variant="info"
          />
        ) : (
          <div className="overflow-x-auto">
            <table
              className={`w-full text-sm text-left ${darkMode ? 'text-white' : 'text-gray-900'}`}
            >
              <thead
                className={`border-b sticky top-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
              >
                <tr className={darkMode ? 'text-gray-300' : 'text-gray-500'}>
                  <th scope="col" className="w-4 p-4">
                    <div className="flex items-center">
                      {indeterminate ? (
                        <button
                          type="button"
                          className="w-4 h-4 text-primary bg-gray-100 border border-gray-300 rounded cursor-pointer flex items-center justify-center"
                          onClick={handleSelectAllChange}
                          aria-label="Toggle selection"
                        >
                          <MdIndeterminateCheckBox size={16} />
                        </button>
                      ) : (
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary bg-gray-100 border border-gray-300 rounded focus:ring-primary"
                          checked={selectAll}
                          onChange={handleSelectAllChange}
                          aria-label="Select all"
                        />
                      )}
                    </div>
                  </th>
                  {processedColumns.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      className="py-3 px-3 font-normal relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center min-w-0 group">
                          {col.sortable ? (
                            <button
                              onClick={() => handleSort(col.key)}
                              className="flex items-center hover:text-primary transition-colors min-w-0"
                            >
                              <span className="truncate">{col.label}</span>
                              {renderSortIcon(col.key)}
                            </button>
                          ) : (
                            <span className="truncate">{col.label}</span>
                          )}
                        </div>
                        {col.filterable && (
                          <div className="flex-shrink-0">
                            <ColumnFilter
                              column={col}
                              data={baseFilteredData}
                              onFilter={(values) =>
                                handleColumnFilter(col.key, values)
                              }
                              isActive={!!columnFilters[col.key]?.length}
                              darkMode={darkMode}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                  {hasActiveColumnFilters && (
                    <th scope="col" className="w-4 p-4 text-right">
                      <button
                        onClick={handleClearAllFilters}
                        className="text-xs px-2 py-1 rounded border transition-colors flex items-center gap-1 ml-auto bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                        aria-label="Clear all filters"
                      >
                        <MdClear size={14} />
                        Clear
                      </button>
                    </th>
                  )}
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
                      className={`border-b transition-colors ${
                        darkMode
                          ? 'border-gray-700 hover:bg-primary/10'
                          : 'border-gray-100 hover:bg-primary/5'
                      }`}
                    >
                      <td className="w-4 p-4">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary bg-gray-100 border border-gray-300 rounded focus:ring-primary"
                          checked={isSelected}
                          onChange={() => handleRowToggle(item)}
                        />
                      </td>
                      {processedColumns.map((col) => (
                        <td key={col.key} className="py-2 px-3">
                          {renderCellContent(col, item, idx)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          {showViewDataButton && (
            <Button variant="text" onClick={onViewDataClick}>
              Visualize Data
            </Button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outlined"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              padding="p-2"
            >
              <AqChevronLeft size={16} />
            </Button>
            <Button
              variant="outlined"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              padding="p-2"
            >
              <AqChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
