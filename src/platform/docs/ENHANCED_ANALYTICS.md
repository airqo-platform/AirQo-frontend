# Enhanced Analytics Implementation

## Overview

This document describes the comprehensive analytics implementation for the AirQo Platform. The enhanced analytics system tracks user interactions at a granular level to facilitate data-driven decision making and support research findings.

## Analytics Tools

### 1. PostHog Analytics

- **Purpose**: Primary analytics platform for detailed user behavior tracking
- **Configuration**: See `src/shared/providers/posthog-provider.tsx`
- **Environment Variables**:
  - `NEXT_PUBLIC_POSTHOG_KEY`: Your PostHog project API key
  - `NEXT_PUBLIC_POSTHOG_HOST`: PostHog instance URL (default: https://us.posthog.com)

### 2. Google Analytics 4 (GA4)

- **Purpose**: Secondary analytics for broader analytics ecosystem integration
- **Tracking ID**: `G-CGRVG9F59K`
- **Configuration**: See `src/app/layout.tsx` and `src/shared/providers/google-analytics-provider.tsx`

## Tracked Events

### Location Selection Events

Tracks when users select locations across the platform:

- **Event**: `location_selected`
- **Properties**:
  - `location_id_hashed`: Anonymized location identifier
  - `location_name`: Human-readable location name
  - `city`: City name
  - `country`: Country name
  - `source`: Where the selection occurred (map, favorites, search, suggestions, insights)
  - `timestamp`: ISO timestamp

**Use Cases**:

- Identify most viewed locations
- Understand location discovery patterns
- Analyze geographic interest distribution

### Data Download Events

Tracks comprehensive details about data export operations:

- **Event**: `data_downloaded`
- **Properties**:
  - `data_type`: calibrated or raw
  - `file_type`: csv or json
  - `frequency`: hourly, daily, or monthly
  - `pollutants`: Array of selected pollutants
  - `pollutant_count`: Number of pollutants selected
  - `location_count`: Number of locations included
  - `device_count`: Number of devices (if applicable)
  - `start_date`: Data range start (ISO format)
  - `end_date`: Data range end (ISO format)
  - `duration_days`: Length of data range in days
  - `device_category`: lowcost or reference
  - `source`: sites, devices, countries, or cities
  - `timestamp`: ISO timestamp

**Use Cases**:

- Identify preferred data formats and frequencies
- Understand typical date range selections
- Analyze most requested pollutants
- Track data usage patterns by time period

### Map Interactions

Tracks user engagement with the map interface:

- **Event**: `map_interaction`
- **Properties**:
  - `action`: zoom, pan, marker_click, cluster_expand, filter_apply
  - `location_id_hashed`: Anonymized location ID (for marker clicks)
  - `zoom_level`: Current map zoom level
  - `filter_type`: Type of filter applied
  - `filter_value`: Filter value
  - `timestamp`: ISO timestamp

**Use Cases**:

- Understand map navigation patterns
- Identify most explored areas
- Analyze filter usage
- Optimize map UI/UX

### Chart/Visualization Interactions

Tracks interactions with data visualizations:

- **Event**: `chart_interaction`
- **Properties**:
  - `chart_type`: line, bar, pie, scatter
  - `pollutant`: Selected pollutant
  - `time_range`: Time period being visualized
  - `location_count`: Number of locations in chart
  - `action`: view, export, refresh, download
  - `timestamp`: ISO timestamp

**Use Cases**:

- Identify preferred visualization types
- Understand pollutant analysis patterns
- Track chart export frequency

### Search Events

Tracks search behavior across the platform:

- **Event**: `search_performed`
- **Properties**:
  - `search_term`: User's search query
  - `search_type`: location, site, device, general
  - `results_count`: Number of results returned
  - `selected_result`: Whether user selected a result
  - `timestamp`: ISO timestamp

**Use Cases**:

- Improve search functionality
- Understand user intent
- Identify missing content

### Favorite Actions

Tracks favorite location management:

- **Event**: `favorite_action`
- **Properties**:
  - `action`: add, remove, view
  - `location_id_hashed`: Anonymized location ID
  - `location_name`: Location name
  - `timestamp`: ISO timestamp

**Use Cases**:

- Identify most favorited locations
- Track favorite usage patterns
- Understand user workflows

### User Preference Changes

Tracks configuration and preference updates:

- **Event**: `preference_changed`
- **Properties**:
  - `preference_type`: theme, language, notification, display
  - `preference_value`: New value
  - `previous_value`: Previous value
  - `timestamp`: ISO timestamp

**Use Cases**:

- Understand popular configurations
- Track theme adoption
- Analyze preference change patterns

### Page Dwell Time

Tracks time spent on each page:

- **Event**: `page_dwell`
- **Properties**:
  - `page_path`: Page URL path
  - `dwell_time_seconds`: Time in seconds
  - `dwell_time_minutes`: Time in minutes (rounded)
  - `timestamp`: ISO timestamp

**Use Cases**:

- Identify engaging content
- Detect usability issues
- Optimize information architecture

### Feature Usage

Generic tracking for feature interactions:

- **Event**: `feature_used`
- **Properties**:
  - `feature_name`: Name of the feature
  - `action`: Action performed
  - `...metadata`: Additional context-specific properties
  - `timestamp`: ISO timestamp

**Use Cases**:

- Track adoption of new features
- Identify underutilized functionality
- Prioritize feature development

### Session Quality Metrics

Tracks overall session engagement:

- **Event**: `session_quality`
- **Properties**:
  - `pages_viewed`: Number of pages in session
  - `actions_performed`: Number of interactions
  - `session_duration_minutes`: Session length
  - `errors_encountered`: Number of errors
  - `engagement_score`: Calculated engagement score (0-100)
  - `timestamp`: ISO timestamp

**Use Cases**:

- Measure overall platform engagement
- Identify high-quality sessions
- Detect problematic user experiences

### Error Tracking

Tracks application errors:

- **Event**: `error_occurred`
- **Properties**:
  - `error_type`: Error category
  - `error_message`: Error description
  - `...errorContext`: Additional error context
  - `timestamp`: ISO timestamp

**Use Cases**:

- Monitor application health
- Prioritize bug fixes
- Improve error handling

### API Performance

Tracks API call performance:

- **Event**: `api_call`
- **Properties**:
  - `endpoint`: API endpoint
  - `method`: HTTP method
  - `duration_ms`: Request duration
  - `status_code`: HTTP status code
  - `is_success`: Success indicator
  - `timestamp`: ISO timestamp

**Use Cases**:

- Monitor API performance
- Identify slow endpoints
- Track error rates

## Implementation Guide

### Basic Usage

```typescript
import { usePostHog } from 'posthog-js/react';
import { trackLocationSelection } from '@/shared/utils/enhancedAnalytics';

const MyComponent = () => {
  const posthog = usePostHog();

  const handleLocationClick = (location) => {
    trackLocationSelection(posthog, {
      locationId: location.id,
      locationName: location.name,
      city: location.city,
      country: location.country,
      source: 'map',
    });
  };

  return <div onClick={handleLocationClick}>...</div>;
};
```

### Page Tracking Hook

```typescript
import { usePageTracking } from '@/shared/hooks';

const MyPage = () => {
  const { trackAction, trackError } = usePageTracking();

  const handleUserAction = () => {
    trackAction(); // Increment action count
    // ... perform action
  };

  const handleError = (error) => {
    trackError(); // Increment error count
    // ... handle error
  };

  return <div>...</div>;
};
```

## Privacy & Data Protection

### Data Anonymization

- Location IDs are hashed using FNV-1a algorithm before sending to analytics
- Personal identifiable information is never tracked
- IP addresses are anonymized at collection

### Configuration

- PostHog property denylist configured to redact sensitive fields
- Session recording is disabled by default
- Autocapture is disabled for precise control

## Analytics Dashboard

### PostHog Insights

Access your PostHog dashboard to:

1. Create custom insights and funnels
2. Analyze user cohorts
3. Track retention metrics
4. Build feature flags based on behavior

### Google Analytics

Access GA4 to:

1. View standard web analytics
2. Create custom reports
3. Set up conversion tracking
4. Analyze traffic sources

## Key Metrics to Monitor

### User Engagement

- Average session duration
- Pages per session
- Engagement score distribution
- Feature adoption rates

### Data Usage

- Most downloaded data types
- Popular date ranges
- Preferred file formats
- Peak download times

### Location Insights

- Most viewed locations
- Popular geographic regions
- Favorite location patterns
- Location search trends

### Platform Performance

- Page load times
- API response times
- Error rates by page
- User flow bottlenecks

## Reporting & Analysis

### Weekly Reports

- Active user trends
- Feature usage statistics
- Error frequency and types
- Top locations by views

### Monthly Reports

- User growth metrics
- Data download patterns
- Feature adoption rates
- Geographic reach

### Research Insights

- Download duration patterns
- Pollutant analysis preferences
- Seasonal usage trends
- Regional interest patterns

## Troubleshooting

### Events Not Appearing

1. Check PostHog API key is set correctly
2. Verify PostHog initialization in browser console
3. Check network tab for blocked requests
4. Ensure user has not blocked analytics

### Google Analytics Not Working

1. Verify GA4 tracking ID: `G-CGRVG9F59K`
2. Check GA4 property settings
3. Allow 24-48 hours for data to appear
4. Test in private browsing mode

## Best Practices

1. **Track Intent, Not Just Actions**: Understand why users perform actions
2. **Respect Privacy**: Never track PII or sensitive data
3. **Minimize Tracking Overhead**: Balance detail with performance
4. **Regular Review**: Analyze trends weekly and adjust as needed
5. **Act on Insights**: Use data to drive actual improvements

## Future Enhancements

- [ ] A/B testing framework
- [ ] Predictive analytics for user behavior
- [ ] Real-time dashboard for stakeholders
- [ ] Automated anomaly detection
- [ ] Integration with data warehouse
- [ ] Custom event builder UI
- [ ] Export to research-friendly formats

## Support

For questions or issues with analytics:

- Technical: Review PostHog documentation
- Implementation: Check this guide and code comments
- Strategy: Contact analytics team lead
