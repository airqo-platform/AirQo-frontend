/**
 * Enhanced Analytics Utility for AirQo Platform
 *
 * This utility provides comprehensive tracking for user interactions,
 * enabling data-driven decision making and research insights.
 */

import { PostHog } from 'posthog-js';
import ReactGA from 'react-ga4';
import { hashId } from './analytics';
import { AIRQO_APP_NAME } from './analyticsConstants';

const getAnalyticsContext = () => ({
  app_name: AIRQO_APP_NAME,
  app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  environment: process.env.NODE_ENV || 'production',
});

type BrowserWindowWithPostHog = Window & { posthog?: PostHog };

const resolvePostHogClient = (posthog: PostHog | null): PostHog | null => {
  if (posthog) {
    return posthog;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  return (window as BrowserWindowWithPostHog).posthog || null;
};

// ============================================================================
// Type Definitions
// ============================================================================

// Helper functions for PII protection
const sanitizeSearchTerm = (term: string): string => {
  // Hash the search term to prevent PII exposure
  return hashId(term);
};

const sanitizeErrorMessage = (message: string): string => {
  if (!message) return 'Unknown error';

  // Truncate to 200 characters
  let sanitized = message.substring(0, 200);

  // Redact common PII patterns
  sanitized = sanitized
    // Redact email addresses
    .replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]')
    // Redact UUIDs
    .replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      '[UUID]'
    )
    // Redact file paths
    .replace(/[A-Za-z]:\\[\\\w\s.-]+/g, '[PATH]')
    .replace(/\/[\w./-]+/g, '[PATH]')
    // Redact potential IDs (long numeric strings)
    .replace(/\b\d{10,}\b/g, '[ID]');

  return sanitized;
};

const sanitizeErrorContext = (
  context: Record<string, unknown>
): Record<string, unknown> => {
  if (!context) return {};

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(context)) {
    if (typeof value === 'string') {
      // Sanitize string values to prevent PII exposure
      sanitized[key] = sanitizeErrorMessage(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      // Keep primitive values as-is
      sanitized[key] = value;
    } else if (value === null || value === undefined) {
      // Keep null/undefined as-is
      sanitized[key] = value;
    } else {
      // For complex objects, convert to string and sanitize
      sanitized[key] = sanitizeErrorMessage(String(value));
    }
  }

  return sanitized;
};

const sanitizeEndpoint = (endpoint: string): string => {
  if (!endpoint) return 'unknown';

  // Replace path parameters that look like IDs, UUIDs, or emails with placeholders
  const sanitized = endpoint
    // Replace UUIDs
    .replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      ':uuid'
    )
    // Replace long numeric IDs
    .replace(/\/(\d{5,})/g, '/:id')
    // Replace email-like patterns in paths
    .replace(/\/([\w.-]+@[\w.-]+\.\w+)/g, '/:email')
    // Replace short alphanumeric IDs (but not common route segments)
    .replace(/\/([a-zA-Z0-9_-]{20,})/g, '/:param');

  return sanitized;
};

export interface LocationSelection {
  locationId: string;
  locationName: string;
  city?: string;
  country?: string;
  source: 'map' | 'favorites' | 'search' | 'suggestions' | 'insights';
}

export interface DataDownloadEvent {
  dataType: 'calibrated' | 'raw';
  fileType: 'csv' | 'json';
  frequency: 'hourly' | 'daily' | 'monthly';
  pollutants: string[];
  locationCount?: number;
  deviceCount?: number;
  startDate: string;
  endDate: string;
  durationDays: number;
  deviceCategory?: 'lowcost' | 'reference';
  source: 'sites' | 'devices' | 'countries' | 'cities';
  datasetLabel?: string;
  locationNames?: string[];
  timePeriodType?: 'real_time' | 'historical';
  selectedGridIds?: string[];
  selectedSiteIds?: string[];
}

export interface MapInteraction {
  action: 'zoom' | 'pan' | 'marker_click' | 'cluster_expand' | 'filter_apply';
  locationId?: string;
  zoomLevel?: number;
  filterType?: string;
  filterValue?: string;
}

