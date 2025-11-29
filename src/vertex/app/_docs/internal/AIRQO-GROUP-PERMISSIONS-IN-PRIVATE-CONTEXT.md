# Using AirQo Group Permissions in Private Context

## Problem Statement
Every user has an AirQo group assigned to them. The app has different contexts (personal, airqo-internal, external-org) with different view states. However, in the **private context**, we needed to use the permissions assigned to the user's AirQo group for certain use cases, instead of hardcoding or skipping permission checks.

## Solution Overview

We implemented a fallback mechanism that:
1. Checks if the user is in `personal` context
2. Retrieves their AirQo group (if they have one)
3. Uses that group's permissions for permission checks

## Implementation Details

### 1. Permission Service (`core/permissions/permissionService.ts`)

Added a new method to retrieve the user's AirQo group:

```typescript
/**
 * Get user's AirQo group (if they have one)
 * This is useful for private context permission checks
 */
getAirQoGroup(user: UserDetails): Group | undefined {
  if (!user.groups) return undefined;
  
  return user.groups.find((group) => 
    group.grp_title.toLowerCase() === 'airqo'
  );
}
```

This method:
- Searches through the user's groups
- Finds the group with title "airqo" (case-insensitive)
- Returns the group object or undefined if not found

### 2. usePermission Hook (`core/hooks/usePermissions.ts`)

Modified to use AirQo group permissions as fallback in personal context:

```typescript
export const usePermission = (permission: Permission, context?: Partial<AccessContext>) => {
  const user = useAppSelector((state) => state.user.userDetails);
  const activeGroup = useAppSelector((state) => state.user.activeGroup);
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  const userContext = useAppSelector((state) => state.user.userContext);

  const result = useMemo(() => {
    if (MOCK_PERMISSIONS_ENABLED) {
      return MOCK_PERMISSIONS[permission] ?? false;
    }

    if (!user) return false;

    // If in personal context and no active organization is provided,
    // check against AirQo group permissions (if user has one)
    let effectiveContext = context;
    if (userContext === 'personal' && !context?.activeOrganization && !activeGroup) {
      const airqoGroup = permissionService.getAirQoGroup(user);
      if (airqoGroup) {
        effectiveContext = {
          ...context,
          activeOrganization: airqoGroup,
        };
      }
    }

    return permissionService.hasPermission(user, permission, {
      activeOrganization: effectiveContext?.activeOrganization ?? activeGroup ?? undefined,
      activeNetwork: activeNetwork ?? undefined,
      ...effectiveContext,
    });
  }, [user, permission, activeGroup, activeNetwork, userContext, context]);

  return result;
};
```

Key changes:
- Added `userContext` to the hook's dependencies
- Check if we're in `personal` context without an active group
- If so, retrieve the AirQo group and use it as the `activeOrganization`
- This ensures permission checks use the AirQo group's role permissions

### 3. useUserContext Hook (`core/hooks/useUserContext.ts`)

Updated `getContextPermissions()` to use actual permission checks in personal context:

```typescript
const getContextPermissions = () => {
  // In personal context, check AirQo group permissions if they exist
  if (userContext === 'personal') {
    // Device view is always available in personal context for owned devices
    // But for other permissions, check the user's AirQo group permissions
    return {
      canViewDevices: true, // Always true for personal devices
      canViewSites,
      canViewUserManagement,
      canViewAccessControl,
      canViewOrganizations: false,
      canViewNetworks: false,
    };
  }

  // For organizational contexts, use the regular permission checks
  return {
    canViewDevices,
    canViewSites,
    canViewUserManagement,
    canViewAccessControl,
    canViewNetworks,
  };
};
```

Changes:
- Instead of hardcoding `false` for all permissions except `canViewDevices`
- Now uses the actual permission hooks (`canViewSites`, `canViewUserManagement`, etc.)
- These will automatically use AirQo group permissions thanks to the `usePermission` hook changes

## How It Works

### Scenario 1: User in Personal Context WITH AirQo Group

1. User is in `personal` context
2. No `activeGroup` is set (personal mode)
3. User calls `usePermission(PERMISSIONS.SITE.VIEW)`
4. Hook detects personal context without active group
5. Retrieves user's AirQo group using `permissionService.getAirQoGroup(user)`
6. Uses AirQo group as the `activeOrganization` for permission check
7. Permission service checks if the user's AirQo group role has `SITE.VIEW` permission
8. Returns `true` or `false` based on actual permissions

### Scenario 2: User in Personal Context WITHOUT AirQo Group

1. User is in `personal` context
2. No `activeGroup` is set
3. User has no AirQo group
4. Permission check falls through to default behavior
5. Returns `false` (no permissions without a group)

### Scenario 3: User in Organizational Context

1. User is in `airqo-internal` or `external-org` context
2. `activeGroup` is set
3. Permission checks use the `activeGroup` directly
4. No AirQo group fallback needed

## Benefits

1. **Consistent Permission Model**: Same RBAC system works across all contexts
2. **Flexibility**: Users can have different permissions in their AirQo group that apply to personal context
3. **No Hardcoding**: Permissions are data-driven, not hardcoded in the UI
4. **Backward Compatible**: Doesn't break existing behavior for organizational contexts
5. **Fine-Grained Control**: Admins can control what users can do in personal context via AirQo group roles

## Use Cases

This implementation enables scenarios like:

- **AirQo staff** with appropriate permissions can view sites even in personal mode
- **Admin users** can access user management features from personal context
- **Technical staff** can perform maintenance operations regardless of context
- **Analysts** can access data export features in personal mode

## Testing

To test this implementation:

1. **Create a user with AirQo group** that has specific permissions (e.g., `SITE.VIEW`)
2. **Switch to personal context**
3. **Check if permission-gated features** are accessible based on AirQo group permissions
4. **Verify permission checks** return correct values

Example:
```typescript
// In a component
const canViewSites = usePermission(PERMISSIONS.SITE.VIEW);
// In personal context, this will check the user's AirQo group permissions

// In a feature
{canViewSites && <SitesButton />}
// This button will show in personal mode if the user's AirQo group has SITE.VIEW
```

## Notes

- The `canViewDevices` permission is always `true` in personal context because users should always see their own devices
- Organizations-specific features (`canViewOrganizations`, `canViewNetworks`) remain `false` in personal context as they don't make sense there
- The implementation preserves all existing behavior for `airqo-internal` and `external-org` contexts
