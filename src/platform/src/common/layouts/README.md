# Layout System Documentation

## Overview

This directory contains the dynamic layout system for the AirQo Analytics platform. The layouts are organized using Next.js App Router route groups to provide different layout behaviors for different types of pages.

## Route Groups Structure

### 1. Dashboard Group `(dashboard)`

- **Routes**: `/Home`, `/analytics`, `/settings`, `/collocation/*`
- **Layout**: `DashboardLayout.jsx`
- **Features**:
  - Full sidebar navigation
  - Top navigation bar
  - Dynamic page titles and search functionality
  - Theme customization support

### 2. Auth Group `(auth)`

- **Routes**: `/account/*` (login, creation, forgotPwd)
- **Layout**: `AuthLayout.jsx`
- **Features**:
  - No sidebar
  - Minimal layout for authentication flows
  - Custom page titles for each auth page

### 3. Map Route

- **Routes**: `/map`
- **Layout**: `MapLayout.jsx`
- **Features**:
  - Specialized layout for map display
  - Full-screen capability
  - Custom topbar configuration

## Layout Components

### DashboardLayout

Located: `./DashboardLayout.jsx`

Provides the main application layout with sidebar, topbar, and content area. Automatically configures:

- Page titles
- Topbar titles
- Search functionality
- Border styling

### AuthLayout

Located: `./AuthLayout.jsx`

Minimal layout for authentication pages. Handles:

- Page meta information
- Clean layout without navigation elements

### MapLayout

Located: `./MapLayout.jsx`

Specialized layout for the map page with:

- Map-specific topbar configuration
- Search functionality enabled
- Optimized for map display

## Configuration System

### Layout Configurations

Located: `./layoutConfigs.js`

Centralized configuration for all layout properties:

```javascript
LAYOUT_CONFIGS = {
  DASHBOARD: {
    '/Home': {
      pageTitle: 'Home - AirQo Analytics',
      topbarTitle: 'Home',
      noBorderBottom: true,
      showSearch: false,
      noTopNav: false,
    },
    // ... more routes
  },
  AUTH: {
    /* auth configurations */
  },
  MAP: {
    /* map configurations */
  },
};
```

### Adding New Routes

1. **Dashboard Routes**: Add to `LAYOUT_CONFIGS.DASHBOARD` in `layoutConfigs.js`
2. **Auth Routes**: Add to `LAYOUT_CONFIGS.AUTH` in `layoutConfigs.js`
3. **Map Routes**: Add to `LAYOUT_CONFIGS.MAP` in `layoutConfigs.js`

### Configuration Properties

#### Dashboard/Map Layout Properties:

- `pageTitle`: Browser tab title
- `topbarTitle`: Title shown in the top navigation
- `noBorderBottom`: Whether to show border under topbar
- `showSearch`: Enable/disable search functionality
- `noTopNav`: Hide/show top navigation

#### Auth Layout Properties:

- `pageTitle`: Browser tab title
- `rightText`: Helper text for auth pages
- `sideBackgroundColor`: Background color for auth pages

## Usage Examples

### Creating a New Dashboard Page

1. Create your page component in `src/app/(dashboard)/your-route/page.jsx`
2. Add configuration to `layoutConfigs.js`:

```javascript
LAYOUT_CONFIGS.DASHBOARD['/your-route'] = {
  pageTitle: 'Your Page - AirQo Analytics',
  topbarTitle: 'Your Page',
  noBorderBottom: false,
  showSearch: true,
  noTopNav: false,
};
```

### Creating a New Auth Page

1. Create your page component in `src/app/(auth)/account/your-auth-page/page.jsx`
2. Add configuration to `layoutConfigs.js`:

```javascript
LAYOUT_CONFIGS.AUTH['/account/your-auth-page'] = {
  pageTitle: 'Your Auth Page - AirQo Analytics',
  rightText: 'Description for your auth page',
  sideBackgroundColor: 'bg-blue-50 dark:bg-[#252627]',
};
```

## File Structure

```
src/common/layouts/
├── index.js              # Exports all layout components
├── layoutConfigs.js      # Centralized configuration
├── DashboardLayout.jsx   # Main dashboard layout
├── AuthLayout.jsx        # Authentication layout
├── MapLayout.jsx         # Map-specific layout
└── README.md            # This documentation
```

## Best Practices

1. **Always use the centralized configuration** instead of hardcoding layout properties
2. **Keep route configurations organized** by layout type
3. **Use descriptive page titles** that include "AirQo Analytics"
4. **Test layouts** across different screen sizes
5. **Update documentation** when adding new layout types or configurations

## Migration Notes

This layout system replaces the previous approach where each page individually configured the Layout component. The new system provides:

- Better maintainability through centralized configuration
- Consistent layout behavior across route groups
- Easier addition of new pages and routes
- Clear separation of concerns between layout types
