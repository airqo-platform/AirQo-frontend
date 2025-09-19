"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
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
import SelectField from "@/components/ui/select-field";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ReusableButton from "@/components/shared/button/ReusableButton";

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
  className?: string;
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
                className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${(
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
                    onChange={() => { }} // Handled by parent div click
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
        <SelectField
          value={selectedAction}
          onChange={(e) => onActionChange(String(e.target.value))}
          placeholder="Select Action"
          className="min-w-[12rem]"
        >
          {actions.map((action) => (
            <option key={action.value} value={action.value}>
              {action.label}
            </option>
          ))}
        </SelectField>
        <ReusableButton
          onClick={onActionSubmit}
          disabled={!selectedAction}
          variant="filled"
        >
          Apply
        </ReusableButton>
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
                  className={`px-3 py-1 text-sm border rounded-md transition-colors ${page === currentPage
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

// --- TableSkeleton Component ---
interface TableSkeletonProps {
  columns: { key: PropertyKey }[];
  pageSize: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({
  columns,
  pageSize,
}) => {
  return (
    <table className="w-full">
      <thead className="bg-gray-50 border-gray-200 dark:border-gray-600 border-b dark:bg-[#1d1f20]">
        <tr className="animate-pulse">
          {columns.map((column) => (
            <th
              key={String(column.key)}
              className={
                column.key === "checkbox"
                  ? "w-4 p-4"
                  : "px-6 py-3 text-left"
              }
            >
              {column.key === "checkbox" ? (
                <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              ) : (
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-[#1d1f20] divide-y divide-gray-200 dark:divide-gray-800">
        {Array.from({ length: pageSize }).map((_, index) => (
          <tr key={index} className="animate-pulse">
            {columns.map((column) => (
              <td
                key={String(column.key)}
                className={
                  column.key === "checkbox"
                    ? "w-4 p-4"
                    : "px-6 py-4 whitespace-nowrap"
                }
              >
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
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
  onRowClick?: (item: T) => void;
  emptyState?: ReactNode;
  className?: string;
  tableId?: string | boolean;
}

// Normalize any value to a searchable string
const normalizeToString = (value: unknown): string => {
  if (value == null) return "";
  if (Array.isArray(value)) {
    return value
      .map((v) => normalizeToString(v))
      .filter(Boolean)
      .join(" ");
  }
  const t = typeof value;
  if (t === "string") return value as string;
  if (t === "number" || t === "boolean") return String(value);
  if (t === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.name === "string") return obj.name as string;
    if (typeof obj.long_name === "string") return obj.long_name as string;
    if (typeof obj.label === "string") return obj.label as string;
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  return "";
};

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
  emptyState = "No data available",
  className = "",
  tableId: tableIdProp,
}: ReusableTableProps<T>) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>("");

  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const slugify = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  const tableId = useMemo(() => {
    if (tableIdProp === false) return undefined;

    if (typeof tableIdProp === "string") return tableIdProp;

    const pathId = pathname.replace(/^\//, "").replace(/\//g, "-");
    return `${pathId}-${slugify(title)}`;
  }, [tableIdProp, title, pathname]);

  const initialFilters = useMemo(
    () =>
      filters.reduce<Record<string, FilterValue>>((acc, filter) => {
        acc[filter.key] = filter.isMulti ? [] : "";
        return acc;
      }, {}),
    [filters]
  );

  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [localCurrentPage, setLocalCurrentPage] = useState(1);
  const [localCurrentPageSize, setLocalCurrentPageSize] = useState(pageSize);
  const [localSortConfig, setLocalSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });
  const [localFilterValues, setLocalFilterValues] = useState(initialFilters);

  const urlState = useMemo(() => {
    if (!tableId) return null;
    try {
      const s = searchParams.get(`${tableId}_search`) || "";
      const p = parseInt(searchParams.get(`${tableId}_page`) || "1", 10);
      const ps = parseInt(searchParams.get(`${tableId}_pageSize`) || String(pageSize), 10);
      const sortRaw = searchParams.get(`${tableId}_sort`);
      const sort = sortRaw ? JSON.parse(sortRaw) : { key: null, direction: "asc" };
      const filtersRaw = searchParams.get(`${tableId}_filters`);
      const filters = filtersRaw ? JSON.parse(filtersRaw) : initialFilters;
      return { searchTerm: s, currentPage: p, currentPageSize: ps, sortConfig: sort, filterValues: filters };
    } catch {
      return { searchTerm: "", currentPage: 1, currentPageSize: pageSize, sortConfig: { key: null, direction: "asc" }, filterValues: initialFilters };
    }
  }, [tableId, searchParams, pageSize, initialFilters]);

  const searchTerm = tableId ? urlState!.searchTerm : localSearchTerm;
  const currentPage = tableId ? urlState!.currentPage : localCurrentPage;
  const currentPageSize = tableId ? urlState!.currentPageSize : localCurrentPageSize;
  const sortConfig = tableId ? urlState!.sortConfig : localSortConfig;
  const filterValues = tableId ? urlState!.filterValues : localFilterValues;

  const updateUrlState = useCallback((updates: Partial<{ search: string; page: number; pageSize: number; sort: SortConfig; filters: Record<string, FilterValue> }>) => {
    if (!tableId) return;
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      const fullKey = `${tableId}_${key}`;
      if (value === undefined) return;

      const defaultValue = { search: "", page: 1, pageSize, sort: { key: null, direction: "asc" }, filters: initialFilters }[key as keyof typeof updates];

      if (JSON.stringify(value) === JSON.stringify(defaultValue)) {
        params.delete(fullKey);
      } else {
        params.set(fullKey, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [tableId, searchParams, router, pathname, pageSize, initialFilters]);

  const [searchInput, setSearchInput] = useState(searchTerm);

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchTerm) {
        if (tableId) {
          updateUrlState({ search: searchInput, page: 1 });
        } else {
          setLocalSearchTerm(searchInput);
          setLocalCurrentPage(1);
        }
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [
    searchInput,
    searchTerm,
    tableId,
    updateUrlState,
    setLocalSearchTerm,
    setLocalCurrentPage,
  ]);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
  }, []);

  const resolvePath = (obj: unknown, path: string): unknown => {
    const parts = path.split(".");
    const walk = (current: unknown, idx: number): unknown => {
      if (current == null) return undefined;
      if (idx >= parts.length) return current;
      if (Array.isArray(current)) {
        return current
          .map((el) => walk(el, idx))
          .filter((v) => v != null && v !== "") as unknown[];
      }
      if (typeof current === "object") {
        const next = (current as Record<string, unknown>)[parts[idx]];
        return walk(next, idx + 1);
      }
      return undefined;
    };
    return walk(obj, 0);
  };

  const filteredData = useMemo(() => {
    let result = [...data];

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
            return false;
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

    if (searchTerm && searchTerm.trim() && fuseKeys.length > 0) {
      const getSearchableString = (item: T, key: string): string => {
        const col = columns.find((c) => c.key === key);
        if (col && typeof col.render === "function") {
          try {
            const ckey = col.key as string;
            const cval = item[ckey as keyof T] as T[keyof T];
            const rendered = col.render(cval, item);

            if (typeof rendered === "string") return rendered;
            if (typeof rendered === "number") return String(rendered);
            if (React.isValidElement(rendered)) {
              const extractText = (element: unknown): string => {
                if (
                  typeof element === "string" ||
                  typeof element === "number"
                ) {
                  return String(element);
                }
                if (React.isValidElement(element)) {
                  const props = element.props as { children?: unknown };
                  if (props.children) {
                    if (Array.isArray(props.children)) {
                      return props.children.map(extractText).join(" ");
                    }
                    return extractText(props.children);
                  }
                }
                return "";
              };
              const extractedText = extractText(rendered);
              if (extractedText) return extractedText;
            }
          } catch {
            // fall through to raw/nested resolution
          }
        }

        if (key in item) {
          return normalizeToString(item[key as keyof T]);
        }
        const nestedValue = resolvePath(item, key);
        if (nestedValue !== undefined) {
          return normalizeToString(nestedValue);
        }

        return "";
      };

      const fuseData = result.map((item) => {
        const obj: Record<string, string> = {};
        fuseKeys.forEach((key) => {
          obj[key] = getSearchableString(item, key);
        });
        return obj;
      });

      const fuseOptions = {
        keys: fuseKeys,
        threshold: searchTerm.trim().length < 3 ? 0.4 : 0.3,
        ignoreLocation: true,
        minMatchCharLength: 1,
        isCaseSensitive: false,
        includeScore: true,
        includeMatches: true,
        shouldSort: true,
        findAllMatches: true,
        ignoreFieldNorm: true,
      };
      const fuse = new Fuse(fuseData, fuseOptions);
      const fuseResults = fuse.search(searchTerm.trim());
      result = fuseResults.map((searchResult) => result[searchResult.refIndex]);
    }

    return result;
  }, [data, filterValues, searchableColumns, searchTerm, columns]);

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

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * currentPageSize;
    const end = start + currentPageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, currentPageSize]);

  const totalPages = Math.ceil(sortedData.length / currentPageSize);

  const handlePageChange = useCallback((page: number) => {
    if (tableId) {
      updateUrlState({ page });
    } else {
      setLocalCurrentPage(page);
    }
  }, [tableId, updateUrlState]);

  useEffect(() => {
    if (currentPage > totalPages) {
      handlePageChange(totalPages > 0 ? totalPages : 1);
    }
  }, [currentPage, totalPages, handlePageChange]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    if (tableId) {
      updateUrlState({ pageSize: newPageSize, page: 1 });
    } else {
      setLocalCurrentPageSize(newPageSize);
      setLocalCurrentPage(1);
    }
  }, [tableId, updateUrlState]);

  const handleSort = useCallback(
    (key: string) => {
      if (!sortable) return;
      const newSortConfig = {
        key,
        direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
      } as SortConfig;
      if (tableId) {
        updateUrlState({ sort: newSortConfig });
      } else {
        setLocalSortConfig(newSortConfig);
      }
    },
    [sortable, tableId, updateUrlState, sortConfig]
  );

  const handleFilterChange = useCallback((key: string, value: FilterValue) => {
    const newFilters = { ...filterValues, [key]: value };
    if (tableId) {
      updateUrlState({ filters: newFilters, page: 1 });
    } else {
      setLocalFilterValues(newFilters);
      setLocalCurrentPage(1);
    }
  }, [tableId, updateUrlState, filterValues]);

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

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

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

  const displayColumns = useMemo((): TableColumn<T>[] => {
    const cols = [...columns];
    if (multiSelect) {
      cols.unshift({
        key: "checkbox",
        label: (
          <div className="flex items-center">
            <input
              ref={headerCheckboxRef}
              type="checkbox"
              className="w-4 h-4 text-primary bg-gray-100 border border-gray-300 rounded focus:ring-primary"
              checked={isAllSelectedOnPage}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => handleSelectAll(e.target.checked)}
              aria-label="Select all visible rows"
            />
          </div>
        ),
        render: (_value: T[keyof T], item: T) => (
          <input
            type="checkbox"
            className="w-4 h-4 text-primary bg-gray-100 border border-gray-300 rounded focus:ring-primary"
            checked={selectedItems.includes(item.id)}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleSelectItem(item.id, e.target.checked)}
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
    selectedItems,
    handleSelectAll,
    handleSelectItem,
  ]);

  return (
    <div
      className={`overflow-hidden shadow p-0 rounded-lg w-full bg-white dark:bg-[#1d1f20] ${className}`}
    >
      {/* Header */}
      <TableHeader
        title={title}
        searchable={searchable}
        searchTerm={searchInput}
        onSearchChange={setSearchInput}
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
            <TableSkeleton columns={displayColumns} pageSize={currentPageSize} />
          )
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-gray-200 dark:border-gray-600 border-b dark:bg-[#1d1f20]">
              <tr>
                {displayColumns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`${column.key === "checkbox"
                        ? "w-4 p-4"
                        : "max-w-sm px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      } ${column.className || ""} ${sortable &&
                        column.sortable !== false &&
                        column.key !== "checkbox"
                        ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        : ""
                      }`}
                    onClick={() =>
                      sortable &&
                      column.sortable !== false &&
                      column.key !== "checkbox" &&
                      handleSort(String(column.key))
                    }
                  >
                    {column.key === "checkbox" ? (
                      column.label
                    ) : (
                      <div className="flex items-center space-x-1">
                        <span>{column.label}</span>
                        {sortable &&
                          column.sortable !== false &&
                          getSortIcon(String(column.key))}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#1d1f20] divide-y divide-gray-200 dark:divide-gray-800">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr
                    key={item.id ?? index}
                    onClick={(e) => {
                      const target = e.target as HTMLElement | null;
                      if (
                        (target &&
                          target.closest(
                            'input, button, a, [role="button"], [data-no-rowclick]'
                          )) ||
                        (target instanceof HTMLInputElement &&
                          target.type === "checkbox")
                      ) {
                        return;
                      }
                      if (onRowClick) {
                        onRowClick(item);
                      }
                    }}
                    className={`${selectedItems.includes(item.id)
                        ? "bg-primary/10 dark:bg-primary/20"
                        : "hover:bg-primary/5 dark:hover:bg-primary/20"
                      } ${onRowClick ? "cursor-pointer" : ""}`}
                  >
                    {displayColumns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={`break-words ${column.key === "checkbox"
                            ? "w-4 p-4"
                            : "px-6 py-4 text-sm text-gray-900 dark:text-gray-100"
                          } ${column.className || ""}`}
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
                      : emptyState}
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
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
};

ReusableTable.defaultProps = {
  title: "Table",
  data: [],
  columns: [],
  searchable: true,
  filterable: true,
  filters: [],
  pageSize: 10,
  showPagination: true,
  sortable: true,
  pageSizeOptions: [5, 10, 20, 50, 100],
  loading: false,
  multiSelect: false,
  actions: [],
  tableId: undefined,
};

export default ReusableTable;
