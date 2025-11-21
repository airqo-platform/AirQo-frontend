# RBAC (Role-Based Access Control) System

This document describes the comprehensive RBAC system in the AirQo platform, including the `useRBAC` hook, `PermissionGuard` component, and related utilities for managing user permissions and roles.

## Overview

The RBAC system consists of several components working together:

- **`useRBAC` hook**: Fetches and provides utilities for checking user permissions and roles
- **`PermissionGuard` component**: Wraps content to conditionally render based on permissions
- **`AdminPageGuard` component**: Convenience wrapper for admin pages
- **`AccessDenied` component**: Displays access denied messages using consistent banner styling

The system fetches user roles and permissions data using the `userRolesByIdFetcher` endpoint and provides convenient methods to check permissions and roles throughout the application.

## Data Structure

The system works with the following data structure returned by the API:

```typescript
{
  success: true,
  message: "Successfully retrieved simplified user roles",
  user_roles: {
    user_id: string,
    groups: Array<{
      group_id: string,
      group_name: string,
      role_id: string,
      role_name: string,
      permissions: string[]
    }>,
    networks: Array<{
      network_id: string,
      network_name: string,
      role_id: string,
      role_name: string,
      permissions: string[]
    }>
  }
}
```

## Core Hook: useRBAC

### Basic Usage

```typescript
import { useRBAC } from '@/shared/hooks';

function MyComponent() {
  const {
    hasPermission,
    hasRole,
    hasAnyPermission,
    isAdmin,
    userRoles,
    isLoading,
    error
  } = useRBAC();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {hasPermission('DASHBOARD_VIEW') && (
        <button>View Dashboard</button>
      )}

      {hasRole('AIRQO_ADMIN') && (
        <div>Admin Panel</div>
      )}

      {isAdmin() && (
        <div>Admin Controls</div>
      )}
    </div>
  );
}
```

### API Reference

#### Data Properties

- `userRoles`: The raw user roles data or `null` if not loaded
- `allPermissions`: Array of all unique permissions across groups and networks
- `allRoles`: Array of all unique role names
- `isLoading`: Boolean indicating if data is being fetched
- `error`: Error object if fetching failed

#### Permission Check Methods

- `hasPermission(permission: string)`: Check if user has a specific permission anywhere
- `hasAnyPermission(permissions: string[])`: Check if user has any of the specified permissions
- `hasAllPermissions(permissions: string[])`: Check if user has all of the specified permissions

#### Role Check Methods

- `hasRole(role: string)`: Check if user has a specific role anywhere
- `hasAnyRole(roles: string[])`: Check if user has any of the specified roles

#### Active Group Permission Methods

- `hasAnyPermissionInActiveGroup(permissions: string[])`: Check permissions in the user's active group
- `hasAllPermissionsInActiveGroup(permissions: string[])`: Check all permissions in active group
- `hasRoleInActiveGroup(role: string)`: Check role in active group

#### Group/Network Specific Methods

- `hasPermissionInGroup(permission: string, groupName: string)`: Check permission in specific group
- `hasPermissionInNetwork(permission: string, networkName: string)`: Check permission in specific network
- `hasRoleInGroup(role: string, groupName: string)`: Check role in specific group
- `hasRoleInNetwork(role: string, networkName: string)`: Check role in specific network

#### Special Check Methods

- `canAccessAdminPanel()`: Check if user has AIRQO_ADMIN role AND @airqo.net email domain

#### Utility Methods

- `getUserGroups()`: Get array of user's groups with roles and permissions
- `getUserNetworks()`: Get array of user's networks with roles and permissions
- `isAdmin()`: Check if user has any role containing "admin"
- `isSuperAdmin()`: Check if user has any role containing "super_admin"

#### Utility Methods

- `getUserGroups()`: Get array of user's groups with roles and permissions
- `getUserNetworks()`: Get array of user's networks with roles and permissions
- `isAdmin()`: Check if user has any role containing "admin"
- `isSuperAdmin()`: Check if user has any role containing "super_admin"

## PermissionGuard Component

The `PermissionGuard` component provides a declarative way to protect content based on permissions. It prevents rendering of protected content until permissions are verified, avoiding flickering.

### Basic Usage

```tsx
import { PermissionGuard } from '@/shared/components';

function ProtectedComponent() {
  return (
    <PermissionGuard
      requiredPermissions={['DASHBOARD_VIEW']}
      requiredPermissionsInActiveGroup={['DATA_VIEW']}
    >
      <div>
        This content is only visible to users with the required permissions
      </div>
    </PermissionGuard>
  );
}
```

