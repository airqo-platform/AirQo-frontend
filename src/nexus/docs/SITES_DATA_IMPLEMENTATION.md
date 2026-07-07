# Enhanced Site Data Management Implementation

This document describes the comprehensive implementation of site data management with cohort support, pagination, and search functionality.

## Overview

The implementation provides a robust solution for managing site data with the following features:

- **Cohort Management**: Automatic fetching and caching of active group cohorts
- **Site Data Fetching**: Real-time site data from API with pagination and search
- **Data Normalization**: Consistent data transformation for table display
- **Enhanced Components**: Updated `add-location` and `add-favorites` components with real data
- **Type Safety**: Full TypeScript support with proper type definitions

## Architecture

### 1. Cohort Management (`cohortSlice.ts`)

**Store State:**

```typescript
interface CohortState {
  activeGroupCohorts: string[];
  isLoading: boolean;
  error: string | null;
  lastFetchedGroupId: string | null;
}
```

**Actions:**

- `setCohortsLoading`: Set loading state
- `setCohortsError`: Set error state
- `setActiveGroupCohorts`: Store cohorts for active group
- `clearCohorts`: Clear cohort data

### 2. Enhanced Device Hooks (`useDevice.ts`)

#### `useActiveGroupCohorts()`

- Automatically fetches cohorts for the active group
- Caches results in Redux store
- Handles group switching and cleanup
- Returns: `{ cohortIds, isLoading, error, refetch }`

#### `useActiveGroupCohortSites(params, enabled)`

- Uses active group cohorts automatically
- Supports pagination and search parameters
- Handles loading states and error conditions
- Returns standard SWR response + cohortIds

#### `useActiveGroupCohortDevices(params, enabled)`

- Uses active group cohorts automatically
- Supports pagination and search parameters
- Handles loading states and error conditions
- Returns standard SWR response + cohortIds

### 3. Site Data Management (`useSitesData.ts`)

#### `useSitesData(options)`

Comprehensive hook for site data management:

**Parameters:**

```typescript
interface UseSitesDataParams {
  enabled?: boolean;
  initialPageSize?: number;
}
```

**Returns:**

```typescript
interface UseSitesDataResult {
  // Data
  sites: NormalizedSiteData[];
  totalSites: number;
  totalPages: number;
  currentPage: number;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Pagination controls
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  pageSize: number;

  // Search controls
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  // Raw response metadata
  meta?: CohortSitesMeta;
}
```

**Features:**

- Server-side pagination (limit: 6 items per page)
- Server-side search with debouncing
- Automatic page reset on search/filter changes
- Real-time data from active group cohorts
- Normalized data for consistent table display

### 4. Device Data Management (`useDevicesData.ts`)

#### `useDevicesData(options)`

Comprehensive hook for device data management:

**Parameters:**

```typescript
interface UseDevicesDataParams {
  enabled?: boolean;
  initialPageSize?: number;
}
```

**Returns:**

```typescript
interface UseDevicesDataResult {
  // Data
  devices: NormalizedDeviceData[];
  totalDevices: number;
  totalPages: number;
  currentPage: number;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Pagination controls
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  pageSize: number;

  // Search controls
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  // Raw response metadata
  meta?: CohortDevicesMeta;
}
```

**Features:**

- Server-side pagination (limit: 6 items per page)
- Server-side search with debouncing
- Automatic page reset on search/filter changes
- Real-time data from active group cohorts
- Normalized data for consistent table display

### 5. Data Normalization

#### Site Data Transformation

Raw API response → Normalized table data:

**Input (API Response):**

```typescript
interface RawSiteData {
  _id: string;
  search_name?: string;
  location_name?: string;
  formatted_name?: string;
  name?: string;
  city?: string;
  country?: string;
  data_provider?: string;
  [key: string]: unknown;
}
```

**Output (Normalized):**

```typescript
interface NormalizedSiteData {
  id: string;
  location: string; // search_name with fallbacks
  city: string; // city with fallback
  country: string; // country with fallback
  owner: string; // data_provider with fallback
  _raw?: RawSiteData; // Original data for reference
  [key: string]: unknown; // TableItem compatibility
}
```

**Mapping Rules:**

- **Location**: `search_name` → `formatted_name` → `location_name` → `name` → "Unknown Location"
- **City**: `city` → "Unknown City"
- **Country**: `country` → "Unknown Country"
- **Owner**: `data_provider` → "Unknown Owner"

#### Device Data Normalization (`deviceUtils.ts`)

**Input (API Response):**

```typescript
interface RawDeviceData {
  _id: string;
  groups?: unknown[];
  long_name?: string;
  lastRawData?: string;
  rawOnlineStatus?: boolean;
  [key: string]: unknown;
}
```

**Output (Normalized):**

```typescript
interface NormalizedDeviceData {
  id: string;
  name: string; // long_name with fallback to _id
  status: 'online' | 'offline' | 'unknown'; // Based on rawOnlineStatus
  lastData: string; // Formatted timestamp or 'Never'
  _raw?: RawDeviceData; // Original data for reference
  [key: string]: unknown; // TableItem compatibility
}
```

**Mapping Rules:**

- **Name**: `long_name` → `_id` → "Unknown Device"
- **Status**: `rawOnlineStatus` → 'online'/'offline'/'unknown'
- **Last Data**: `lastRawData` → formatted timestamp → "Never"

### 6. Enhanced Components

#### `AddLocation` Component

**Features:**

- Real-time site data from active group cohorts
- Server-side pagination (6 items per page)
- Loading states and error handling
- Integration with existing site selection logic
- Maintains selected state across dialog sessions

**Usage:**

