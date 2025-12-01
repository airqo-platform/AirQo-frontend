# PostHog Analytics Documentation

This document outlines the PostHog analytics implementation in the AirQo platform. It details the events currently tracked, their properties, and provides recommendations for future tracking to enhance product insights.

## 1. Overview

PostHog is used to track user interactions, feature usage, and key business metrics. The implementation uses the `posthog-js` library and is integrated into the Next.js application via a custom `PostHogProvider`.

- **Project API Key**: Configured via `NEXT_PUBLIC_POSTHOG_KEY`
- **Host URL**: Configured via `NEXT_PUBLIC_POSTHOG_HOST`
- **Automatic Capture**: Pageviews are captured manually to support Next.js App Router client-side navigation. Autocapture is disabled for pageviews but enabled for page leaves.

## 2. Currently Tracked Events

### 2.1 Page Views

- **Event Name**: `$pageview`
- **Trigger**: Automatically triggered on every route change.
- **Properties**:
  - `$current_url`: The full URL of the current page, including query parameters.

### 2.2 Data Downloads

- **Event Name**: `data_download_initiated`
- **Trigger**: User clicks the "Download" button in the Data Export tool.
- **Location**: `src/modules/data-download/hooks/useDataExportActions.ts`
- **Properties**:
  - `data_type`: Type of data (e.g., 'calibrated', 'raw')
  - `file_type`: Format of the file (e.g., 'csv', 'json')
  - `frequency`: Data frequency (e.g., 'daily')
  - `device_category`: Category of devices (e.g., 'lowcost')
  - `pollutants`: Array of selected pollutants
  - `active_tab`: The active tab when download was initiated ('sites', 'devices', 'countries', 'cities')
  - `sites_count`: Number of selected sites (if applicable)
  - `devices_count`: Number of selected devices (if applicable)
  - `grids_count`: Number of selected grids (if applicable)

- **Event Name**: `data_visualize_clicked`
- **Trigger**: User clicks the "Visualize" button in the Data Export tool.
- **Location**: `src/modules/data-download/hooks/useDataExportActions.ts`
- **Properties**:
  - `active_tab`: The active tab
  - `sites_count`: Number of selected sites
  - `devices_count`: Number of selected devices
  - `grids_count`: Number of selected grids

### 2.3 API Client Management

- **Event Name**: `client_created`
- **Trigger**: User successfully creates a new API client.
- **Location**: `src/modules/api-client/components/CreateClientDialog.tsx`
- **Properties**:
  - `has_ips`: Boolean indicating if IP restrictions were applied
  - `ip_count`: Number of IP addresses whitelisted

### 2.4 User Account

- **Event Name**: `account_deletion_initiated`
- **Trigger**: User initiates the account deletion process.
- **Location**: `src/modules/user-profile/components/AccountDeletionCard.tsx`
- **Properties**: None

### 2.5 Map Interactions

- **Event Name**: `map_viewed`
- **Trigger**: The Map page is loaded.
- **Location**: `src/modules/airqo-map/MapPage.tsx`
- **Properties**: None

- **Event Name**: `map_location_selected`
- **Trigger**: User selects a specific location on the map.
- **Location**: `src/modules/airqo-map/MapPage.tsx`
- **Properties**:
  - `location_id`: ID of the selected location
  - `location_name`: Name of the selected location

### 2.6 Location Insights

- **Event Name**: `locations_added_to_insights`
- **Trigger**: User adds locations to the insights view.
- **Location**: `src/modules/location-insights/add-location.tsx`
- **Properties**:
  - `count`: Number of locations added
  - `site_ids`: Array of added site IDs

### 2.7 Analytics Dashboard

- **Event Name**: `analytics_card_clicked`
- **Trigger**: User clicks on an analytics card to view details.
- **Location**: `src/modules/analytics/components/AnalyticsCard.tsx`
- **Properties**:
  - `site_id`: ID of the site
  - `site_name`: Name of the site
  - `pollutant`: The pollutant being displayed
  - `aqi_status`: The AQI status (e.g., 'good', 'moderate')

## 3. Recommendations for Future Tracking

To gain deeper insights into user behavior and product performance, the following events are recommended for future implementation:

### 3.1 User Onboarding & Authentication

- **`signup_completed`**: Track successful user registrations to measure conversion rates.
- **`login_failed`**: Track login failures to identify potential friction points or issues.
- **`onboarding_step_completed`**: If there's a multi-step onboarding flow, track each step to identify drop-off points.

### 3.2 Feature Usage & Engagement

- **`search_performed`**: Track search queries in the Map or Data Export tools to understand what users are looking for.
  - _Properties_: `query`, `context` (e.g., 'map', 'data-export')
- **`filter_applied`**: Track usage of filters in Analytics or Map views.
  - _Properties_: `filter_type`, `value`
- **`favorites_added` / `favorites_removed`**: Track when users favorite a location.
  - _Properties_: `site_id`, `site_name`
- **`report_generated`**: If there's a reporting feature, track when reports are created.

### 3.3 Performance & Errors

- **`api_error`**: Track client-side API errors to monitor system health from the user's perspective.
  - _Properties_: `endpoint`, `status_code`, `error_message`
- **`feature_load_time`**: Measure how long key features (like the Map or Analytics dashboard) take to load.

### 3.4 User Retention

- **`session_duration`**: While PostHog tracks this automatically, defining custom "active usage" events can help measure true engagement.
- **`returning_user`**: Identify and track users who return after a specific period.

## 4. Best Practices Used

- **Descriptive Event Names**: Events use a `noun_verb` format (e.g., `client_created`, `map_viewed`) for clarity.
- **Rich Properties**: Events include relevant context (e.g., counts, types, IDs) to allow for detailed segmentation and analysis.
- **Client-Side Only**: PostHog is initialized only on the client side to be compatible with Next.js App Router and avoid hydration mismatches.
- **Manual Pageview Tracking**: To ensure accuracy with client-side routing, pageviews are tracked manually via a `useEffect` hook in the provider.
