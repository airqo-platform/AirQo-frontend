# Air Quality Chart Components

A comprehensive, dynamic chart component system built with React, Recharts, and TypeScript for visualizing air quality data. This system provides reusable, responsive, and feature-rich chart components specifically designed for air quality monitoring applications.

## 🌟 Features

### Dynamic Chart Types

- **Auto-selection**: Automatically chooses the best chart type based on data characteristics
- **Manual override**: Support for specific chart type selection
- **Multiple types**: Line, Area, Bar, Scatter, Radar, and Pie charts
- **Optimized for time-series**: Specially designed for air quality temporal data

### Interactive Components

- **Custom tooltips**: Rich tooltips showing air quality levels with WHO standards
- **Interactive legends**: Toggle data series visibility with click interactions
- **Responsive design**: Adapts to all screen sizes and devices
- **Export functionality**: Export charts as PDF, PNG, or SVG

### Performance Optimizations

- **Memory leak prevention**: Proper cleanup and optimized re-rendering
- **Large dataset handling**: Efficient processing of thousands of data points
- **Data virtualization**: Automatic sampling for performance when needed
- **Debounced updates**: Smooth interactions without lag

### Air Quality Specific Features

- **WHO standards integration**: Color-coded air quality levels
- **Multi-site comparison**: Compare pollution levels across locations
- **Time-based analysis**: Trend analysis and temporal patterns
- **Real-time updates**: Support for live data streaming

## 📦 Installation

The chart components are already installed as part of the project. Required dependencies:

```bash
yarn add recharts@^3.2.1 react-icons@^5.5.0 html2canvas@^1.4.1 jspdf@^3.0.3
```

## 🚀 Quick Start

### Basic Usage

```tsx
import { DynamicChart, ChartContainer } from '@/shared/components/charts';

const MyAirQualityChart = () => {
  const data = [
    {
      site_id: 'site1',
      value: 21.38,
      time: '2025-03-14T00:00:00Z',
      generated_name: 'Donholm, Embakasi east, Nairobi',
      device_id: 'airqo-g5169',
      name: 'Donholm, Embakasi east, Nairobi',
    },
    // ... more data points
  ];

  return (
    <ChartContainer
      title="Air Quality Trends"
      subtitle="PM2.5 levels over time"
      onRefresh={() => console.log('Refresh data')}
    >
      <DynamicChart
        data={data}
        config={{
          type: 'line',
          dataKey: 'value',
          xAxisKey: 'time',
          height: 400,
        }}
        autoSelectType={true}
        responsive={true}
      />
    </ChartContainer>
  );
};
```

### Advanced Configuration

```tsx
import {
  useChartData,
  ChartContainer,
  DynamicChart,
} from '@/shared/components/charts';

const AdvancedChart = () => {
  const { normalizedData, loading, error, stats, refresh } = useChartData({
    data: rawApiData,
    autoRefresh: true,
    refreshInterval: 30000,
    enableAutoSelection: true,
  });

  return (
    <ChartContainer
      title="Advanced Air Quality Analysis"
      subtitle={`${stats.count} data points, avg: ${stats.avg.toFixed(1)} µg/m³`}
      loading={loading}
      error={error}
      onRefresh={refresh}
      onMoreInsights={() => showInsights()}
      onAirQualityStandards={() => showStandards()}
      exportOptions={{
        enablePDF: true,
        enablePNG: true,
        filename: 'air-quality-analysis',
      }}
    >
      <DynamicChart
        data={normalizedData}
        config={{
          type: 'area',
          dataKey: 'value',
          xAxisKey: 'time',
          height: 500,
          showGrid: true,
          showLegend: true,
          showTooltip: true,
          fillOpacity: 0.2,
          strokeWidth: 3,
        }}
        responsive={true}
      />
    </ChartContainer>
  );
};
```

## 🎨 Component API

### ChartContainer

A wrapper component that provides chart controls, export functionality, and consistent styling.

```tsx
interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  exportOptions?: {
    enablePDF?: boolean;
    enablePNG?: boolean;
    filename?: string;
  };
  onRefresh?: () => void;
  onMoreInsights?: () => void;
  onAirQualityStandards?: () => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
}
```

### DynamicChart

The main chart component that automatically adapts to different data types and sizes.

```tsx
interface DynamicChartProps {
  data: NormalizedChartData[];
  config?: Partial<ChartConfig>;
  autoSelectType?: boolean;
  responsive?: boolean;
  className?: string;
}
```

### Chart Configuration

```tsx
interface ChartConfig {
  type: ChartType; // 'line' | 'bar' | 'area' | 'scatter' | 'radar' | 'pie'
  title: string;
  subtitle?: string;
  dataKey: string;
  xAxisKey: string;
  yAxisKey?: string;
  color?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number;
  width?: number | string;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}
```

## 🎯 Data Format

### Input Data Format (API Response)

```tsx
interface AirQualityDataPoint {
  site_id: string;
  value: number; // PM2.5 value in µg/m³
  time: string; // ISO timestamp
  generated_name: string;
  device_id: string;
  name: string;
}
```

### Normalized Data Format (Internal)

The utility functions automatically convert API responses to the internal format:

```tsx
interface NormalizedChartData {
  time: string; // Formatted timestamp
  value: number; // Air quality value
  site: string; // Location name
  device_id: string;
  site_id?: string;
  rawTime?: string; // Original timestamp
  count?: number; // For aggregated data
}
```

## 🔧 Utility Functions

