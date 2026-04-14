# Air Quality Billboard - Complete Documentation

## Overview

The Air Quality Billboard is a specialized display system optimized for large screens, public billboards, and 24/7 monitoring displays. It provides real-time air quality data with a clean, professional interface designed for viewing from a distance.

## Features

### ✅ Display Features

- **Large PM2.5 Values**: Color-coded display optimized for distance viewing
- **Air Quality Icons**: Visual indicators (Good, Moderate, Unhealthy, etc.)
- **7-Day Forecast**: Daily air quality predictions
- **QR Code**: For mobile device access
- **Location Information**: Device names (cohort) or site names (grid)
- **Auto-rotation**: Cycles through multiple locations (optional)
- **Real-time Updates**: Measurements refresh every 20 seconds

### ✅ Technical Features

- **Dynamic Routing**: URL-based configuration
- **Skeleton Loaders**: Professional loading states
- **Responsive Design**: Adapts to different screen sizes
- **TypeScript**: Full type safety
- **Next.js 13+**: App Router with Server Components
- **Accessibility**: Proper semantic HTML and ARIA attributes

## URL Structure

### Cohort Routes

#### Random Cohort Display (Auto-rotation)

```text
/billboard/cohort
```

- Displays air quality data from random cohorts
- Auto-rotates through all available cohorts every 20 seconds
- All controls hidden (dropdown and type selector)

#### Specific Cohort Display

```text
/billboard/cohort/{name}
```

- Displays air quality data for a specific cohort device
- `{name}` = device name (e.g., `airqo_g5429`)
- No auto-rotation (stays on specified device)
- All controls hidden

**Examples:**

```text
/billboard/cohort/airqo_g5429
/billboard/cohort/epic_lagos_unilag
```

### Grid Routes

#### Random Grid Display (Auto-rotation)

```text
/billboard/grid
```

- Displays air quality data from random grids
- Auto-rotates through all available grids every 20 seconds
- All controls hidden

#### Specific Grid Display

```text
/billboard/grid/{name}
```

- Displays air quality data for a specific grid location
- `{name}` = grid location name
- No auto-rotation (stays on specified location)
- All controls hidden

**Examples:**

```text
/billboard/grid/kampala_central
/billboard/grid/nairobi_cbd
```

## Setup Guide

### For Public Billboards (Multiple Locations)

1. **Choose Your Route**

   ```text
   /billboard/cohort  (for device monitoring)
   /billboard/grid    (for location monitoring)
   ```

2. **Open in Browser**
   - Navigate to the URL
   - Press F11 for fullscreen mode
   - Let it auto-rotate through locations

3. **Browser Settings**
   - Disable sleep mode
   - Set auto-refresh (recommended: every 30 minutes)
   - Disable browser toolbars and address bar

### For Dedicated Location Display

1. **Get the Exact Name**
   - For cohort: Use device name (e.g., `airqo_g5429`)
   - For grid: Use location name (e.g., `kampala_central`)

2. **Build the URL**

   ```text
   /billboard/cohort/airqo_g5429
   /billboard/grid/kampala_central
   ```

3. **Deploy**
   - Open URL in browser
   - Press F11 for fullscreen
   - Display stays on that location

## Name Matching

The system intelligently matches URL names with API data:

### Flexible Formatting

These all work for the same location:

```text
epic_lagos_unilag
Epic_Lagos_UniLag
epic-lagos-unilag
Epic Lagos UniLag
EPIC LAGOS UNILAG
```

### How It Works

1. URL name is decoded
2. Converted to lowercase
3. Underscores, hyphens, and spaces removed
4. Matched against normalized API data

### Important Notes

#### For Cohort

- Device names shown **as-is** (e.g., `airqo_g5429`)
- No capitalization or formatting applied
- Underscores preserved
- Uses modem icon (AqModem02)

#### For Grid

- Location names are formatted (e.g., "Kampala Central")
- Capitalized and spaces added
- Uses location pin icon

## Component Architecture

### File Structure

```
src/
├── app/
│   └── billboard/
│       ├── cohort/
│       │   ├── page.tsx                    # Random cohort
│       │   └── [name]/
│       │       └── page.tsx                # Specific cohort
│       └── grid/
│           ├── page.tsx                    # Random grid
│           └── [name]/
│               └── page.tsx                # Specific grid
├── components/
│   ├── sections/
│   │   ├── AirQualityBillboard.tsx        # Main component
│   │   └── index.ts                       # Exports
│   └── skeletons/
│       └── BillboardSkeleton.tsx          # Loading state
└── utils/
    └── airQuality.ts                      # Color utilities
```

### Component Props

```typescript
interface AirQualityBillboardProps {
  className?: string; // Additional CSS classes
  hideControls?: boolean; // Hide dropdown and type selector
  autoRotate?: boolean; // Enable automatic rotation
  dataType?: 'cohort' | 'grid'; // Type of data to display
  itemName?: string; // Specific item name to display
}
```

### Usage Examples

