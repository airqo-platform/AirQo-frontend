# Admin Layout Hierarchy

## Visual Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    Root Layout                                   │
│                  (app/layout.tsx)                                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              Authenticated Layout                                │
│          (app/(authenticated)/layout.tsx)                        │
│                                                                  │
│  - MainLayout with Sidebar                                      │
│  - Navigation                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
            ┌───────────────┴───────────────┐
            │                               │
            ▼                               ▼
┌───────────────────────┐      ┌───────────────────────────────┐
│   Regular Pages       │      │      Admin Layout             │
│                       │      │  (app/(authenticated)/admin/  │
│  /home                │      │       layout.tsx)             │
│  /devices             │      │                               │
│  /sites               │      │  ┌─────────────────────────┐  │
│  /cohorts             │      │  │    RouteGuard           │  │
│  etc.                 │      │  │                         │  │
│                       │      │  │  roles:                 │  │
│  (No admin guard)     │      │  │   - AIRQO_SUPER_ADMIN   │  │
└───────────────────────┘      │  │  contexts:              │  │
                               │  │   - airqo-internal      │  │
                               │  └─────────────────────────┘  │
                               │              │                │
                               │              ▼                │
                               │  ┌──────────────────────────┐│
                               │  │    Admin Pages           ││
                               │  │                          ││
                               │  │  /admin/networks         ││
                               │  │  /admin/shipping         ││
                               │  │  /admin/*                ││
                               │  │                          ││
                               │  │  (All automatically      ││
                               │  │   protected)             ││
                               │  └──────────────────────────┘│
                               └───────────────────────────────┘
```

## Request Flow

```
User navigates to /admin/networks
         │
         ▼
┌──────────────────────┐
│ Root Layout renders  │
└──────────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Authenticated Layout     │
│ renders                  │
│ (MainLayout + Sidebar)   │
└──────────────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Admin Layout renders     │
│                          │
│ RouteGuard checks:       │
│ ✓ Is user logged in?     │
│ ✓ Role = SUPER_ADMIN?    │
│ ✓ Context = airqo?       │
└──────────────────────────┘
         │
    ┌────┴────┐
    │         │
   Yes        No
    │         │
    ▼         ▼
┌────────┐  ┌──────────────┐
│ Render │  │ Show Error   │
│ Page   │  │ or Redirect  │
└────────┘  └──────────────┘
```

## Component Wrapping Order

```jsx
<RootLayout>
  <AuthenticatedLayout>
    <MainLayout>
      {/* Regular pages render here */}
      <HomePage />
      
      {/* OR */}
      
      <AdminLayout>
        <RouteGuard roles={["AIRQO_SUPER_ADMIN"]} allowedContexts={['airqo-internal']}>
          {/* Admin pages render here */}
          <NetworksPage />
          <ShippingPage />
        </RouteGuard>
      </AdminLayout>
    </MainLayout>
  </AuthenticatedLayout>
</RootLayout>
```

## Access Control Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Authentication (Handled by NextAuth)               │
│ • Must be logged in to access /admin/*                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Role Check (Admin Layout)                          │
│ • Must have AIRQO_SUPER_ADMIN role                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Context Check (Admin Layout)                       │
│ • Must be in 'airqo-internal' context                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Page-Specific Checks (Optional)                    │
│ • Individual pages can add additional RouteGuards           │
│ • Example: Specific permissions for sensitive operations    │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure with Protection Status

```
app/(authenticated)/
│
├── layout.tsx                    [Protected: Authenticated only]
│
├── home/
│   └── page.tsx                  [Protected: Authenticated only]
│
├── devices/
│   └── page.tsx                  [Protected: Authenticated only]
│
├── sites/
│   └── page.tsx                  [Protected: Authenticated only]
│
└── admin/                        [Protected: Authenticated only]
    │
    ├── layout.tsx                [ADDS: Role + Context check]
    │                             ↑
    │                             └─ RouteGuard for AIRQO_SUPER_ADMIN
    │
    ├── networks/
    │   └── page.tsx              [Protected: Auth + Role + Context]
    │                             (via layout inheritance)
    │
    └── shipping/
        └── page.tsx              [Protected: Auth + Role + Context]
                                  (via layout inheritance)
```

## Before vs After

### Before (Individual Protection)
```
networks/page.tsx:
┌────────────────────────────┐
│ RouteGuard                 │
│   roles={["SUPER_ADMIN"]}  │
│   contexts={['airqo']}     │
│   └─ <NetworksPage />      │
└────────────────────────────┘

shipping/page.tsx:
┌────────────────────────────┐
│ No protection              │
│ └─ <ShippingPage />        │
└────────────────────────────┘
❌ Inconsistent protection
❌ Copy-paste code duplication
```

### After (Layout Protection)
```
admin/layout.tsx:
┌────────────────────────────┐
│ RouteGuard                 │
│   roles={["SUPER_ADMIN"]}  │
│   contexts={['airqo']}     │
│   └─ {children}            │
└────────────────────────────┘
        │
        ├── networks/page.tsx
        │   └─ <NetworksPage />    ✅ Protected by layout
        │
        └── shipping/page.tsx
            └─ <ShippingPage />    ✅ Protected by layout

✅ Consistent protection
✅ Single source of truth
✅ DRY principle
```

## Adding Protection to New Pages

### Option 1: Use Admin Layout (Recommended for admin features)
```
1. Create page in admin directory
   app/(authenticated)/admin/my-feature/page.tsx

2. Write page code (no RouteGuard needed)
   export default function MyFeaturePage() {
     return <div>My Feature</div>
   }

3. Done! ✅ Automatically protected by admin layout
```

### Option 2: Custom Protection (For specific requirements)
```
1. Create page anywhere
   app/(authenticated)/my-feature/page.tsx

2. Add custom RouteGuard
   export default function MyFeaturePage() {
     return (
       <RouteGuard permission={PERMISSIONS.CUSTOM}>
         <div>My Feature</div>
       </RouteGuard>
     )
   }
```

## Key Takeaways

1. **Admin layout = Central protection** for all admin pages
2. **Automatic inheritance** by all pages in admin directory
3. **No code duplication** across admin pages
4. **Easy to modify** access rules in one place
5. **Consistent security** across all admin features