```tsx
const AddLocation: React.FC = () => {
  const { sites, isLoading, error, totalSites } = useSitesData({
    enabled: isOpen,
    initialPageSize: 6,
  });

  // Component renders MultiSelectTable with real data
  return (
    <MultiSelectTable
      title={`Sites ${totalSites > 0 ? `(${totalSites})` : ''}`}
      data={sites}
      pageSize={6}
      loading={isLoading}
      // ... other props
    />
  );
};
```

#### `AddFavorites` Component

**Features:**

- Same real-time data as AddLocation
- Favorites-specific validation (max 4 selections)
- Consistent UI patterns with location selection

#### `AddDevice` Component

**Features:**

- Real-time device data from active group cohorts
- Server-side pagination (6 items per page)
- Loading states and error handling
- Integration with existing device selection logic
- Maintains selected state across dialog sessions

**Usage:**

```tsx
const AddDevice: React.FC = () => {
  const { devices, isLoading, error, totalDevices } = useDevicesData({
    enabled: isOpen,
    initialPageSize: 6,
  });

  // Component renders MultiSelectTable with real data
  return (
    <MultiSelectTable
      title={`Devices ${totalDevices > 0 ? `(${totalDevices})` : ''}`}
      data={devices}
      pageSize={6}
      loading={isLoading}
      // ... other props
    />
  );
};
```

### 6. MultiSelectTable Enhancements

**Page Size Options:**

- Updated to include `6` in default options: `[5, 6, 10, 20, 50, 100]`
- Default page size configurable per component

**Server-Side Integration:**

- Pagination handled via hook parameters
- Search managed through hook state
- Loading states properly displayed

## API Integration

### Endpoints Used

1. **Get Group Cohorts**: `/api/v2/users/groups/{groupId}/cohorts`
   - Returns: `{ success: boolean, data: string[] }`
   - Cached per group in Redux store

2. **Get Cohort Sites**: `/api/v2/devices/cohorts/sites`
   - Request: `{ cohort_ids: string[] }`
   - Parameters: `{ search?, limit?, skip? }`
   - Returns: `{ success: boolean, sites: RawSiteData[], meta: CohortSitesMeta }`

3. **Get Cohort Devices**: `/api/v2/devices/cohorts/devices`
   - Request: `{ cohort_ids: string[] }`
   - Parameters: `{ search?, limit?, skip? }`
   - Returns: `{ success: boolean, devices: RawDeviceData[], meta: CohortDevicesMeta }`

### Data Flow

1. **User opens dialog** → Hook enabled
2. **Fetch active group cohorts** → Cache in Redux
3. **Fetch sites/devices with cohorts** → Server-side pagination
4. **Normalize site/device data** → Table-ready format
5. **Display in MultiSelectTable** → 6 items per page
6. **User interactions** → Selection state management

## Best Practices Implemented

### 1. Performance Optimization

- **SWR Caching**: 30-second cache for cohorts, 5-second for sites
- **Conditional Fetching**: Only fetch when dialog is open
- **Debounced Search**: Prevents excessive API calls
- **Memoized Components**: Prevents unnecessary re-renders

### 2. Error Handling

- **Graceful Degradation**: Show error states without crashing
- **Retry Logic**: Built into SWR hooks
- **User Feedback**: Clear loading and error messages

### 3. Type Safety

- **Full TypeScript**: End-to-end type definitions
- **Runtime Validation**: Type guards for API responses
- **Interface Consistency**: Normalized data contracts

### 4. State Management

- **Redux Integration**: Cohort data persisted globally
- **Local State**: Component-specific UI state
- **Automatic Cleanup**: Clear data on group changes

### 5. User Experience

- **Responsive Design**: Works across device sizes
- **Loading States**: Skeleton loading and spinners
- **Search Integration**: Real-time search with server filtering
- **Accessibility**: ARIA labels and keyboard navigation

## Configuration

### Environment Setup

Ensure these services are configured in your API client:

- Authentication tokens for device service
- Group permissions for cohort access
- CORS settings for API endpoints

### Default Settings

```typescript
// Default page size for sites
const DEFAULT_PAGE_SIZE = 6;

// SWR cache durations
const COHORTS_CACHE_TIME = 30000; // 30 seconds
const SITES_CACHE_TIME = 5000; // 5 seconds

// Page size options
const PAGE_SIZE_OPTIONS = [5, 6, 10, 20, 50, 100];
```

## Testing Recommendations

1. **Unit Tests**: Test normalization utilities and hooks
2. **Integration Tests**: Test component behavior with real API
3. **Error Scenarios**: Test network failures and invalid responses
4. **Performance Tests**: Verify caching and pagination efficiency
5. **Accessibility Tests**: Ensure keyboard and screen reader support

## Future Enhancements

1. **Infinite Scroll**: Replace pagination with infinite loading
2. **Advanced Filtering**: Add category and owner filters
3. **Bulk Operations**: Multi-site actions and operations
4. **Real-time Updates**: WebSocket integration for live data
5. **Offline Support**: Cache data for offline access

## Troubleshooting

### Common Issues

1. **No sites/devices loading**: Check active group has valid cohorts
2. **Slow loading**: Verify API response times and caching
3. **Search not working**: Ensure search parameter is passed to API
4. **Pagination issues**: Check meta.totalPages calculation
5. **Type errors**: Verify normalization function handles all data shapes

### Debug Commands

```bash
# Check Redux store state
console.log(store.getState().cohorts);

# Verify API responses
console.log('Sites response:', data);

# Test normalization
console.log('Normalized sites:', normalizeSitesData(rawSites));
```

This implementation provides a robust, scalable foundation for site and device data management with real-time updates, proper caching, and excellent user experience.
