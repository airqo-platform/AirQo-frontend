"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
  ReactElement,
} from "react";
import Fuse from "fuse.js";
import {
  AqSearchSm,
  AqChevronDown,
  AqChevronUp,
  AqChevronLeft,
  AqChevronRight,
  AqFilterLines,
  AqXClose,
} from "@airqo/icons-react";
import { Loader2 } from "lucide-react";

// --- Type Definitions ---
interface FilterOption {
  label: string;
  value: string | number | boolean;
}

interface FilterConfig {
  key: string;
  options: FilterOption[];
  placeholder: string;
  isMulti?: boolean;
}

export type TableColumn<T, K extends keyof T = keyof T> = {
  key: K;
  title?: string;
  label?: React.ReactNode;
  render: (value: T[keyof T], item: T) => React.ReactNode;
  sortable?: boolean;
};

interface TableAction {
  label: string;
  value: string;
  handler: (selectedIds: (string | number)[]) => void;
}

export type TableItem<T = unknown> = {
  id: string | number;
} & Record<string, T>;

interface SortConfig {
  key: string | null;
  direction: "asc" | "desc";
}

// --- CustomFilter Component ---
interface CustomFilterProps {
  options: FilterOption[];
  value: string | number | boolean | (string | number | boolean)[];
  onChange: (
    value: string | number | boolean | (string | number | boolean)[]
  ) => void;
  placeholder: string;
  isMulti?: boolean;
}