### Data Normalization

```tsx
import {
  normalizeAirQualityData,
  autoSelectChartType,
} from '@/shared/components/charts';

// Normalize API data
const normalizedData = normalizeAirQualityData(apiResponse.data);

// Auto-select optimal chart type
const chartType = autoSelectChartType(normalizedData);
```

### Data Processing

```tsx
import {
  filterDataByDateRange,
  aggregateDataByInterval,
  calculateDataStats,
  removeOutliers,
} from '@/shared/components/charts';

// Filter by date range
const filteredData = filterDataByDateRange(data, startDate, endDate);

// Aggregate by intervals
const hourlyData = aggregateDataByInterval(data, 'hour');
const dailyData = aggregateDataByInterval(data, 'day');

// Calculate statistics
const stats = calculateDataStats(data);

// Remove outliers
const cleanData = removeOutliers(data, 1.5);
```

## 🎨 Theming and Customization

The charts automatically adapt to your application's theme using CSS custom properties:

```css
:root {
  --primary: 20 95 255; /* Chart primary color */
  --muted-foreground: 100 116 139; /* Text colors */
  --border: 226 232 240; /* Grid and borders */
  --card: 255 255 255; /* Background colors */
}

.dark {
  --primary: 20 95 255;
  --muted-foreground: 148 163 184;
  --border: 51 65 85;
  --card: 15 23 42;
}
```

## 📱 Responsive Design

Charts automatically adapt to different screen sizes:

- **Mobile (< 480px)**: Simplified layouts, smaller text, compact legends
- **Tablet (480px - 768px)**: Balanced sizing, medium complexity
- **Desktop (> 768px)**: Full features, optimal spacing

## 🚀 Performance Features

### Automatic Optimization

- **Data sampling**: Large datasets are automatically sampled for performance
- **Lazy rendering**: Charts render only when visible
- **Debounced updates**: Smooth interactions without excessive re-renders
- **Memory management**: Proper cleanup prevents memory leaks

### Performance Hooks

```tsx
import { useChartPerformance } from '@/shared/components/charts';

const { optimizedData, isOptimizing, optimizeData } = useChartPerformance({
  dataThreshold: 1000,
  debounceMs: 300,
});
```

## 🌍 Air Quality Standards

Built-in support for WHO Air Quality Guidelines:

- **Good**: 0-12 µg/m³ (Green)
- **Moderate**: 12-35 µg/m³ (Yellow)
- **Unhealthy for Sensitive Groups**: 35-55 µg/m³ (Orange)
- **Unhealthy**: 55-150 µg/m³ (Red)
- **Very Unhealthy**: 150-250 µg/m³ (Purple)
- **Hazardous**: 250+ µg/m³ (Maroon)

## 📊 Export Features

Charts can be exported in multiple formats:

### PDF Export

- High-quality vector graphics
- Automatic page layout
- Includes title and timestamp
- Suitable for reports

### PNG Export

- Raster format for presentations
- Configurable quality and dimensions
- Transparent backgrounds supported

### SVG Export (Coming Soon)

- Vector graphics for web use
- Scalable without quality loss
- Smallest file size

## 🔍 Showcase Page

Visit `/user/charts` to see all chart components in action with:

- **Interactive controls**: Change chart types and data scenarios
- **Live statistics**: Real-time data analysis
- **Export testing**: Try different export formats
- **Responsive preview**: See how charts adapt to screen sizes

## 🛠️ Development

### Project Structure

```
src/shared/components/charts/
├── components/
│   ├── charts/
│   │   └── DynamicChart.tsx      # Main chart component
│   ├── ui/
│   │   ├── CustomTooltip.tsx     # Enhanced tooltips
│   │   └── CustomLegend.tsx      # Interactive legends
│   └── ChartContainer.tsx        # Chart wrapper with controls
├── hooks/
│   ├── useChartData.ts           # Data management
│   └── useChartExport.ts         # Export functionality
├── utils/
│   └── index.ts                  # Data processing utilities
├── constants/
│   └── index.ts                  # Configuration and standards
├── types/
│   └── index.ts                  # TypeScript definitions
└── index.ts                      # Public API exports
```

### Adding New Chart Types

1. Update the `ChartType` union in `types/index.ts`
2. Add rendering logic in `DynamicChart.tsx`
3. Update auto-selection algorithm in `utils/index.ts`
4. Add configuration options if needed

### Best Practices

- Always use the `useChartData` hook for data management
- Implement proper error boundaries for chart components
- Use the `ChartContainer` wrapper for consistent UX
- Test with large datasets to ensure performance
- Provide loading and error states

## 📚 Examples

Check the showcase page at `/user/charts` for comprehensive examples including:

- Time-series trends analysis
- Multi-site comparison charts
- Real-time monitoring dashboards
- Distribution analysis
- Performance optimization demos

## 🐛 Troubleshooting

### Common Issues

**Charts not rendering**: Ensure data is properly normalized using `normalizeAirQualityData`

**Performance issues**: Use the `useChartPerformance` hook for large datasets

**Export not working**: Check that the chart container has proper `ref` assignment

**Type errors**: Ensure you're using the correct data interfaces

### Debug Mode

Enable debug logging by setting:

```tsx
const chartConfig = {
  // ... other config
  debug: true, // Enable debug logging
};
```

## 📄 License

This chart component system is part of the AirQo platform and follows the project's licensing terms.

---

Built with ❤️ for better air quality monitoring and visualization.
