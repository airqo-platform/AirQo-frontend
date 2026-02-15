/**
 * Enhanced Analytics Utility for AirQo Platform
 *
 * This utility provides comprehensive tracking for user interactions,
 * enabling data-driven decision making and research insights.
 */

import { PostHog } from 'posthog-js';
import ReactGA from 'react-ga4';
import { hashId } from './analytics';

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
  if (!posthog) return;

  const eventData = {
    location_id_hashed: hashId(selection.locationId),
    location_name: selection.locationName,
    city: selection.city,
    country: selection.country,
    source: selection.source,
    timestamp: new Date().toISOString(),
  };

  posthog.capture('location_selected', eventData);

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
  if (!posthog) return;

  const eventData = {
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
    timestamp: new Date().toISOString(),
  };

  posthog.capture('data_downloaded', eventData);

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
  if (!posthog) return;

  const eventData = {
    action: interaction.action,
    location_id_hashed: interaction.locationId
      ? hashId(interaction.locationId)
      : undefined,
    zoom_level: interaction.zoomLevel,
    filter_type: interaction.filterType,
    filter_value: interaction.filterValue,
    timestamp: new Date().toISOString(),
  };

  posthog.capture('map_interaction', eventData);
};

/**
 * Track chart/visualization interactions
 */
export const trackChartInteraction = (
  posthog: PostHog | null,
  interaction: ChartInteraction
) => {
  if (!posthog) return;

  const eventData = {
    chart_type: interaction.chartType,
    pollutant: interaction.pollutant,
    time_range: interaction.timeRange,
    location_count: interaction.locationCount,
    action: interaction.action,
    timestamp: new Date().toISOString(),
  };

  posthog.capture('chart_interaction', eventData);

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
  if (!posthog) return;

  const eventData = {
    preference_type: preference.preferenceType,
    preference_value: preference.preferenceValue,
    previous_value: preference.previousValue,
    timestamp: new Date().toISOString(),
  };

  posthog.capture('preference_changed', eventData);
};

/**
 * Track search events
 * Note: Search terms are hashed to prevent PII exposure
 */
export const trackSearch = (posthog: PostHog | null, search: SearchEvent) => {
  if (!posthog) return;

  const hashedSearchTerm = sanitizeSearchTerm(search.searchTerm);

  const eventData = {
    search_term_hashed: hashedSearchTerm,
    search_type: search.searchType,
    results_count: search.resultsCount,
    selected_result: search.selectedResult,
    has_results: search.resultsCount > 0,
    timestamp: new Date().toISOString(),
  };

  posthog.capture('search_performed', eventData);

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
  if (!posthog) return;

  posthog.capture('page_dwell', {
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
  if (!posthog) return;

  posthog.capture('feature_used', {
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
  if (!posthog) return;

  const sanitizedMessage = sanitizeErrorMessage(errorMessage);
  const sanitizedContext = sanitizeErrorContext(errorContext || {});

  posthog.capture('error_occurred', {
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
  if (!posthog) return;

  const sanitizedEndpoint = sanitizeEndpoint(endpoint);

  posthog.capture('api_call', {
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
  if (!posthog) return;

  posthog.capture('favorite_action', {
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
  if (!posthog) return;

  posthog.capture(
    'session_quality',
    {
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
};

export default enhancedAnalytics;