export interface ChartInteraction {
  chartType: 'line' | 'bar' | 'pie' | 'scatter';
  pollutant: string;
  timeRange: string;
  locationCount: number;
  action: 'view' | 'export' | 'refresh' | 'download';
}

export interface UserPreference {
  preferenceType: 'theme' | 'language' | 'notification' | 'display';
  preferenceValue: string;
  previousValue?: string;
}

export interface SearchEvent {
  searchTerm: string;
  searchType: 'location' | 'site' | 'device' | 'general';
  resultsCount: number;
  selectedResult?: boolean;
}

// ============================================================================
// Analytics Tracking Functions
// ============================================================================

/**
 * Track location selection events
 */
export const trackLocationSelection = (
  posthog: PostHog | null,
  selection: LocationSelection
) => {
  const analyticsClient = resolvePostHogClient(posthog);
  if (!analyticsClient) return;

  const eventData = {
    ...getAnalyticsContext(),
    location_id_hashed: hashId(selection.locationId),
    location_name: selection.locationName,
    city: selection.city,
    country: selection.country,
    source: selection.source,
    timestamp: new Date().toISOString(),
  };

  analyticsClient.capture('location_selected', eventData);

  // Also track to Google Analytics
  ReactGA.event({
    category: 'Location',
    action: 'Select',
    label: selection.source,
  });
};

/**
 * Track data download events with comprehensive details
 */
export const trackDataDownload = (
  posthog: PostHog | null,
  download: DataDownloadEvent
) => {
  const analyticsClient = resolvePostHogClient(posthog);
  if (!analyticsClient) return;

  const eventData = {
    ...getAnalyticsContext(),
    data_type: download.dataType,
    file_type: download.fileType,
    frequency: download.frequency,
    pollutants: download.pollutants,
    pollutant_count: download.pollutants.length,
    location_count: download.locationCount,
    device_count: download.deviceCount,
    start_date: download.startDate,
    end_date: download.endDate,
    duration_days: download.durationDays,
    device_category: download.deviceCategory,
    source: download.source,
    dataset_label: download.datasetLabel || download.source,
    location_names: download.locationNames || [],
    time_period_type: download.timePeriodType,
    selected_grid_ids: download.selectedGridIds || [],
    selected_site_ids: download.selectedSiteIds || [],
    timestamp: new Date().toISOString(),
  };

  analyticsClient.capture('data_downloaded', eventData);

  // Track to Google Analytics
  ReactGA.event({
    category: 'Data Export',
    action: 'Download',
    label: `${download.fileType}_${download.frequency}`,
    value: download.durationDays,
  });
};

/**
 * Track map interactions
 */
export const trackMapInteraction = (
  posthog: PostHog | null,
  interaction: MapInteraction
) => {
  const analyticsClient = resolvePostHogClient(posthog);
  if (!analyticsClient) return;

  const eventData = {
    ...getAnalyticsContext(),
    action: interaction.action,
    location_id_hashed: interaction.locationId
      ? hashId(interaction.locationId)
      : undefined,
    zoom_level: interaction.zoomLevel,
    filter_type: interaction.filterType,
    filter_value: interaction.filterValue,
    timestamp: new Date().toISOString(),
  };

  analyticsClient.capture('map_interaction', eventData);
};

/**
 * Track chart/visualization interactions
 */
export const trackChartInteraction = (
  posthog: PostHog | null,
  interaction: ChartInteraction
) => {
  const analyticsClient = resolvePostHogClient(posthog);
  if (!analyticsClient) return;

  const eventData = {
    ...getAnalyticsContext(),
    chart_type: interaction.chartType,
    pollutant: interaction.pollutant,
    time_range: interaction.timeRange,
    location_count: interaction.locationCount,
    action: interaction.action,
    timestamp: new Date().toISOString(),
  };

  analyticsClient.capture('chart_interaction', eventData);

  // Track to Google Analytics
  ReactGA.event({
    category: 'Visualization',
    action: interaction.action,
    label: `${interaction.chartType}_${interaction.pollutant}`,
  });
};

/**
 * Track user preference changes
 */
