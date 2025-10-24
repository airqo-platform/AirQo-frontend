'use client';

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import Fuse from 'fuse.js';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Pagination } from '@/shared/components/ui/pagination';
import { SearchField } from '@/shared/components/ui/search-field';
import Checkbox from '@/shared/components/ui/checkbox';
import Dialog from '@/shared/components/ui/dialog';
import {
  AqChevronDown,
  AqChevronUp,
  AqFilterFunnel01,
} from '@airqo/icons-react';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ErrorState } from '@/shared/components/ui/error-state';
import { LoadingState } from '@/shared/components/ui/loading-state';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TableItem {
  id: string | number;
  [key: string]: unknown;
}

interface FilterOption {
  label: string;
  value: string | number | boolean;
}

interface TableFilter {
  key: string;
  placeholder: string;
  options: FilterOption[];
  isMulti?: boolean;
}

interface TableAction {
  label: string;
  value: string;
  handler: (selectedIds: (string | number)[]) => void;
}

interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

interface TableColumn<T = TableItem> {
  key: string;
  label: string | React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: FilterOption[];
  filterMulti?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
}

interface CustomFilterProps {
  options: FilterOption[];
  value: string | number | boolean | (string | number | boolean)[];
  onChange: (value: unknown) => void;
  placeholder: string;
  isMulti?: boolean;
}

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  options?: number[];
}

interface ColumnHeaderFilterProps<T = TableItem> {
  column: TableColumn<T>;
  filterValue: string | number | boolean | (string | number | boolean)[];
  onFilterChange: (value: unknown) => void;
  data: T[];
}

interface MultiSelectTableProps<T = TableItem> {
  title?: string;
  data?: T[];
  columns?: TableColumn<T>[];
  searchable?: boolean;
  filterable?: boolean;
  filters?: TableFilter[];
  pageSize?: number;
  showPagination?: boolean;
  sortable?: boolean;
  className?: string;
  pageSizeOptions?: number[];
  searchableColumns?: string[] | null;
  loading?: boolean;
  error?: string | null;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  onRefresh?: () => void;
  headerComponent?: React.ReactNode;
  multiSelect?: boolean;
  actions?: TableAction[];
  selectedItems?: (string | number)[];
  onSelectedItemsChange?: (selectedIds: (string | number)[]) => void;
  enableColumnFilters?: boolean;
  // Server-side search props
  searchTerm?: string;
  onSearchChange?: (search: string) => void;
}

type FilterValues = Record<
  string,
  string | number | boolean | (string | number | boolean)[] | unknown
>;

// ============================================================================
// COLUMN HEADER FILTER COMPONENT
// ============================================================================

