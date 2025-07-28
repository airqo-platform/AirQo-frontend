import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  MdIndeterminateCheckBox,
  MdErrorOutline,
  MdRefresh,
} from 'react-icons/md';
import { AqChevronLeft, AqChevronRight } from '@airqo/icons-react';
import TableLoadingSkeleton from './TableLoadingSkeleton';
import TopBarSearch from './TopBarSearch';
import InfoMessage from '@/components/Messages/InfoMessage';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import Button from '@/components/Button';

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
  searchKeys = [], // Now correctly handled by TopBarSearch
  showViewDataButton = false,
  onViewDataClick = () => {},
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [activeFilter, setActiveFilter] = useState(filters[0] || null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [filterErrors, setFilterErrors] = useState({});
  const [currentSearchTerm, setCurrentSearchTerm] = useState(''); // Track term for messages
  const mountedRef = useRef(true);
  const { theme, systemTheme } = useTheme();

  const darkMode = useMemo(
    () => theme === 'dark' || (theme === 'system' && systemTheme === 'dark'),
    [theme, systemTheme],
  );

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const uniqueData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const seen = new Set();
    return data.filter((item) => {
      if (!item?._id || seen.has(item._id)) return false;
      seen.add(item._id);
      return true;
    });
  }, [data]);

  useEffect(() => {
    if (!mountedRef.current) return;
    setSelectedRows([]);
    setSelectAll(false);
    setIndeterminate(false);
  }, [clearSelectionTrigger, setSelectedRows]);

  const filteredData = useMemo(() => {
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

    // --- FIX: Only use search results if search is active AND has results ---
    // isSearchActive correctly reflects if a search term was submitted
    if (isSearchActive) {
      result = searchResults.map((r) => r.item || r);
    }
    // --- END FIX ---

    return result;
  }, [uniqueData, onFilter, activeFilter, searchResults, isSearchActive]);

  const effectiveColumns = useMemo(() => {
    if (columnsByFilter?.[activeFilter?.key]) {
      return columnsByFilter[activeFilter.key] || [];
    }
    return columns || [];
  }, [columnsByFilter, activeFilter, columns]);

  const { totalPages, currentPageData } = useMemo(() => {
    const total = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
    const start = (currentPage - 1) * itemsPerPage;
    const pageData = filteredData.slice(start, start + itemsPerPage);
    return { totalPages: total, currentPageData: pageData };
  }, [filteredData, currentPage, itemsPerPage]);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        setCurrentPage(page);
      }
    },
    [totalPages, currentPage],
  );

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

  // --- FIX: Updated handleSearch to correctly manage state ---
  const handleSearch = useCallback(({ results, term }) => {
    if (!mountedRef.current) return;

    // Update the search term for messages
    setCurrentSearchTerm(term);

    // Check if the search term is effectively empty
    const isTermEmpty = !term || term.trim() === '';

    // If the term is empty, it means search is effectively cleared
    if (isTermEmpty) {
      // Reset search state
      setSearchResults([]);
      setIsSearchActive(false); // Crucial: Indicate search is not active
    } else {
      // Term is not empty, update results and indicate search is active
      setSearchResults(results);
      setIsSearchActive(true); // Crucial: Indicate search is active
    }

    // Always reset to the first page when search changes
    setCurrentPage(1);
  }, []);
  // --- END FIX ---

  const handleClearSearch = useCallback(() => {
    if (!mountedRef.current) return;
    // These are handled by TopBarSearch calling onSearch({results: [], term: ''})
    // But this callback is still useful for parent components if needed
    // setSearchResults([]);
    // setIsSearchActive(false);
    // setCurrentSearchTerm('');
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback(
    (filterDef) => {
      if (!mountedRef.current) return;
      setActiveFilter(filterDef);
      setCurrentPage(1);
      // Clear search when changing filters is handled by TopBarSearch now
      // because handleSearch will be called with an empty term
    },
    [], // Removed dependencies as clearing is handled by onSearch callback
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

    if (selectedCount === currentPageData.length) {
      setSelectAll(true);
      setIndeterminate(false);
    } else if (selectedCount > 0) {
      setSelectAll(false);
      setIndeterminate(true);
    } else {
      setSelectAll(false);
      setIndeterminate(false);
    }
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
    return value != null ? String(value) : 'N/A';
  }, []);

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
        className={`relative overflow-x-auto border rounded-lg ${
          darkMode
            ? 'border-gray-700 bg-transparent'
            : 'border-gray-200 bg-white'
        }`}
      >
        {loading && activeFilter ? (
          <TableLoadingSkeleton />
        ) : currentPageData.length === 0 ? (
          <InfoMessage
            title="No data available"
            description={
              isSearchActive // Use isSearchActive flag for message
                ? `No results found for "${currentSearchTerm}". Try different search terms.`
                : 'Try adjusting your filters.'
            }
            variant="info"
          />
        ) : (
          <table
            className={`w-full text-sm text-left ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            <thead
              className={`border-b ${
                darkMode
                  ? 'bg-transparent border-gray-700'
                  : 'bg-gray-50 border-gray-200'
              }`}
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
                    {effectiveColumns.map((col) => (
                      <td key={col.key} className="py-2 px-3">
                        {renderCellContent(col, item, idx)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          {showViewDataButton && (
            <Button variant="text" onClick={onViewDataClick}>
              View Data
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