export const trackPreferenceChange = (
  posthog: PostHog | null,
  preference: UserPreference
) => {
  const analyticsClient = resolvePostHogClient(posthog);
  if (!analyticsClient) return;

  const eventData = {
    ...getAnalyticsContext(),
    preference_type: preference.preferenceType,
    preference_value: preference.preferenceValue,
    previous_value: preference.previousValue,
    timestamp: new Date().toISOString(),
  };

  analyticsClient.capture('preference_changed', eventData);
};

/**
 * Track search events
 * Note: Search terms are hashed to prevent PII exposure
 */
export const trackSearch = (posthog: PostHog | null, search: SearchEvent) => {
  const analyticsClient = resolvePostHogClient(posthog);
  if (!analyticsClient) return;

  const hashedSearchTerm = sanitizeSearchTerm(search.searchTerm);

  const eventData = {
    ...getAnalyticsContext(),
    search_term_hashed: hashedSearchTerm,
    search_type: search.searchType,
    results_count: search.resultsCount,
    selected_result: search.selectedResult,
    has_results: search.resultsCount > 0,
    timestamp: new Date().toISOString(),
  };

  analyticsClient.capture('search_performed', eventData);

  // Track to Google Analytics - only send metadata, not the actual term
  ReactGA.event({
    category: 'Search',
    action: search.searchType,
    label: search.resultsCount > 0 ? 'results_found' : 'no_results',
    value: search.resultsCount,
  });
};

/**
 * Track page dwell time
 */