### PermissionGuard Props

- `requiredPermissions?: string[]` - User must have ANY of these permissions globally
- `requiredAllPermissions?: string[]` - User must have ALL of these permissions globally
- `requiredPermissionsInActiveGroup?: string[]` - User must have ANY of these permissions in active group
- `requiredAllPermissionsInActiveGroup?: string[]` - User must have ALL of these permissions in active group
- `requiredRoles?: string[]` - User must have ANY of these roles globally
- `requiredAllRoles?: string[]` - User must have ALL of these roles globally
- `requiredRolesInActiveGroup?: string[]` - User must have ANY of these roles in active group
- `requireAirQoAdmin?: boolean` - User must have AIRQO_ADMIN role AND @airqo.net email
- `customCheck?: () => boolean` - Custom permission check function
- `loadingComponent?: React.ReactNode` - Custom loading component
- `accessDeniedTitle?: string` - Custom access denied title
- `accessDeniedMessage?: string` - Custom access denied message

### AdminPageGuard Component

A convenience wrapper for admin pages with common defaults:

```tsx
import { AdminPageGuard } from '@/shared/components';

function AdminPage() {
  return (
    <AdminPageGuard
      requiredPermissionsInActiveGroup={['ORG_APPROVE', 'ORG_REJECT']}
    >
      <div>Admin content here</div>
    </AdminPageGuard>
  );
}
```

## AccessDenied Component

The `AccessDenied` component displays consistent access denied messages using the ErrorBanner component.

### Usage

```tsx
import { AccessDenied } from '@/shared/components';

function CustomAccessDenied() {
  return (
    <AccessDenied
      title="Custom Access Denied"
      message="You need special permissions to view this content."
      showBackButton={true}
      backButtonText="Return Home"
    />
  );
}
```

## Admin Page Examples

### Organization Requests Page (AIRQO Admin Only)

```tsx
import { AdminPageGuard } from '@/shared/components';

export default function OrganizationRequestsPage() {
  return (
    <AdminPageGuard requireAirQoAdmin={true}>
      {/* Page content */}
    </AdminPageGuard>
  );
}
```

### Members Page (Active Group Permissions)

```tsx
import { AdminPageGuard } from '@/shared/components';

export default function MembersPage() {
  return (
    <AdminPageGuard
      requiredPermissionsInActiveGroup={['USER_INVITE', 'USER_MANAGEMENT']}
    >
      {/* Page content */}
    </AdminPageGuard>
  );
}
```

### Member Requests Page (Active Group Permissions)

```tsx
import { AdminPageGuard } from '@/shared/components';

export default function MemberRequestsPage() {
  return (
    <AdminPageGuard requiredPermissionsInActiveGroup={['USER_MANAGEMENT']}>
      {/* Page content */}
    </AdminPageGuard>
  );
}
```

## Common Permission Examples

```typescript
// Check for dashboard access
hasPermission('DASHBOARD_VIEW');

// Check for admin capabilities
hasAnyPermission(['ORG_CREATE', 'ORG_UPDATE', 'ORG_DELETE']);

// Check for data export permissions
hasPermission('DATA_EXPORT');

// Check for device management
hasAnyPermission(['DEVICE_VIEW', 'DEVICE_UPDATE', 'DEVICE_DELETE']);

// Check AIRQO admin with email domain
canAccessAdminPanel();

// Check permissions in active group
hasAnyPermissionInActiveGroup(['ORG_APPROVE', 'ORG_REJECT']);
```

## Integration with Authentication

The system automatically uses the current user's ID from the Redux store. It will only fetch data when a user is logged in. The data refreshes automatically when the application reloads due to SWR's caching mechanism.

## Error Handling

Always check for loading and error states:

```typescript
const { isLoading, error, hasPermission } = useRBAC();

if (isLoading) {
  // Show loading spinner
}

if (error) {
  // Handle error - maybe show fallback UI
  console.error('Failed to load user roles:', error);
}

// Only check permissions after data is loaded
if (!isLoading && !error && hasPermission('SOME_PERMISSION')) {
  // Render permission-dependent UI
}
```

## Performance Notes

- The hook uses SWR for caching and automatic revalidation
- Permission checks are memoized for performance
- Data is deduplicated to avoid redundant API calls
- PermissionGuard prevents content flickering by checking permissions before rendering
