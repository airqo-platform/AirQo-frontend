# ReusableTable Component - Multi-Select Functionality

The ReusableTable component now supports multi-select functionality, allowing users to select multiple rows and perform bulk actions. This feature is modeled after the data download page implementation for consistency.

## Features

### ✅ Implemented Features

1. **Checkbox Column**: When `multiSelect` is enabled, a checkbox column is automatically added as the first column
2. **Select All Functionality**: Header checkbox that selects/deselects all visible rows on the current page
3. **Indeterminate State**: Header checkbox shows indeterminate state when some (but not all) rows are selected
4. **Individual Row Selection**: Each row has its own checkbox for individual selection
5. **Visual Feedback**: Selected rows are highlighted with a background color
6. **Action Bar**: When items are selected, an action bar appears with available bulk actions
7. **State Management**: Selected items are tracked and passed to parent component via callback
8. **Row Click Prevention**: Clicking on checkboxes doesn't trigger row click events

## Usage

### Basic Multi-Select Setup

```tsx
import ReusableTable, { TableColumn, TableItem } from '@/components/shared/table/ReusableTable';

interface MyData extends TableItem {
  name: string;
  status: string;
  // ... other properties
}

const columns: TableColumn<MyData>[] = [
  {
    key: 'name',
    label: 'Name',
    render: (value) => <span>{String(value)}</span>,
  },
  // ... other columns
];

const data: MyData[] = [
  { id: '1', name: 'Item 1', status: 'active' },
  { id: '2', name: 'Item 2', status: 'inactive' },
  // ... more data
];

function MyComponent() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleSelectedItemsChange = (selectedIds: (string | number)[]) => {
    setSelectedItems(selectedIds as string[]);
    console.log('Selected items:', selectedIds);
  };

  return (
    <ReusableTable
      data={data}
      columns={columns}
      multiSelect={true}
      onSelectedItemsChange={handleSelectedItemsChange}
    />
  );
}
```

### With Bulk Actions

```tsx
const actions = [
  {
    label: 'Export Selected',
    value: 'export',
    handler: (selectedIds: (string | number)[]) => {
      console.log('Exporting:', selectedIds);
      // Handle export logic
    },
  },
  {
    label: 'Delete Selected',
    value: 'delete',
    handler: (selectedIds: (string | number)[]) => {
      console.log('Deleting:', selectedIds);
      // Handle delete logic
    },
  },
];

<ReusableTable
  data={data}
  columns={columns}
  multiSelect={true}
  actions={actions}
  onSelectedItemsChange={handleSelectedItemsChange}
/>
```

### Complete Example with Device Management

```tsx
import { useState } from 'react';
import ReusableTable from '@/components/shared/table/ReusableTable';
import { Device } from '@/app/types/devices';

interface DevicesTableProps {
  devices: Device[];
  onSelectedDevicesChange?: (devices: Device[]) => void;
}

export default function DevicesTable({ devices, onSelectedDevicesChange }: DevicesTableProps) {
  const handleSelectedItemsChange = (selectedIds: (string | number)[]) => {
    if (onSelectedDevicesChange) {
      const selectedDevices = devices.filter(device => 
        selectedIds.includes(device._id)
      );
      onSelectedDevicesChange(selectedDevices);
    }
  };

  const columns = [
    {
      key: 'long_name',
      label: 'Device Name',
      render: (value, device) => (
        <div>
          <span className="font-medium">{String(value)}</span>
          <span className="text-sm text-gray-500">{device.description}</span>
        </div>
      ),
    },
    // ... other columns
  ];

  const actions = [
    {
      label: 'Assign to Cohort',
      value: 'assign_cohort',
      handler: (selectedIds) => {
        // Handle cohort assignment
        console.log('Assigning to cohort:', selectedIds);
      },
    },
    {
      label: 'Export Selected',
      value: 'export',
      handler: (selectedIds) => {
        // Handle export
        console.log('Exporting:', selectedIds);
      },
    },
  ];

  return (
    <ReusableTable
      title="Devices"
      data={devices.map(device => ({ ...device, id: device._id }))}
      columns={columns}
      multiSelect={true}
      actions={actions}
      onSelectedItemsChange={handleSelectedItemsChange}
    />
  );
}
```