const ColumnHeaderFilter = <T extends TableItem>({
  column,
  filterValue,
  onFilterChange,
  data,
}: ColumnHeaderFilterProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Generate filter options from data if not provided
  const filterOptions = useMemo(() => {
    if (column.filterOptions) {
      return column.filterOptions;
    }

    // Extract unique values from data
    const uniqueValues = new Set<string | number | boolean>();
    data.forEach(item => {
      const value = item[column.key];
      if (value != null && value !== '') {
        uniqueValues.add(value as string | number | boolean);
      }
    });

    return Array.from(uniqueValues)
      .sort()
      .map(value => ({
        label: String(value),
        value: value,
      }));
  }, [column.filterOptions, column.key, data]);

  const isMulti = column.filterMulti ?? true;

  const filteredOptions = useMemo(
    () =>
      filterOptions.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [filterOptions, searchTerm]
  );

  const handleSelect = useCallback(
    (option: FilterOption) => {
      if (isMulti) {
        const currentValues = Array.isArray(filterValue) ? filterValue : [];
        const newValue = currentValues.includes(option.value)
          ? currentValues.filter(v => v !== option.value)
          : [...currentValues, option.value];
        onFilterChange(newValue);
      } else {
        onFilterChange(option.value);
        setIsOpen(false);
      }
    },
    [isMulti, filterValue, onFilterChange]
  );

  const handleSelectAll = useCallback(() => {
    if (isMulti) {
      onFilterChange(filteredOptions.map(opt => opt.value));
    }
  }, [isMulti, filteredOptions, onFilterChange]);

  const handleClear = useCallback(() => {
    onFilterChange(isMulti ? [] : '');
  }, [isMulti, onFilterChange]);

  const isSelected = useCallback(
    (optionValue: string | number | boolean) => {
      if (isMulti) {
        return Array.isArray(filterValue) && filterValue.includes(optionValue);
      }
      return filterValue === optionValue;
    },
    [isMulti, filterValue]
  );

  const activeCount = useMemo(() => {
    if (isMulti && Array.isArray(filterValue)) {
      return filterValue.length;
    }
    return filterValue && filterValue !== '' ? 1 : 0;
  }, [isMulti, filterValue]);

  const hasActiveFilter = activeCount > 0;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className={`ml-1 p-0.5 rounded-md hover:bg-muted transition-colors ${
          hasActiveFilter ? 'text-primary' : 'text-muted-foreground'
        }`}
        aria-label={`Filter ${column.label}`}
      >
        <AqFilterFunnel01 className="w-3.5 h-3.5" />
        {hasActiveFilter && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
            {activeCount}
          </span>
        )}
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Filter ${column.label}`}
        size="md"
        primaryAction={{
          label: hasActiveFilter ? `Apply (${activeCount})` : 'Apply',
          onClick: () => setIsOpen(false),
        }}
        secondaryAction={{
          label: 'Clear',
          onClick: handleClear,
        }}
      >
        <div className="space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md border-input focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground placeholder-muted-foreground"
            />
          </div>

          {/* Actions */}
          {isMulti && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                type="button"
                className="text-xs font-medium text-primary hover:underline"
              >
                Select All
              </button>
              {hasActiveFilter && (
                <button
                  onClick={handleClear}
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Options */}
          <div className="space-y-2 overflow-y-auto max-h-64">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={String(option.value)}
                  onClick={() => handleSelect(option)}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                    isSelected(option.value)
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {isMulti && (
                    <Checkbox
                      checked={isSelected(option.value)}
                      onCheckedChange={() => {}}
                      tabIndex={-1}
                    />
                  )}
                  <span className="flex-1 text-sm">{option.label}</span>
                </div>
              ))
            ) : (
              <div className="py-8 text-sm text-center text-muted-foreground">
                No options found
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
};

// ============================================================================
// CUSTOM FILTER COMPONENT
// ============================================================================

const CustomFilter: React.FC<CustomFilterProps> = ({
  options,
  value,
  onChange,
  placeholder,
  isMulti = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const filteredOptions = useMemo(
    () =>
      options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [options, searchTerm]
  );

  const handleSelect = useCallback(
    (option: FilterOption) => {
      if (isMulti) {
        const currentValues = Array.isArray(value) ? value : [];
        const newValue = currentValues.includes(option.value)
          ? currentValues.filter(v => v !== option.value)
          : [...currentValues, option.value];
        onChange(newValue);
      } else {
        onChange(option.value);
        setIsOpen(false);
      }
    },
    [isMulti, value, onChange]
  );

  const getDisplayValue = useCallback(() => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      return currentValues.length > 0
        ? `${currentValues.length} selected`
        : placeholder;
    }
    const selected = options.find(opt => opt.value === value);
    return selected ? selected.label : placeholder;
  }, [isMulti, value, options, placeholder]);

  const isSelected = useCallback(
    (optionValue: string | number | boolean) => {
      if (isMulti) {
        return Array.isArray(value) && value.includes(optionValue);
      }
      return value === optionValue;
    },
    [isMulti, value]
  );

  return (
    <div className="relative" ref={filterRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="w-full px-3 py-2 text-sm text-left bg-background border rounded-md shadow-sm border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
      >
        <span className="block truncate">{getDisplayValue()}</span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className="w-5 h-5 text-muted-foreground"
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
        <div className="absolute z-10 w-full mt-1 border rounded-md shadow-lg bg-popover border-border">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded border-input focus:outline-none focus:ring-1 focus:ring-ring bg-background text-foreground placeholder-muted-foreground"
            />
          </div>
          <div className="overflow-auto max-h-60">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={String(option.value)}
                  onClick={() => handleSelect(option)}
                  className={`px-3 py-2 cursor-pointer text-sm hover:bg-accent ${isSelected(option.value) ? 'bg-accent text-accent-foreground' : 'text-foreground'}`}
                >
                  {isMulti && (
                    <Checkbox
                      checked={isSelected(option.value)}
                      onCheckedChange={() => {}}
                      className="mr-2"
                      tabIndex={-1}
                    />
                  )}
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-center text-muted-foreground">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PAGE SIZE SELECTOR COMPONENT
// ============================================================================

const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({
  pageSize,
  onPageSizeChange,
  options = [5, 6, 10, 20, 50, 100],
}) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <span>Show</span>
      <select
        value={pageSize}
        onChange={e => onPageSizeChange(parseInt(e.target.value, 10))}
        className="px-2 py-1 border rounded border-input focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring bg-background text-foreground"
      >
        {options.map(size => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <span>entries</span>
    </div>
  );
};

// ============================================================================
// MAIN MULTI-SELECT TABLE COMPONENT
// ============================================================================

// Stable empty arrays for default props
const EMPTY_DATA: unknown[] = [];
const EMPTY_COLUMNS: unknown[] = [];
const EMPTY_FILTERS: unknown[] = [];

const MultiSelectTable = <T extends TableItem>({
  title = 'Table',
  data = EMPTY_DATA as T[],
  columns = EMPTY_COLUMNS as TableColumn<T>[],
  searchable = true,
  filterable = true,
  filters = EMPTY_FILTERS as TableFilter[],
  pageSize = 10,
  showPagination = true,
  sortable = true,
  className = '',
  pageSizeOptions = [5, 6, 10, 20, 50, 100],
  searchableColumns = null,
  loading = false,
  error = null,
  loadingComponent = null,
  errorComponent = null,
  onRefresh,
  headerComponent,
  multiSelect = false,
  actions = [],
  selectedItems: controlledSelectedItems,
  onSelectedItemsChange,
  enableColumnFilters = false,
  // Server-side search props
  searchTerm: controlledSearchTerm,
  onSearchChange,
}: MultiSelectTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc',
  });
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [columnFilterValues, setColumnFilterValues] = useState<FilterValues>(
    {}
  );
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [internalSelectedItems, setInternalSelectedItems] = useState<
    (string | number)[]
  >([]);
  const [selectedAction, setSelectedAction] = useState('');

  // Determine if we're using controlled mode or internal mode
  const isControlledSelection =
    controlledSelectedItems !== undefined &&
    onSelectedItemsChange !== undefined;
  const isControlledSearch = onSearchChange !== undefined;

  const selectedItems = isControlledSelection
    ? controlledSelectedItems
    : internalSelectedItems;

  const searchTerm = isControlledSearch
    ? controlledSearchTerm || ''
    : internalSearchTerm;
  const setSearchTerm = isControlledSearch
    ? (value: string) => onSearchChange?.(value)
    : setInternalSearchTerm;

  // Initialize internal selected items only if not controlled
  useEffect(() => {
    if (!isControlledSelection && controlledSelectedItems) {
      setInternalSelectedItems(controlledSelectedItems);
    }
  }, [controlledSelectedItems, isControlledSelection]);

  // Initialize filter values
  useEffect(() => {
    const initialFilters: FilterValues = {};
    filters.forEach(filter => {
      initialFilters[filter.key] = filter.isMulti ? [] : '';
    });
    setFilterValues(initialFilters);
  }, [filters]);

  // Initialize column filter values
  useEffect(() => {
    if (enableColumnFilters) {
      const initialColumnFilters: FilterValues = {};
      columns.forEach(column => {
        if (column.filterable) {
          initialColumnFilters[column.key] =
            column.filterMulti !== false ? [] : '';
        }
      });
      setColumnFilterValues(initialColumnFilters);
    }
  }, [columns, enableColumnFilters]);

  // Extract searchable string from item
  const getSearchableString = useCallback(
    (item: T, key: string): string => {
      const col = columns.find(c => c.key === key);
      const value = item[key];

      if (col?.render) {
        try {
          const rendered = col.render(value, item);

          if (typeof rendered === 'string' || typeof rendered === 'number') {
            return String(rendered);
          }

          if (rendered && typeof rendered === 'object' && 'props' in rendered) {
            const props = (rendered as { props: { children?: unknown } }).props;
            if (typeof props.children === 'string') {
              return props.children;
            }
            if (Array.isArray(props.children)) {
              return props.children
                .map((child: unknown) =>
                  typeof child === 'string' ? child : ''
                )
                .join(' ');
            }
          }
        } catch {
          // Fallback to raw value on error
        }
      }

      if (value && typeof value === 'object') {
        return JSON.stringify(value);
      }

      return value == null ? '' : String(value);
    },
    [columns]
  );

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply regular filters first
    Object.entries(filterValues).forEach(([key, value]) => {
      if (
        value != null &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        result = result.filter(item => {
          if (Array.isArray(value)) {
            return value.includes(item[key]);
          }
          return String(item[key]) === String(value);
        });
      }
    });

    // Apply column filters
    if (enableColumnFilters) {
      Object.entries(columnFilterValues).forEach(([key, value]) => {
        if (
          value != null &&
          value !== '' &&
          !(Array.isArray(value) && value.length === 0)
        ) {
          result = result.filter(item => {
            if (Array.isArray(value)) {
              return value.includes(item[key]);
            }
            return String(item[key]) === String(value);
          });
        }
      });
    }

    // Apply search if search term exists
    if (searchTerm?.trim()) {
      const fuseKeys =
        Array.isArray(searchableColumns) && searchableColumns.length > 0
          ? searchableColumns
          : columns
              .map(col => col.key)
              .filter(key =>
                result.some(item => {
                  const val = item[key];
                  return val != null && String(val).trim() !== '';
                })
              );

      if (fuseKeys.length > 0) {
        const fuseData = result.map(item => {
          const searchableItem: Record<string, string> = {};
          fuseKeys.forEach(key => {
            searchableItem[key] = getSearchableString(item, key);
          });
          return searchableItem;
        });

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

        result = fuseResults
          .filter(res =>
            searchTerm.length === 1 ? (res.score ?? 1) <= 0.8 : true
          )
          .map(res => result[res.refIndex]);
      }
    }

    return result;
  }, [
    data,
    searchTerm,
    filterValues,
    columnFilterValues,
    columns,
    searchableColumns,
    getSearchableString,
    enableColumnFilters,
  ]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValues, columnFilterValues]);

  // Handlers
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setCurrentPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback(
    (key: string) => {
      if (!sortable) return;
      setSortConfig(prev => ({
        key,
        direction:
          prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
      }));
    },
    [sortable]
  );

  const handleFilterChange = useCallback((key: string, value: unknown) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleColumnFilterChange = useCallback(
    (key: string, value: unknown) => {
      setColumnFilterValues(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleActionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedAction(e.target.value);
    },
    []
  );

  const handleActionSubmit = useCallback(() => {
    if (selectedAction) {
      const action = actions.find(a => a.value === selectedAction);
      action?.handler(selectedItems);
      setSelectedAction('');
    }
  }, [selectedAction, actions, selectedItems]);

  // Computed values for multi-select
  // For server-side pagination, we work with the current data directly
  // For client-side pagination, we slice the sorted data
  const paginatedData = useMemo(() => {
    // If we have server-side pagination (controlled by parent), use data directly
    if (isControlledSearch || onSearchChange !== undefined) {
      return data; // Server already handles pagination
    }
    // Otherwise, handle client-side pagination
    const start = (currentPage - 1) * currentPageSize;
    return sortedData.slice(start, start + currentPageSize);
  }, [
    data,
    sortedData,
    currentPage,
    currentPageSize,
    isControlledSearch,
    onSearchChange,
  ]);

  // Calculate selection state for current page
  const currentPageItems = paginatedData;
  const currentPageIds = useMemo(
    () => currentPageItems.map(item => item.id),
    [currentPageItems]
  );

  const isAllSelectedOnPage = useMemo(
    () =>
      currentPageItems.length > 0 &&
      currentPageIds.every(id => selectedItems.includes(id)),
    [currentPageItems.length, currentPageIds, selectedItems]
  );

  const isIndeterminate = useMemo(
    () =>
      currentPageItems.length > 0 &&
      currentPageIds.some(id => selectedItems.includes(id)) &&
      !isAllSelectedOnPage,
    [
      currentPageItems.length,
      currentPageIds,
      selectedItems,
      isAllSelectedOnPage,
    ]
  );

  // Multi-select handlers
  const handleSelectAll = useCallback(
    (isChecked: boolean) => {
      if (isControlledSelection) {
        let updated: (string | number)[];
        if (isChecked) {
          // Add all current page items that aren't already selected
          const newItems = currentPageIds.filter(
            id => !selectedItems.includes(id)
          );
          updated = [...selectedItems, ...newItems];
        } else {
          // Remove all current page items from selection
          updated = selectedItems.filter(id => !currentPageIds.includes(id));
        }
        onSelectedItemsChange?.(updated);
      } else {
        setInternalSelectedItems(prev => {
          let updated: (string | number)[];
          if (isChecked) {
            const newItems = currentPageIds.filter(id => !prev.includes(id));
            updated = [...prev, ...newItems];
          } else {
            updated = prev.filter(id => !currentPageIds.includes(id));
          }
          return updated;
        });
      }
    },
    [
      currentPageIds,
      isControlledSelection,
      selectedItems,
      onSelectedItemsChange,
    ]
  );

  const handleSelectItem = useCallback(
    (itemId: string | number, isChecked: boolean) => {
      if (isControlledSelection) {
        const updated = isChecked
          ? [...selectedItems, itemId]
          : selectedItems.filter(id => id !== itemId);
        onSelectedItemsChange?.(updated);
      } else {
        setInternalSelectedItems(prev => {
          const updated = isChecked
            ? [...prev, itemId]
            : prev.filter(id => id !== itemId);
          return updated;
        });
      }
    },
    [isControlledSelection, selectedItems, onSelectedItemsChange]
  );

  // Sort icon
  const getSortIcon = useCallback(
    (key: string) => {
      if (sortConfig.key !== key) {
        return null;
      }
      return sortConfig.direction === 'asc' ? (
        <AqChevronUp className="w-3 h-3 text-primary" />
      ) : (
        <AqChevronDown className="w-3 h-3 text-primary" />
      );
    },
    [sortConfig]
  );

  // Render cell
  const renderCell = useCallback((item: T, column: TableColumn<T>) => {
    if (column.render) {
      return column.render(item[column.key], item);
    }
    const value = item[column.key];
    return value == null ? '' : String(value);
  }, []);

  // Display columns with multi-select checkbox
  const displayColumns = useMemo(() => {
    const cols = [...columns];

    if (multiSelect) {
      cols.unshift({
        key: 'checkbox',
        label: (
          <Checkbox
            checked={isAllSelectedOnPage}
            indeterminate={isIndeterminate}
            onCheckedChange={(checked: boolean) => handleSelectAll(checked)}
            aria-label="Select all on page"
          />
        ),
        render: (_value: unknown, item: T) => (
          <Checkbox
            checked={selectedItems.includes(item.id)}
            onCheckedChange={(checked: boolean) =>
              handleSelectItem(item.id, checked)
            }
            aria-label={`Select item ${item.id}`}
          />
        ),
        sortable: false,
        filterable: false,
      });
    }

    return cols;
  }, [
    columns,
    multiSelect,
    isAllSelectedOnPage,
    isIndeterminate,
    selectedItems,
    handleSelectAll,
    handleSelectItem,
  ]);

  const hasActiveFilters = useMemo(
    () =>
      Object.values(filterValues).some(
        v => v != null && (Array.isArray(v) ? v.length > 0 : v !== '')
      ),
    [filterValues]
  );

  const hasActiveColumnFilters = useMemo(
    () =>
      enableColumnFilters &&
      Object.values(columnFilterValues).some(
        v => v != null && (Array.isArray(v) ? v.length > 0 : v !== '')
      ),
    [columnFilterValues, enableColumnFilters]
  );

  const totalPages = Math.ceil(sortedData.length / currentPageSize);

  return (
    <Card
      className={`p-0 shadow border border-border w-full overflow-hidden ${className}`}
    >
      {/* Header 2 */}
      {headerComponent && (
        <div className="flex justify-end p-2 border-b border-border pb-4">
          {headerComponent}
        </div>
      )}

      {/* Header 2 */}
      <div
        className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-card border-b border-border ${headerComponent ? '' : 'rounded-t-md'}`}
      >
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base sm:text-lg text-foreground truncate">
              {title}
            </h2>
            <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center">
              {searchable && (
                <SearchField
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.target.value)
                  }
                  onClear={() => setSearchTerm('')}
                  className="w-full sm:w-64"
                />
              )}
              {filterable && filters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.map(filter => (
                    <div
                      key={filter.key}
                      className="min-w-0 flex-1 sm:min-w-[150px] sm:flex-none sm:w-auto"
                    >
                      <CustomFilter
                        options={filter.options}
                        value={
                          (filterValues[filter.key] as
                            | string
                            | number
                            | boolean
                            | (string | number | boolean)[]) ||
                          (filter.isMulti ? [] : '')
                        }
                        onChange={value =>
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
      </div>

      {/* Multi-Select Action Bar */}
      {multiSelect && selectedItems.length > 0 && (
        <div className="flex flex-col gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-b bg-primary/10 dark:bg-primary/20 border-primary/20 dark:border-primary/30 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs sm:text-sm font-medium text-primary">
            {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}{' '}
            selected
          </div>
          {actions.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={selectedAction}
                onChange={handleActionChange}
                className="border border-input rounded-md px-2 sm:px-3 py-1 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring bg-background text-foreground text-xs sm:text-sm w-full sm:w-auto"
              >
                <option value="">Select Action</option>
                {actions.map(action => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleActionSubmit}
                disabled={!selectedAction}
                size="sm"
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                Apply
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
        <div className="min-w-full">
          {error ? (
            (errorComponent ?? (
              <ErrorState
                title="Error loading data"
                description={error}
                className="rounded-none border-0 bg-transparent"
                retryAction={
                  onRefresh
                    ? {
                        label: 'Try Again',
                        onClick: onRefresh,
                      }
                    : undefined
                }
              />
            ))
          ) : loading ? (
            (loadingComponent ?? (
              <LoadingState
                text="Loading data..."
                className="w-full h-64 border border-border rounded-none bg-muted/50"
              />
            ))
          ) : paginatedData.length === 0 ? (
            <EmptyState
              title={
                searchTerm || hasActiveFilters || hasActiveColumnFilters
                  ? 'No matching results found'
                  : 'No data available'
              }
              description={
                searchTerm || hasActiveFilters || hasActiveColumnFilters
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : 'There is no data to display at the moment.'
              }
              className="min-h-[300px] border-0 bg-transparent"
            />
          ) : (
            <table className="w-full bg-card">
              <thead className="border-b bg-muted border-border">
                <tr>
                  {displayColumns.map(column => (
                    <th
                      key={column.key}
                      className={`py-2 sm:py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground ${
                        column.key === 'checkbox'
                          ? 'w-8 sm:w-12 px-1 sm:px-2 pl-2 sm:pl-4'
                          : 'px-2 sm:px-4 md:px-6 min-w-0'
                      }`}
                    >
                      <div className="flex items-center space-x-1 min-w-0">
                        <span
                          className={`truncate ${
                            sortable && column.sortable !== false
                              ? 'cursor-pointer hover:text-foreground transition-colors'
                              : ''
                          }`}
                          onClick={() =>
                            sortable &&
                            column.sortable !== false &&
                            handleSort(column.key)
                          }
                          title={
                            typeof column.label === 'string' ? column.label : ''
                          }
                        >
                          {column.label}
                        </span>
                        <div className="flex items-center gap-0.5 relative flex-shrink-0">
                          {sortable &&
                            column.sortable !== false &&
                            getSortIcon(column.key)}
                          {enableColumnFilters &&
                            column.filterable !== false &&
                            column.key !== 'checkbox' && (
                              <ColumnHeaderFilter
                                column={column}
                                filterValue={
                                  (columnFilterValues[column.key] as
                                    | string
                                    | number
                                    | boolean
                                    | (string | number | boolean)[]) ||
                                  (column.filterMulti !== false ? [] : '')
                                }
                                onFilterChange={value =>
                                  handleColumnFilterChange(column.key, value)
                                }
                                data={data}
                              />
                            )}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {paginatedData.map((item, index) => (
                  <tr
                    key={item.id ?? index}
                    className="transition-colors hover:bg-muted/50"
                  >
                    {displayColumns.map(column => (
                      <td
                        key={column.key}
                        className={`py-2 sm:py-4 text-sm text-foreground ${
                          column.key === 'checkbox'
                            ? 'w-8 sm:w-12 px-1 sm:px-2 pl-2 sm:pl-4'
                            : 'px-2 sm:px-4 md:px-6 min-w-0 max-w-0'
                        }`}
                      >
                        <div
                          className={
                            column.key === 'checkbox' ? '' : 'truncate'
                          }
                          title={
                            column.key === 'checkbox'
                              ? ''
                              : String(renderCell(item, column))
                          }
                        >
                          {renderCell(item, column)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && showPagination && sortedData.length > 0 && (
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-border bg-muted">
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-4 order-2 sm:order-1">
              <PageSizeSelector
                pageSize={currentPageSize}
                onPageSizeChange={handlePageSizeChange}
                options={pageSizeOptions}
              />
              <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Showing{' '}
                {Math.min(
                  (currentPage - 1) * currentPageSize + 1,
                  sortedData.length
                )}{' '}
                to {Math.min(currentPage * currentPageSize, sortedData.length)}{' '}
                of {sortedData.length} results
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center sm:justify-end order-1 sm:order-2">
                <Pagination
                  currentPage={currentPage}
                  pageSize={currentPageSize}
                  totalItems={sortedData.length}
                  onPrevClick={() =>
                    setCurrentPage(Math.max(1, currentPage - 1))
                  }
                  onNextClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export { MultiSelectTable };
