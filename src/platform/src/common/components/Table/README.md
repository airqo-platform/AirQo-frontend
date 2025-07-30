# Enhanced Table Components

This folder contains the refactored and enhanced table components for the AirQo platform.

## Features

### 1. Download Enhancement

- **DownloadDropdown Component**: Replaces the simple download button with a dropdown that allows users to select data type
- **Data Type Options**: Users can choose between "Calibrated Data" and "Raw Data"
- **Automatic Integration**: Works with existing `useDownload` hook

### 2. Refactored ReusableTable

- **Modular Architecture**: Broken down into smaller, maintainable components
- **Custom Hooks**: Separated concerns with dedicated hooks for search, filtering, sorting, pagination, and multi-select
- **Better Performance**: Optimized with proper memoization and reduced re-renders
- **Memory Leak Prevention**: Proper cleanup in useEffect hooks

### 3. Multi-Select Functionality

- **Bulk Actions**: Select multiple table rows and perform actions on them
- **Customizable Actions**: Pass custom actions via props
- **Visual Feedback**: Shows selection count and action bar
- **Cross-Page Selection**: Maintains selections across pagination

## Components

### Core Components

- `ReusableTableRefactored.jsx` - Main table component (now default export)
- `ReusableTable.jsx` - Legacy table (for backward compatibility)

### Sub-Components

- `TableHeader.jsx` - Header with search and filters
- `MultiSelectActionBar.jsx` - Action bar for selected items
- `TablePagination.jsx` - Pagination controls
- `PageSizeSelector.jsx` - Page size selection
- `CustomFilter.jsx` - Filter dropdown component

### Hooks

- `useTableSearch.js` - Search functionality with Fuse.js
- `useTableFilters.js` - Filtering logic
- `useTableSorting.js` - Sorting functionality
- `useTablePagination.js` - Pagination state management
- `useTableMultiSelect.js` - Multi-select functionality

### Utilities

- `tableUtils.js` - Common utility functions

## Usage

### Basic Table

```jsx
import ReusableTable from '@/components/Table';

<ReusableTable
  title="My Data"
  data={data}
  columns={columns}
  searchable={true}
  filterable={true}
  sortable={true}
/>;
```

### Table with Multi-Select

```jsx
const actions = [
  {
    label: 'Delete Items',
    value: 'delete',
    handler: (selectedIds) => {
      // Handle deletion
    },
  },
];

<ReusableTable
  title="My Data"
  data={data}
  columns={columns}
  multiSelect={true}
  actions={actions}
  onSelectedItemsChange={(items) => setSelected(items)}
/>;
```

### Download with Data Type Selection

```jsx
import DownloadDropdown from '@/components/Button/DownloadDropdown';

<DownloadDropdown
  onDownload={(datatype) => downloadData(datatype)}
  downloadLoading={loading}
  visibleSites={sites}
/>;
```

## Migration Guide

### From Legacy ReusableTable

The new table is backward compatible. To use new features:

1. **Multi-Select**: Add `multiSelect={true}` and `actions` props
2. **Enhanced Download**: Replace download buttons with `DownloadDropdown`

### Breaking Changes

- None - full backward compatibility maintained

## Best Practices

1. **Memory Management**: All hooks properly clean up event listeners and subscriptions
2. **Performance**: Use React.memo for components that don't need frequent re-renders
3. **Accessibility**: All interactive elements have proper ARIA labels
4. **Type Safety**: PropTypes validation included (consider TypeScript migration)

## File Structure

```
Table/
├── index.jsx                    # Main exports
├── ReusableTableRefactored.jsx  # Enhanced table (default)
├── ReusableTable.jsx           # Legacy table (compatibility)
├── LegacyCustomTable.jsx       # Old CustomTable
├── ExampleUsage.jsx            # Usage examples
├── components/
│   ├── TableHeader.jsx
│   ├── MultiSelectActionBar.jsx
│   ├── TablePagination.jsx
│   ├── PageSizeSelector.jsx
│   └── CustomFilter.jsx
├── hooks/
│   ├── useTableSearch.js
│   ├── useTableFilters.js
│   ├── useTableSorting.js
│   ├── useTablePagination.js
│   └── useTableMultiSelect.js
└── utils/
    └── tableUtils.js
```

## Future Enhancements

1. **TypeScript Migration**: Convert to TypeScript for better type safety
2. **Virtual Scrolling**: For very large datasets
3. **Column Resizing**: Draggable column widths
4. **Export Features**: CSV/Excel export functionality
5. **Advanced Filtering**: Date ranges, number ranges, etc.
