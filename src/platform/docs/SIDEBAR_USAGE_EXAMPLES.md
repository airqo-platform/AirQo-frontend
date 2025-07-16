# SidebarItem Usage Examples

This document demonstrates the new simplified usage patterns for the SidebarItem component.

## New Simplified Usage (Recommended)

### Simple String Matcher

For basic route matching, use a simple string:

```jsx
<SidebarItem
  label="Admin Panel"
  navPath="/admin/users"
  matcher="/admin/users"
  Icon={AdminIcon}
/>
```

### Object Matcher with Options

For advanced matching with organization slugs or specific behavior:

```jsx
<SidebarItem
  label="Organization Dashboard"
  navPath="/org/{slug}/dashboard"
  matcher={{
    pattern: '/org/{slug}/dashboard',
    orgSlug: 'acme',
    exact: false,
    includeSubroutes: true,
  }}
  Icon={DashboardIcon}
  subroutes={[
    { label: 'Team', path: '/org/{slug}/dashboard/team' },
    { label: 'Settings', path: '/org/{slug}/dashboard/settings' },
  ]}
/>
```

### Exact Route Matching

When you want exact route matching (no sub-path matching):

```jsx
<SidebarItem
  label="Home"
  navPath="/home"
  matcher={{
    pattern: '/home',
    exact: true,
  }}
  Icon={HomeIcon}
/>
```

## Legacy Usage (Still Supported)

### User Flow

```jsx
<SidebarItem
  label="Dashboard"
  navPath="/user/dashboard"
  flow="user"
  subroutes={[
    { label: 'Analytics', path: '/user/dashboard/analytics' },
    { label: 'Reports', path: '/user/dashboard/reports' },
  ]}
/>
```

### Organization Flow

```jsx
<SidebarItem
  label="Organization Dashboard"
  navPath="/org/{slug}/dashboard"
  flow="organization"
  orgSlug="acme"
  subroutes={[
    { label: 'Team', path: '/org/{slug}/dashboard/team' },
    { label: 'Settings', path: '/org/{slug}/dashboard/settings' },
  ]}
/>
```

### Generic Flow

```jsx
<SidebarItem
  label="Admin Panel"
  navPath="/admin/users"
  flow="generic"
  subroutes={[
    { label: 'User Management', path: '/admin/users/manage' },
    { label: 'Permissions', path: '/admin/users/permissions' },
  ]}
/>
```

## Matcher Object Properties

| Property           | Type      | Default     | Description                              |
| ------------------ | --------- | ----------- | ---------------------------------------- |
| `pattern`          | `string`  | `navPath`   | The route pattern to match against       |
| `exact`            | `boolean` | `false`     | Whether to match exactly (no sub-paths)  |
| `includeSubroutes` | `boolean` | `true`      | Whether to check subroutes for matching  |
| `orgSlug`          | `string`  | `undefined` | Organization slug for {slug} replacement |
| `type`             | `string`  | `'simple'`  | Matcher type (for internal use)          |

## Benefits of the New Approach

1. **Simplified API**: Just use the `matcher` prop instead of multiple props
2. **Better Performance**: Reduced prop drilling and memoization
3. **Backwards Compatible**: Legacy usage still works
4. **More Flexible**: String or object-based matching
5. **Self-Documenting**: Clear intent with matcher patterns

## Migration Guide

### From Legacy to New API

**Before:**

```jsx
<SidebarItem
  label="Organization Dashboard"
  navPath="/org/{slug}/dashboard"
  flow="organization"
  orgSlug="acme"
/>
```

**After:**

```jsx
<SidebarItem
  label="Organization Dashboard"
  navPath="/org/{slug}/dashboard"
  matcher={{
    pattern: '/org/{slug}/dashboard',
    orgSlug: 'acme',
  }}
/>
```

**Or even simpler for basic cases:**

```jsx
<SidebarItem
  label="Admin Panel"
  navPath="/admin/users"
  matcher="/admin/users"
/>
```
