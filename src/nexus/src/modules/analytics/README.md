# Analytics Module

This module provides a comprehensive analytics dashboard for air quality data visualization and management.

## Features

### 🎯 Core Components

- **AnalyticsCard**: Individual site air quality cards with status indicators
- **QuickAccessCard**: Main dashboard with site cards, filters, and actions
- **ChartWrapper**: Chart components for trends and distribution visualization
- **AnalyticsDashboard**: Complete dashboard layout combining all components

### 🎨 Air Quality Icons

Uses @airqo/icons-react for status indicators:

- `AqGood` - Good air quality (boundaries supplied by the AQI configuration API)
- `AqModerate` - Moderate air quality (boundaries supplied by the AQI configuration API)
- `AqUnhealthyForSensitiveGroups` - UHFSG (boundaries supplied by the AQI configuration API)
- `AqUnhealthy` - Unhealthy (boundaries supplied by the AQI configuration API)
- `AqVeryUnhealthy` - Very unhealthy (boundaries supplied by the AQI configuration API)
- `AqHazardous` - Hazardous (boundaries supplied by the AQI configuration API)
- `AqNoValue` - No data available

### 📊 Data Integration

- **useGetChartData**: Fetches chart data from analytics API
- **useGetRecentReadings**: Fetches recent air quality readings for specified sites
- **useUserPreferences**: Gets user's selected sites from preferences
- **Automatic Data Transformation**: Converts API responses to display format

## Usage

### Basic Dashboard

```tsx
import { AnalyticsDashboard } from '@/modules/analytics';

const MyAnalyticsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Air Quality Analytics</h1>
      <AnalyticsDashboard />
    </div>
  );
};
```

### Individual Components

```tsx
import {
  QuickAccessCard,
  ChartWrapper,
  useAnalyticsSiteCards,
  useAnalyticsPreferences,
} from '@/modules/analytics';

const CustomDashboard = () => {
  const { siteCards } = useAnalyticsSiteCards();
  const { selectedSiteIds } = useAnalyticsPreferences();

  const [filters, setFilters] = useState({
    timeframe: 'Daily',
    days: '7',
    pollutant: 'PM2.5',
  });

  return (
    <div className="space-y-6">
      <QuickAccessCard
        sites={siteCards}
        currentFilters={filters}
        onFilterChange={(filter, value) =>
          setFilters(prev => ({ ...prev, [filter]: value }))
        }
        onManageFavorites={() => console.log('Manage favorites')}
        onDownloadData={() => console.log('Download data')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper
          title="Air Pollution Trends Over Time"
          type="trends"
          selectedSites={selectedSiteIds}
          filters={filters}
        />

        <ChartWrapper
          title="Air Pollution Levels Distribution"
          type="distribution"
          selectedSites={selectedSiteIds}
          filters={filters}
        />
      </div>
    </div>
  );
};
```

### Site Cards Only

```tsx
import { AnalyticsCard } from '@/modules/analytics';

const siteData = {
  _id: '1',
  name: 'Kampala Central Division',
  location: 'Uganda',
  value: 33.56,
  status: 'moderate',
  pollutant: 'PM2.5',
  unit: 'μg/m³',
  trend: 'stable',
};

const MySiteCard = () => <AnalyticsCard siteData={siteData} />;
```

### Recent Readings Hook

```tsx
import { useGetRecentReadings } from '@/shared/hooks';

const RecentReadingsComponent = () => {
  const { trigger, data, error, isMutating } = useGetRecentReadings();

  const handleFetchReadings = async () => {
    try {
      const result = await trigger({
        site_id:
          '67b9f5fed094b20013179211,64d7bc75ed04f200139b5ffa,623d84340e8054001eaaaa13',
      });
      console.log('Recent readings:', result.measurements);
    } catch (err) {
      console.error('Error fetching readings:', err);
    }
  };

  return (
    <div>
      <button onClick={handleFetchReadings} disabled={isMutating}>
        {isMutating ? 'Loading...' : 'Get Recent Readings'}
      </button>

      {data && (
        <div>
          <h3>Readings ({data.measurements.length})</h3>
          {data.measurements.map(reading => (
            <div key={reading._id}>
              <p>Site: {reading.siteDetails.name}</p>
              <p>PM2.5: {reading.pm2_5.value} μg/m³</p>
              <p>AQI: {reading.aqi_category}</p>
            </div>
          ))}
        </div>
      )}

      {error && <p>Error: {error.message}</p>}
    </div>
  );
};
```