export const trackPageDwell = (
  posthog: PostHog | null,
  pagePath: string,
  dwellTimeSeconds: number
) => {
  const analyticsClient = resolvePostHogClient(posthog);
  if (!analyticsClient) return;

  analyticsClient.capture('page_dwell', {
    ...getAnalyticsContext(),
    page_path: pagePath,
    dwell_time_seconds: dwellTimeSeconds,
    dwell_time_minutes: Math.round(dwellTimeSeconds / 60),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track feature usage
 */
export const trackFeatureUsage = (
  posthog: PostHog | null,
  featureName: string,
  action: string,
  metadata?: Record<string, unknown>
) => {
  const analyticsClient = resolvePostHogClient(posthog);
  if (!analyticsClient) return;

  analyticsClient.capture('feature_used', {
    ...getAnalyticsContext(),
    feature_name: featureName,
    action,
    metadata: metadata || {},
    timestamp: new Date().toISOString(),
  });

  // Track to Google Analytics
  ReactGA.event({
    category: 'Feature',
    action,
    label: featureName,
  });
};

/**
 * Track error events
 * Note: Error messages are sanitized to prevent PII exposure.
 * Callers should not pass raw user data in error messages or context.
 */
export const trackError = (
  posthog: PostHog | null,
  errorType: string,
  errorMessage: string,
  errorContext?: Record<string, unknown>
) => {
  const analyticsClient = resolvePostHogClient(posthog);
  if (!analyticsClient) return;

  const sanitizedMessage = sanitizeErrorMessage(errorMessage);
  const sanitizedContext = sanitizeErrorContext(errorContext || {});

  analyticsClient.capture('error_occurred', {
    ...getAnalyticsContext(),
    error_type: errorType,
    error_message: sanitizedMessage,
    error_context: sanitizedContext,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track API performance
 * Note: Endpoints are sanitized to prevent PII exposure from path parameters
 */
export const trackApiPerformance = (
  posthog: PostHog | null,
  endpoint: string,
  method: string,
  duration: number,
  status: number
) => {
  const analyticsClient = resolvePostHogClient(posthog);
  if (!analyticsClient) return;

  const sanitizedEndpoint = sanitizeEndpoint(endpoint);

  analyticsClient.capture('api_call', {
    ...getAnalyticsContext(),
    endpoint: sanitizedEndpoint,
    method,
    duration_ms: duration,
    status_code: status,
    is_success: status >= 200 && status < 300,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track favorite locations management
 */
export const trackFavoriteAction = (
  posthog: PostHog | null,
  action: 'add' | 'remove' | 'view',
  locationId: string,
  locationName?: string
) => {
  const analyticsClient = resolvePostHogClient(posthog);
  if (!analyticsClient) return;

  analyticsClient.capture('favorite_action', {
    ...getAnalyticsContext(),
    action,
    location_id_hashed: hashId(locationId),
    location_name: locationName,
    timestamp: new Date().toISOString(),
  });

  // Track to Google Analytics
  ReactGA.event({
    category: 'Favorites',
    action: action.charAt(0).toUpperCase() + action.slice(1),
    label: locationName || 'Unknown',
  });
};

/**
 * Track session quality indicators
 */
export const trackSessionQuality = (
  posthog: PostHog | null,
  metrics: {
    pagesViewed: number;
    actionsPerformed: number;
    sessionDuration: number;
    errorsEncountered: number;
  },
  options?: { transport?: 'sendBeacon' | 'fetch' }
) => {
  const analyticsClient = resolvePostHogClient(posthog);
  if (!analyticsClient) return;

  analyticsClient.capture(
    'session_quality',
    {
      ...getAnalyticsContext(),
      pages_viewed: metrics.pagesViewed,
      actions_performed: metrics.actionsPerformed,
      session_duration_minutes: Math.round(metrics.sessionDuration / 60),
      errors_encountered: metrics.errorsEncountered,
      engagement_score: calculateEngagementScore(metrics),
      timestamp: new Date().toISOString(),
    },
    options
  );
};

export const trackAuthEvent = (
  posthog: PostHog | null,
  action:
    | 'login'
    | 'register'
    | 'password_reset_requested'
    | 'password_reset_completed',
  metadata?: Record<string, unknown>
) => {
  const analyticsClient = resolvePostHogClient(posthog);
  if (!analyticsClient) return;

  analyticsClient.capture('auth_event', {
    ...getAnalyticsContext(),
    action,
    metadata: metadata || {},
    timestamp: new Date().toISOString(),
  });
};

export const trackGroupChange = (
  posthog: PostHog | null,
  metadata: {
    fromGroupId?: string;
    fromGroupName?: string;
    fromOrganizationSlug?: string;
    toGroupId: string;
    toGroupName?: string;
    toOrganizationSlug?: string;
  }
) => {
  const analyticsClient = resolvePostHogClient(posthog);
  if (!analyticsClient) return;

  analyticsClient.capture('group_switched', {
    ...getAnalyticsContext(),
    ...metadata,
    timestamp: new Date().toISOString(),
  });
};

export const trackApiClientAction = (
  posthog: PostHog | null,
  action: 'create' | 'update' | 'refresh_token' | 'view',
  metadata?: Record<string, unknown>
) => {
  const analyticsClient = resolvePostHogClient(posthog);
  if (!analyticsClient) return;

  analyticsClient.capture('api_client_action', {
    ...getAnalyticsContext(),
    action,
    metadata: metadata || {},
    timestamp: new Date().toISOString(),
  });
};

/**
 * Calculate engagement score based on session metrics
 *
 * @param metrics Session metrics
 * @param metrics.sessionDuration Expected in seconds (not milliseconds)
 * @returns Engagement score from 0-90
 *
 * Score breakdown:
 * - Pages: 0-30 points (10 per page, max 3)
 * - Actions: 0-40 points (5 per action, max 8)
 * - Time: 0-20 points (2 per minute, max 10 minutes)
 * - Error penalty: -5 per error
 */
function calculateEngagementScore(metrics: {
  pagesViewed: number;
  actionsPerformed: number;
  sessionDuration: number;
  errorsEncountered: number;
}): number {
  const pageScore = Math.min(metrics.pagesViewed * 10, 30);
  const actionScore = Math.min(metrics.actionsPerformed * 5, 40);
  const timeScore = Math.min((metrics.sessionDuration / 60) * 2, 20);
  const errorPenalty = metrics.errorsEncountered * 5;

  return Math.max(0, pageScore + actionScore + timeScore - errorPenalty);
}

// ============================================================================
// Exports
// ============================================================================

const enhancedAnalytics = {
  trackLocationSelection,
  trackDataDownload,
  trackMapInteraction,
  trackChartInteraction,
  trackPreferenceChange,
  trackSearch,
  trackPageDwell,
  trackFeatureUsage,
  trackError,
  trackApiPerformance,
  trackFavoriteAction,
  trackSessionQuality,
  trackAuthEvent,
  trackGroupChange,
  trackApiClientAction,
};

export default enhancedAnalytics;