const CustomFilter: React.FC<CustomFilterProps> = ({
  options,
  value,
  onChange,
  placeholder,
  isMulti = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
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
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [options, searchTerm]
  );

  const handleSelect = useCallback(
    (option: FilterOption) => {
      if (isMulti) {
        const currentValue = Array.isArray(value) ? value : [];
        const newValue = currentValue.includes(option.value)
          ? currentValue.filter((v) => v !== option.value)
          : [...currentValue, option.value];
        onChange(newValue);
      } else {
        onChange(option.value);
        setIsOpen(false);
      }
    },
    [isMulti, value, onChange]
  );

  const getDisplayValue = useCallback((): string => {
    if (isMulti) {
      const arrayValue = Array.isArray(value) ? value : [];
      return arrayValue.length > 0
        ? `${arrayValue.length} selected`
        : placeholder;
    }
    const selected = options.find((opt) => opt.value === value);
    return selected ? selected.label : placeholder;
  }, [isMulti, value, options, placeholder]);

  return (
    <div className="relative" ref={filterRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white dark:bg-[#1d1f20] border border-primary/30 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm text-gray-900 dark:text-gray-100"
        type="button"
      >
        <span className="block truncate">{getDisplayValue()}</span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400 dark:text-gray-300"
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
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#1d1f20] border border-gray-300 dark:border-gray-700 rounded-md shadow-lg">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-primary/30 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-primary bg-white dark:bg-[#232425] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <div className="max-h-60 overflow-auto">
            {filteredOptions.map((option) => (
              <div
                key={String(option.value)}
                onClick={() => handleSelect(option)}
                className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  (
                    isMulti
                      ? Array.isArray(value) && value.includes(option.value)
                      : value === option.value
                  )
                    ? "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {isMulti && (
                  <input
                    type="checkbox"
                    checked={
                      Array.isArray(value) && value.includes(option.value)
                    }
                    onChange={() => {}} // Handled by parent div click
                    className="mr-2 text-primary focus:ring-primary"
                  />
                )}
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- PageSizeSelector Component ---
interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  options?: number[];
}

const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({
  pageSize,
  onPageSizeChange,
  options = [5, 10, 20, 50, 100],
}) => {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
      <span>Show</span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
        className="border border-primary/30 dark:border-primary/40 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        {options.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
      <span>entries</span>
    </div>
  );
};

// --- TableHeader Component ---
type FilterValue = string | number | boolean | (string | number | boolean)[];

interface TableHeaderProps<T> {
  title: string;
  searchable: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClearSearch: () => void;
  filterable: boolean;
  filters: FilterConfig[];
  filterValues: Record<string, FilterValue>;
  onFilterChange: (key: keyof T, value: FilterValue) => void;
}

const TableHeader = <T extends TableItem>({
  title,
  searchable,
  searchTerm,
  onSearchChange,
  onClearSearch,
  filterable,
  filters,
  filterValues,
  onFilterChange,
}: TableHeaderProps<T>) => {
  return (
    <div className="px-6 py-4 border-b bg-white border-gray-200 dark:border-gray-600 dark:bg-[#1d1f20]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {searchable && (
            <div className="relative">
              <AqSearchSm className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60 dark:text-primary/80 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-10 py-2 border border-primary/30 dark:border-primary/40 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm w-full sm:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
              {searchTerm && (
                <button
                  onClick={onClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
                  type="button"
                >
                  <AqXClose className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          {filterable && filters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <div key={filter.key} className="min-w-[150px]">
                  <CustomFilter
                    options={filter.options}
                    value={
                      filterValues[filter.key] || (filter.isMulti ? [] : "")
                    }
                    onChange={(value) => onFilterChange(filter.key, value)}
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
  );
};

// --- MultiSelectActionBar Component ---
interface MultiSelectActionBarProps {
  selectedCount: number;
  actions: TableAction[];
  selectedAction: string;
  onActionChange: (action: string) => void;
  onActionSubmit: () => void;
}

const MultiSelectActionBar: React.FC<MultiSelectActionBarProps> = ({
  selectedCount,
  actions,
  selectedAction,
  onActionChange,
  onActionSubmit,
}) => {
  return (
    <div className="px-6 py-3 bg-primary/10 dark:bg-primary/20 border-b border-primary/20 dark:border-primary/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="text-sm text-primary dark:text-primary">
        {selectedCount} item(s) selected
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <select
          value={selectedAction}
          onChange={(e) => onActionChange(e.target.value)}
          className="border border-primary/30 dark:border-primary/40 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
        >
          <option value="">Select Action</option>
          {actions.map((action) => (
            <option key={action.value} value={action.value}>
              {action.label}
            </option>
          ))}
        </select>
        <button
          onClick={onActionSubmit}
          disabled={!selectedAction}
          className={`px-3 py-1 text-sm rounded-md border transition-colors ${
            selectedAction
              ? "bg-primary text-white border-primary hover:bg-primary/90"
              : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed"
          }`}
          type="button"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

// --- Pagination Component ---
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}) => {
  const generatePageNumbers = useCallback((): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#1d1f20]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <PageSizeSelector
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
            options={pageSizeOptions}
          />
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to{" "}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
            results
          </div>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-primary/30 dark:border-primary/40 rounded-md hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary dark:hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-primary/30 dark:disabled:hover:border-primary/40 flex items-center space-x-1 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              type="button"
            >
              <AqChevronLeft className="w-3 h-3" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            <div className="flex items-center space-x-1">
              {generatePageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === "number" && onPageChange(page)}
                  disabled={typeof page !== "number"}
                  className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                    page === currentPage
                      ? "bg-primary text-white border-primary"
                      : typeof page === "number"
                      ? "border-primary/30 dark:border-primary/40 hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary dark:hover:border-primary text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900"
                      : "border-transparent cursor-default bg-transparent dark:bg-transparent text-gray-400 dark:text-gray-500"
                  }`}
                  type="button"
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() =>
                onPageChange(Math.min(currentPage + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-primary/30 dark:border-primary/40 rounded-md hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary dark:hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-primary/30 dark:disabled:hover:border-primary/40 flex items-center space-x-1 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              type="button"
            >
              <span className="hidden sm:inline">Next</span>
              <AqChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main ReusableTable Component ---
interface ReusableTableProps<T extends TableItem> {
  title?: string;
  data?: T[];
  columns?: TableColumn<T>[];
  searchable?: boolean;
  filterable?: boolean;
  filters?: FilterConfig[];
  pageSize?: number;
  showPagination?: boolean;
  sortable?: boolean;
  pageSizeOptions?: number[];
  searchableColumns?: string[] | null;
  loading?: boolean;
  loadingComponent?: ReactNode;
  multiSelect?: boolean;
  actions?: TableAction[];
  onSelectedItemsChange?: (selectedIds: (string | number)[]) => void;
  onRowClick?: (item: unknown) => void;
  emptyState?: string | React.ReactNode;
}

const ReusableTable = <T extends TableItem>({
  title = "Table",
  data = [],
  columns = [],
  searchable = true,
  filterable = true,
  filters = [],
  pageSize = 10,
  showPagination = true,
  sortable = true,
  pageSizeOptions = [5, 10, 20, 50, 100],
  searchableColumns = null,
  loading = false,
  loadingComponent = null,
  multiSelect = false,
  actions = [],
  onSelectedItemsChange,
  onRowClick,
}: ReusableTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });
  const [filterValues, setFilterValues] = useState<Record<string, FilterValue>>(
    {}
  );
  const [currentPageSize, setCurrentPageSize] = useState<number>(pageSize);
  const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>("");

  // Initialize filter values
  useEffect(() => {
    const initialFilters: Record<string, FilterValue> = {};
    filters.forEach((filter) => {
      initialFilters[filter.key] = filter.isMulti ? [] : "";
    });
    setFilterValues(initialFilters);
  }, [JSON.stringify(filters)]);

  // Filter and search data with improved Fuse.js
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply filters FIRST
    Object.entries(filterValues).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        result = result.filter((item) => {
          if (Array.isArray(value)) {
            const itemValue = item[key];
            if (
              typeof itemValue === "string" ||
              typeof itemValue === "number" ||
              typeof itemValue === "boolean"
            ) {
              return value.includes(itemValue);
            }
            return false; // fallback if itemValue is not a primitive
          }

          if (
            typeof value === "boolean" ||
            value === "true" ||
            value === "false"
          ) {
            return String(item[key]) === String(value);
          }
          return item[key] === value;
        });
      }
    });

    // Determine searchable keys AFTER filtering
    let fuseKeys: string[];
    if (Array.isArray(searchableColumns) && searchableColumns.length > 0) {
      fuseKeys = searchableColumns;
    } else {
      const allKeys = columns.map((col) => col.key);
      const keysWithData = allKeys.filter((key) =>
        result.some(
          (item) =>
            item[key] !== null &&
            item[key] !== undefined &&
            String(item[key]).trim() !== ""
        )
      );
      fuseKeys = (keysWithData.length > 0 ? keysWithData : allKeys) as Extract<
        keyof T,
        string
      >[];
    }

    // Process data for Fuse.js search ONLY if there's a search term
    if (searchTerm && searchTerm.trim() && fuseKeys.length > 0) {
      const getSearchableString = (item: T, key: string): string => {
        const col = columns.find((c) => c.key === key);
        const value = item[key];

        // If column has a render function, attempt to get a searchable string from it
        if (col && typeof col.render === "function") {
          try {
            const key = col.key;
            const value = item[key as typeof col.key] as T[typeof col.key];
            const rendered = col.render(value, item);

            // If render returns a simple string or number, use it
            if (typeof rendered === "string") return rendered;
            if (typeof rendered === "number") return String(rendered);
            // If it returns JSX, try to extract text content
            if (React.isValidElement(rendered)) {
              const props = (rendered as ReactElement).props;
              if (typeof props.children === "string") {
                return props.children;
              }
              if (Array.isArray(props.children)) {
                return props.children
                  .map((child: unknown) =>
                    typeof child === "string" ? child : ""
                  )
                  .join(" ");
              }
              // Fallback to raw value if complex JSX
              return value === null || value === undefined ? "" : String(value);
            }
          } catch {
            // If render throws or is complex, fallback to raw value stringification
          }
        }

        // Default stringification for non-rendered or failed render cases
        if (value && typeof value === "object") {
          return JSON.stringify(value);
        }
        return value === null || value === undefined ? "" : String(value);
      };

      // Prepare the data specifically for Fuse.js
      const fuseData = result.map((item) => {
        const obj: Record<string, string> = {};
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

      // Map search results back to ORIGINAL data items
      if (searchTerm.length === 1) {
        result = fuseResults
          .filter((res) => (res.score ?? 1) <= 0.8)
          .map((searchResult) => result[searchResult.refIndex]);
      } else {
        result = fuseResults.map(
          (searchResult) => result[searchResult.refIndex]
        );
      }
    }

    return result;
  }, [data, searchTerm, filterValues, columns, searchableColumns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      if (aStr < bStr) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aStr > bStr) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * currentPageSize;
    const end = start + currentPageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, currentPageSize]);

  const totalPages = Math.ceil(sortedData.length / currentPageSize);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValues]);

  // Reset to first page when page size changes
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setCurrentPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback(
    (key: string) => {
      if (!sortable) return;
      setSortConfig((prev) => ({
        key,
        direction:
          prev.key === key && prev.direction === "asc" ? "desc" : "asc",
      }));
    },
    [sortable]
  );

  const handleFilterChange = useCallback(
    (
      key: string,
      value: string | number | boolean | (string | number | boolean)[]
    ) => {
      setFilterValues((prev) => ({
        ...prev,
        [key]: value,
      }));
      setCurrentPage(1);
    },
    []
  );

  const getSortIcon = useCallback(
    (key: string): ReactNode => {
      if (sortConfig.key !== key)
        return (
          <AqFilterLines className="w-3 h-3 text-gray-400 dark:text-gray-300" />
        );
      return sortConfig.direction === "asc" ? (
        <AqChevronUp className="w-3 h-3 text-primary" />
      ) : (
        <AqChevronDown className="w-3 h-3 text-primary" />
      );
    },
    [sortConfig]
  );

  const renderCell = useCallback(
    (item: T, column: TableColumn<T>): ReactNode => {
      if (column.render) {
        return column.render(item[column.key], item);
      }
      const value = item[column.key];
      return value === null || value === undefined ? "" : String(value);
    },
    []
  );

  // Multi-Select Logic
  const handleSelectAll = useCallback(
    (isChecked: boolean) => {
      if (isChecked) {
        const currentPageIds = paginatedData.map((item) => item.id);
        setSelectedItems((prevSelected) => {
          const newItems = currentPageIds.filter(
            (id) => !prevSelected.includes(id)
          );
          const updatedSelected = [...prevSelected, ...newItems];
          onSelectedItemsChange?.(updatedSelected);
          return updatedSelected;
        });
      } else {
        const currentPageIds = paginatedData.map((item) => item.id);
        setSelectedItems((prevSelected) => {
          const updatedSelected = prevSelected.filter(
            (id) => !currentPageIds.includes(id)
          );
          onSelectedItemsChange?.(updatedSelected);
          return updatedSelected;
        });
      }
    },
    [paginatedData, onSelectedItemsChange]
  );

  const handleSelectItem = useCallback(
    (itemId: string | number, isChecked: boolean) => {
      if (isChecked) {
        setSelectedItems((prevSelected) => {
          const updatedSelected = [...prevSelected, itemId];
          onSelectedItemsChange?.(updatedSelected);
          return updatedSelected;
        });
      } else {
        setSelectedItems((prevSelected) => {
          const updatedSelected = prevSelected.filter((id) => id !== itemId);
          onSelectedItemsChange?.(updatedSelected);
          return updatedSelected;
        });
      }
    },
    [onSelectedItemsChange]
  );

  const isAllSelectedOnPage = useMemo(
    () =>
      paginatedData.length > 0 &&
      paginatedData.every((item) => selectedItems.includes(item.id)),
    [paginatedData, selectedItems]
  );

  const isIndeterminate = useMemo(
    () =>
      paginatedData.length > 0 &&
      paginatedData.some((item) => selectedItems.includes(item.id)) &&
      !isAllSelectedOnPage,
    [paginatedData, selectedItems, isAllSelectedOnPage]
  );

  const isAnySelected = selectedItems.length > 0;

  const handleActionChange = useCallback((action: string) => {
    setSelectedAction(action);
  }, []);

  const handleActionSubmit = useCallback(() => {
    if (selectedAction && actions.length > 0) {
      const action = actions.find((a) => a.value === selectedAction);
      if (action && typeof action.handler === "function") {
        action.handler(selectedItems);
      }
    }
    setSelectedAction("");
  }, [selectedAction, actions, selectedItems]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Determine columns to display
  const displayColumns = useMemo((): TableColumn<T>[] => {
    const cols = [...columns];
    if (multiSelect) {
      cols.unshift({
        key: "checkbox",
        label: (
          <input
            type="checkbox"
            checked={isAllSelectedOnPage}
            ref={(input) => {
              if (input) input.indeterminate = isIndeterminate;
            }}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="rounded text-primary focus:ring-primary"
          />
        ),
        render: (_value: T[keyof T], item: T) => (
          <input
            type="checkbox"
            checked={selectedItems.includes(item.id)}
            onChange={(e) => handleSelectItem(item.id, e.target.checked)}
            className="rounded text-primary focus:ring-primary"
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
    selectedItems,
    handleSelectAll,
    handleSelectItem,
  ]);

  return (
    <div className="overflow-hidden shadow p-0 rounded-lg w-full bg-[#E9F7EF]">
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
      {multiSelect && isAnySelected && (
        <MultiSelectActionBar
          selectedCount={selectedItems.length}
          actions={actions}
          selectedAction={selectedAction}
          onActionChange={handleActionChange}
          onActionSubmit={handleActionSubmit}
        />
      )}

      {/* Table or Loading */}
      <div className="overflow-x-auto">
        {loading ? (
          loadingComponent ? (
            loadingComponent
          ) : (
            <div className="w-full py-12 flex justify-center items-center">
              <Loader2 size={30} className="animate-spin" />
            </div>
          )
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-gray-200 dark:border-gray-600 border-b dark:bg-[#1d1f20]">
              <tr>
                {displayColumns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                      sortable && column.sortable !== false
                        ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        : ""
                    }`}
                    onClick={() =>
                      sortable &&
                      column.sortable !== false &&
                      handleSort(String(column.key))
                    }
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {sortable &&
                        column.sortable !== false &&
                        getSortIcon(String(column.key))}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1d1f20] divide-y divide-gray-200 dark:divide-gray-800">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr
                    key={item.id ?? index}
                    onClick={() => {
                      if (onRowClick) {
                        onRowClick(item);
                      }
                    }}
                    className={`hover:bg-primary/5 dark:hover:bg-primary/20 ${
                      onRowClick && "cursor-pointer"
                    }`}
                  >
                    {displayColumns.map((column) => (
                      <td
                        key={String(column.key)}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                      >
                        {renderCell(item, column)}
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
                    {searchTerm ||
                    Object.values(filterValues).some(
                      (v) => v && (Array.isArray(v) ? v.length > 0 : v !== "")
                    )
                      ? "No matching results found"
                      : "No data available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && showPagination && sortedData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={currentPageSize}
          totalItems={sortedData.length}
          pageSizeOptions={pageSizeOptions}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
};

export default ReusableTable;
