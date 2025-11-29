# Admin Section

This directory contains all admin-only pages and features for the AirQo platform.

## Access Control

All pages within this directory are automatically protected by the **admin layout** (`layout.tsx`), which enforces the following access requirements:

### Required Access
- **Role**: `AIRQO_SUPER_ADMIN`
- **Context**: `airqo-internal`

Users who don't meet these requirements will see an access denied page or be redirected.

## Layout Structure

```
app/(authenticated)/admin/
├── layout.tsx           ← Centralized RouteGuard for all admin pages
├── networks/
│   └── page.tsx        ← Networks management
└── shipping/
    └── page.tsx        ← Device shipping management
```

## Adding New Admin Pages

When creating new admin pages, simply place them in subdirectories within this `admin` folder:

```tsx
// app/(authenticated)/admin/new-feature/page.tsx

"use client";

export default function NewFeaturePage() {
  // No need to add RouteGuard here!
  // The layout.tsx automatically protects this page
  return (
    <div>
      <h1>New Admin Feature</h1>
      <p>Only AIRQO_SUPER_ADMIN users can see this</p>
    </div>
  );
}
```

**Important**: Do NOT add individual `RouteGuard` wrappers in your pages unless you need additional, more specific access restrictions. The layout handles the base admin access control.

## Customizing Access for Specific Pages

If a specific admin page needs different access requirements, you can add an additional `RouteGuard` inside that page:

```tsx
// app/(authenticated)/admin/special-feature/page.tsx

"use client";

import { RouteGuard } from "@/components/layout/accessConfig/route-guard";

export default function SpecialFeaturePage() {
  return (
    <RouteGuard 
      permission={PERMISSIONS.SPECIAL.FEATURE}
      // This is IN ADDITION to the admin layout requirements
    >
      <div>
        <h1>Special Feature</h1>
        <p>Requires both AIRQO_SUPER_ADMIN role AND SPECIAL.FEATURE permission</p>
      </div>
    </RouteGuard>
  );
}
```

## Current Admin Features

### 1. Networks Management (`/admin/networks`)
- Create, view, and manage networks
- Paginated network listing
- Network creation form

### 2. Shipping Management (`/admin/shipping`)
- Device shipping status tracking
- Bulk device preparation for shipping
- Shipping label generation
- Claim token management

## Security Notes

1. **Client-side Protection**: The RouteGuard provides client-side access control. Ensure all API endpoints also validate user permissions server-side.

2. **Context Awareness**: Admin features are only accessible in the `airqo-internal` context. Users must be in this context to access admin pages.

3. **Role Hierarchy**: Currently only `AIRQO_SUPER_ADMIN` can access admin features. If you need to grant access to other roles, modify the `layout.tsx` file.

## Modifying Admin Access Control

To change who can access admin features, edit the `layout.tsx` file:

```tsx
// To allow multiple roles:
<RouteGuard 
  roles={["AIRQO_SUPER_ADMIN", "AIRQO_ADMIN"]}
  allowedContexts={['airqo-internal']}
>
  {children}
</RouteGuard>

// To use permission instead of role:
<RouteGuard 
  permission={PERMISSIONS.SYSTEM.ADMIN}
  allowedContexts={['airqo-internal']}
>
  {children}
</RouteGuard>

// To allow admin access in any context:
<RouteGuard 
  roles={["AIRQO_SUPER_ADMIN"]}
>
  {children}
</RouteGuard>
```

## Best Practices

1. **Don't duplicate protection**: Since the layout already protects all admin pages, avoid adding redundant `RouteGuard` wrappers in individual pages.

2. **Consistent naming**: Keep page directories lowercase and use kebab-case (e.g., `device-management`, not `DeviceManagement`).

3. **Self-contained features**: Each admin feature should be in its own subdirectory with a `page.tsx` file.

4. **Error handling**: Ensure your pages handle loading and error states gracefully.

5. **Documentation**: Update this README when adding new admin features.
