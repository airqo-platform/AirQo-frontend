# Analytics Dashboard

This folder contains the analytics functionality for the AirQo dashboard.

## Features

### Analytics Overview (`page.tsx`)
- Displays a table of AirQlouds with performance metrics
- Shows filters for date range, time inclusion, and item selection
- Allows creating new AirQlouds with or without device data

### AirQlouds Table (`airqlouds-table.tsx`)
- Interactive table showing all AirQlouds with performance data
- Includes mini-graphs showing 14-day uptime history
- Click on any row to navigate to detailed analytics
- Sortable by name, uptime, device count, and error margin
- Search functionality

### Detailed Analytics (`[id]/page.tsx`)
- Shows detailed information for a specific AirQloud
- **Summary Cards**: Total devices, average uptime, average error margin, data points
- **Interactive Charts**: 
  - Daily uptime trend (line chart)
  - Error margin trend (bar chart)
- **Device Performance Table**: Individual device metrics with uptime percentages and status badges

## API Integration

The analytics pages integrate with the AirQloud service API:
- `GET /airqlouds` - List all AirQlouds with performance data
- `GET /airqlouds/{id}?include_performance=true&performance_days=14` - Get detailed AirQloud data

### Expected API Response Structure

```json
{
  "id": "aq_967u90womy",
  "name": "Kisumu",
  "country": "Kenya",
  "is_active": true,
  "device_count": 15,
  "freq": [5, 14, 15, 16, ...], // Hourly readings per day
  "error_margin": [10.05, 7.37, 8.46, ...],
  "timestamp": ["2025-11-10T00:00:00+03:00", ...],
  "device_performance": [
    {
      "device_id": "6422a63ac95fc10029aa76a9",
      "performance": {
        "freq": [8, 13, 18, ...],
        "error_margin": [1.89, 2.48, 1.94, ...],
        "timestamp": ["2025-11-10T07:00:00+03:00", ...]
      }
    }
  ]
}
```

## Navigation

1. **Analytics Table** → Click any AirQloud row → **Detailed View**
2. **Detailed View** → Click "Back to Analytics" → **Analytics Table**

## Key Metrics

- **Uptime**: Calculated as `(freq / 24) * 100` representing percentage of hours with data
- **Error Margin**: Average of all error margin values over the period
- **Device Status**: 
  - Good (>80% uptime)
  - Fair (50-80% uptime) 
  - Poor (<50% uptime)