## Configuration

### Filter Options

```tsx
// Available timeframe options
const TIMEFRAME_OPTIONS = [
  { label: 'Daily', value: 'Daily' },
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Yearly', value: 'Yearly' },
];

// Available days options
const DAYS_OPTIONS = [
  { label: 'Last 7 days', value: '7' },
  { label: 'Last 14 days', value: '14' },
  { label: 'Last 30 days', value: '30' },
  { label: 'Last 90 days', value: '90' },
];

// Available pollutant options
const POLLUTANT_OPTIONS = [
  { label: 'PM2.5', value: 'PM2.5' },
  { label: 'PM10', value: 'PM10' },
  { label: 'NO2', value: 'NO2' },
  { label: 'O3', value: 'O3' },
];
```

### Air Quality Thresholds

AQI category boundaries and colors are fetched from `/devices/aqi-ranges` at runtime. The values below are historical documentation only; do not use them for classification or display.

- AQI category boundaries and colors are fetched from `/devices/aqi-ranges` at runtime.

## API Integration

### Chart Data Request

```tsx
const chartRequest = {
  sites: ['site1', 'site2'], // Selected site IDs
  startDate: '2025-10-12',
  endDate: '2025-10-19',
  chartType: 'line',
  frequency: 'daily',
  pollutant: 'pm2_5',
  organisation_name: '',
};
```

### User Preferences

The module automatically fetches user preferences to get selected sites:

```tsx
const preferences = {
  selected_sites: [
    {
      _id: '67aaf1696bb3cc001374cbc5',
      formatted_name: '8MVP+6F, Kampala, Uganda',
    },
    // ... more sites
  ],
};
```

## Styling

The module uses Tailwind CSS classes and is fully responsive. All components support custom className props for additional styling.

## Future Enhancements

- Real-time data updates
- Advanced chart interactions
- Export functionality for charts
- More pollutant types
- Historical data comparison
- Weather data integration

## Air Quality Rankings (`/user/air-quality/rankings`)

The African AQI leaderboard, powered by the device-registry rankings endpoints
(`GET /devices/readings/rankings` and `GET /devices/readings/rankings/history`).

- **Live rankings** — country or city leaderboard, worst/cleanest first, with
  configurable entry count. Each row shows rank, flag, average PM2.5, derived
  AQI index, a color-coded category badge (colored from the live AQI ranges
  config) and how many sites contributed. Locations only appear once they have
  a reading from the last 3 days.
- **Historical comparison** — year-by-year average PM2.5 per location
  (entities as rows, years as columns, capped at a 5-year span). Years with
  no usable data come back as `null` from the API and render as a grayed-out
  dash — never as clean air.

Data flows through `rankingsService` (token-authenticated via the
`/api/external` proxy — these endpoints reject user JWTs) and the
`useRankings` / `useRankingsHistory` react-query hooks.

## Air Quality Analytics (`/user/air-quality/analytics`)

A chart explorer for a group's monitoring locations:

- **Chart builder** — add as many charts as needed, each with its own
  locations, pollutant, frequency, custom date range and series color,
  persisted to the group's chart configurations
  (`/users/preferences/groups/:grp_id/charts`). Titles and subtitles are
  editable inline from the chart header; every chart exports as PDF/PNG and
  shows its own collapsible forecast via the air-quality map's `useForecast`
  service (`WeeklyForecastCard`).
- **Location picker** — multi-select from the group's cached Sites
  (`/devices/cohorts/cached-sites`) with server-side search and pagination.
  Each site row shows the device(s) deployed there (the payload embeds them),
  so the device name rides along with the site. Display names are always
  shown — raw ids never surface.
- **Trends view** — one tab hosting the chart workspace: a single active
  chart with its reference legend, saved-charts list and forecast summary
  ("Focus"), or every chart at once as a list/grid ("All charts") — the two
  are the same data in different layouts, toggled without leaving the tab.
- **Table view** — an unlimited location-comparison table (latest PM2.5/PM10
  per site, sortable, threshold-colored, with the shared AQI legend shown
  once at page level).
- **AQI legend** — the segmented AQI scale is rendered once per page from the
  live `/devices/aqi-ranges` config (the single source of truth) instead of
  being repeated on every chart.

## Dependencies

- React 18+
- @airqo/icons-react
- react-icons/hi
- date-fns
- SWR for data fetching
- Tailwind CSS for styling