```tsx
// Random cohort with auto-rotation
<AirQualityBillboard
  hideControls={true}
  autoRotate={true}
  dataType="cohort"
/>

// Specific device (no rotation)
<AirQualityBillboard
  hideControls={true}
  autoRotate={false}
  dataType="cohort"
  itemName="airqo_g5429"
/>

// Random grid with auto-rotation
<AirQualityBillboard
  hideControls={true}
  autoRotate={true}
  dataType="grid"
/>

// Specific location (no rotation)
<AirQualityBillboard
  hideControls={true}
  autoRotate={false}
  dataType="grid"
  itemName="kampala_central"
/>
```

## Color System

The billboard uses the utility functions from `@/utils/airQuality` for consistent coloring:

### Air Quality Colors

```typescript
{
  good: '#34C759',                        // Green
  moderate: '#ffd633',                    // Yellow
  'unhealthy-sensitive-groups': '#FF851F', // Orange
  unhealthy: '#F7453C',                   // Red
  'very-unhealthy': '#AC5CD9',            // Purple
  hazardous: '#D95BA3',                   // Pink
  'no-value': '#6B7280'                   // Gray
}
```

### Text Contrast

- **Good & Moderate**: Black text on light backgrounds
- **All Others**: White text on dark backgrounds

This ensures optimal readability on all air quality levels.

## Data Flow

```
┌─────────────────┐
│   URL Parameter │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Next.js Params │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Component Props │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Data Fetch    │  ← SWR Hooks
│  (Cohort/Grid)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Name Matching  │  ← Normalized comparison
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Display Data    │  ← PM2.5, forecast, etc.
└─────────────────┘
```

## Auto-Rotation Behavior

### When Auto-Rotation is Active

- Interval: 20 seconds per location
- Applies to: `/billboard/cohort` and `/billboard/grid`
- Measurement refresh: Every 20 seconds

### When Auto-Rotation is Disabled

- Applies to: Specific location URLs (with `{name}`)
- Display stays on selected location
- Measurement still refreshes every 20 seconds

## Loading States

### Skeleton Loader

- Professional animated loading state
- Matches the actual billboard layout
- Centered on individual pages
- Inline on listing pages

### When It Appears

- Initial page load
- When fetching measurement data
- During Suspense boundaries

## Best Practices

### For Development

1. **Type Safety**
   - Use TypeScript interfaces
   - Proper null/undefined checks
   - Type imports from `@/types`

2. **Performance**
   - Cleanup intervals on unmount
   - Use `useCallback` for functions
   - Proper dependency arrays

3. **Accessibility**
   - Semantic HTML
   - Proper ARIA labels
   - Keyboard navigation support

### For Deployment

1. **Browser Setup**
   - Use Chrome or Edge in kiosk mode
   - Disable power saving
   - Auto-start on system boot

2. **Display Settings**
   - 1920x1080 minimum resolution
   - Landscape orientation
   - Auto-brightness disabled

3. **Network**
   - Stable internet connection
   - Firewall rules for API access
   - Fallback to cached data

## Troubleshooting

### Issue: Name Not Found

**Solution:**

1. Check exact device/location name from API
2. Ensure proper URL encoding
3. Verify data type (cohort vs grid)

### Issue: Not Rotating

**Solution:**

1. Verify you're using the base URL (`/billboard/cohort`, not `/billboard/cohort/name`)
2. Check `autoRotate` prop is true
3. Ensure data is loading successfully

### Issue: Colors Look Wrong

**Solution:**

1. Clear browser cache
2. Verify utility imports
3. Check PM2.5 value ranges

### Issue: Skeleton Not Centered

**Solution:**

1. Ensure `centered={true}` on individual pages
2. Check Suspense boundary placement
3. Verify parent container styles

## API Integration

### Required Data

- **Cohorts**: Device details, measurements
- **Grids**: Site details, measurements
- **Forecast**: 7-day predictions

### SWR Hooks Used

```typescript
useCohortsSummary(); // List all cohorts
useCohortMeasurements(); // Get cohort data
useGridsSummary(); // List all grids
useGridMeasurements(); // Get grid data
useDailyForecast(); // Get forecast
```

### Data Refresh

- Auto-revalidation via SWR
- Measurement rotation: 30 seconds
- Location rotation: 20 seconds (when enabled)

## Keyboard Shortcuts (for testing)

When controls are visible:

- **Tab**: Navigate between elements
- **Enter/Space**: Activate buttons
- **Arrow keys**: Navigate dropdown (when open)

## Browser Compatibility

### Supported

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

### Optimized For

- Chrome (recommended for billboards)
- Large displays (1920x1080+)
- 24/7 continuous operation

## Maintenance

### Regular Tasks

1. **Weekly**: Check display for correct operation
2. **Monthly**: Clear browser cache
3. **Quarterly**: Update browser version
4. **Annually**: Review and update QR code

### Monitoring

- Check measurement refresh is working
- Verify API connectivity
- Monitor browser memory usage
- Check display brightness/contrast

## Support

For issues or questions:

1. Check this documentation
2. Review error logs in browser console
3. Verify API endpoint accessibility
4. Contact AirQo platform team

---

**Last Updated**: January 2026  
**Version**: 1.0  
**Compatibility**: Next.js 13+, React 18+
