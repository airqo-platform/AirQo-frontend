// Export the refactored ReusableTable as the default
export { default } from './ReusableTableRefactored';

// Export original ReusableTable for backward compatibility (temporarily)
export { default as ReusableTableLegacy } from './ReusableTable';

// Export individual components
export { default as CustomFilter } from './components/CustomFilter';
export { default as PageSizeSelector } from './components/PageSizeSelector';
export { default as MultiSelectActionBar } from './components/MultiSelectActionBar';
export { default as TableHeader } from './components/TableHeader';
export { default as TablePagination } from './components/TablePagination';

// Export hooks
export { useTableSearch } from './hooks/useTableSearch';
export { useTableFilters } from './hooks/useTableFilters';
export { useTableSorting } from './hooks/useTableSorting';
export { useTablePagination } from './hooks/useTablePagination';
export { useTableMultiSelect } from './hooks/useTableMultiSelect';

// Export utilities
export * from './utils/tableUtils';

// Legacy CustomTable export (for backward compatibility)
export { default as CustomTable } from './LegacyCustomTable';