## Props

### Multi-Select Specific Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `multiSelect` | `boolean` | `false` | Enables multi-select functionality |
| `onSelectedItemsChange` | `(selectedIds: (string \| number)[]) => void` | - | Callback when selection changes |
| `actions` | `TableAction[]` | `[]` | Array of bulk actions available when items are selected |

### TableAction Interface

```tsx
interface TableAction {
  label: string;           // Display name for the action
  value: string;           // Unique identifier for the action
  handler: (selectedIds: (string | number)[]) => void;  // Action handler
}
```

## Behavior

### Selection Logic

1. **Individual Selection**: Clicking a row checkbox selects/deselects that specific item
2. **Select All**: Clicking the header checkbox selects/deselects all items on the current page
3. **Indeterminate State**: When some items are selected, the header checkbox shows an indeterminate state
4. **Cross-Page Selection**: Selected items persist across page changes
5. **Filter/Search Persistence**: Selected items remain selected when filtering or searching

### Visual States

- **Unselected**: Normal row appearance
- **Selected**: Light primary color background (`bg-primary/10`)
- **Hover**: Slightly darker background on hover
- **Checkbox**: Primary color when checked, gray when unchecked

### Action Bar

The action bar appears when at least one item is selected and displays:
- Selected item count
- Dropdown with available actions
- Apply button to execute the selected action

## Styling

The component uses Tailwind CSS classes and follows the existing design system:

- **Checkboxes**: `w-4 h-4 text-primary bg-gray-100 border border-gray-300 rounded focus:ring-primary`
- **Selected Rows**: `bg-primary/10 dark:bg-primary/20`
- **Action Bar**: `bg-primary/10 dark:bg-primary/20 border-b border-primary/20`

## Accessibility

- All checkboxes have proper `aria-label` attributes
- Keyboard navigation is supported
- Screen reader friendly with proper semantic markup
- Focus management for keyboard users

## Testing

The component includes comprehensive tests covering:
- Checkbox rendering
- Individual selection
- Select all functionality
- Action bar display
- State management

Run tests with:
```bash
npm test -- shared/table
```

## Migration Guide

### From Non-Multi-Select to Multi-Select

1. Add `multiSelect={true}` prop
2. Add `onSelectedItemsChange` callback
3. Optionally add `actions` array for bulk operations
4. Ensure your data items have unique `id` properties

### Example Migration

```tsx
// Before
<ReusableTable
  data={data}
  columns={columns}
/>

// After
<ReusableTable
  data={data}
  columns={columns}
  multiSelect={true}
  onSelectedItemsChange={(selectedIds) => {
    console.log('Selected:', selectedIds);
  }}
  actions={[
    {
      label: 'Export',
      value: 'export',
      handler: (ids) => handleExport(ids),
    },
  ]}
/>
```

## Best Practices

1. **Unique IDs**: Ensure all data items have unique `id` properties
2. **Performance**: For large datasets, consider virtual scrolling
3. **User Feedback**: Provide clear feedback when bulk actions are performed
4. **Confirmation**: Add confirmation dialogs for destructive actions
5. **Loading States**: Show loading indicators during bulk operations

## Troubleshooting

### Common Issues

1. **Checkboxes not appearing**: Ensure `multiSelect={true}` is set
2. **Selection not persisting**: Check that data items have unique `id` properties
3. **Action bar not showing**: Verify that `actions` array is provided and items are selected
4. **Row click conflicts**: The component automatically prevents row clicks when clicking checkboxes

### Debug Tips

- Check browser console for any errors
- Verify data structure matches `TableItem` interface
- Ensure all required props are provided
- Test with minimal data first

