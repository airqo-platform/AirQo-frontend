/**
 * Shared types for the Nexus usage-stats feature.
 *
 * The backend returns every read endpoint (except the beacon and CSV) wrapped
 * in an envelope `{ success, message, data: { ... } }`. The service layer
 * unwraps `data`, so these shapes describe the INNER payload only —
 * `success` / `message` are intentionally absent here.
 */

export type UsageMetric = 'activity' | 'page_views' | 'api_calls';

export type UsageKind = 'page' | 'api';

export type UsageSort =
  | 'total_actions'
  | 'active_days'
  | 'page_views'
  | 'api_calls'
  | 'sessions'
  | 'last_active';

export type UsageOrder = 'asc' | 'desc';

/** Per-user fields shared by the users-table row shapes. */
export interface UsageUserBase {
  user_id: string;
  email: string | null;
  name: string | null;
}

// ---------------------------------------------------------------------------
// Calendar  GET /users/usage/users/:userId/calendar
// ---------------------------------------------------------------------------

export interface UsageCalendarParams {
  year?: number;
  from?: string;
  to?: string;
  metric?: UsageMetric;
  tz?: string;
}

export interface UsageCalendarDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface UsageCalendarResponse {
  tz: string;
  metric: UsageMetric;
  from: string;
  to: string;
  total: number;
  active_days: number;
  max_count: number;
  current_streak: number;
  longest_streak: number;
  thresholds: number[];
  days: UsageCalendarDay[];
}

// ---------------------------------------------------------------------------
// Summary  GET /users/usage/users/:userId/summary
// ---------------------------------------------------------------------------

export interface UsageSummaryParams {
  month?: string;
  tz?: string;
}

export interface UsageSummaryResponse {
  month: string;
  tz: string;
  total_actions: number;
  page_views: number;
  api_calls: number;
  active_days: number;
  days_in_month: number;
  current_streak: number;
  longest_streak: number;
  sessions: number;
  total_time_sec: number;
  avg_session_sec: number | null;
  session_metrics_basis: string;
  previous_month: {
    month: string;
    total_actions: number;
    active_days: number;
    sessions: number;
  };
  change_pct: {
    total_actions: number | null;
    active_days: number | null;
    sessions: number | null;
  };
  first_seen: string | null;
  last_seen: string | null;
}

// ---------------------------------------------------------------------------
// Breakdown  GET /users/usage/users/:userId/breakdown
// ---------------------------------------------------------------------------

export interface UsageBreakdownParams {
  month?: string;
  kind?: UsageKind;
  limit?: number;
}

export interface UsageBreakdownItem {
  key: string;
  count: number;
  share_pct: number;
  total_duration_sec?: number;
  avg_duration_sec?: number;
}

export interface UsageBreakdownResponse {
  month: string;
  kind: UsageKind;
  basis: string;
  total: number;
  items: UsageBreakdownItem[];
}

// ---------------------------------------------------------------------------
// Timeline  GET /users/usage/users/:userId/timeline
// ---------------------------------------------------------------------------

export interface UsageTimelineParams {
  date: string;
  tz?: string;
}

export interface UsageTimelineHour {
  hour: number;
  page_views: number;
  api_calls: number;
}

export interface UsageTimelineResponse {
  date: string;
  tz: string;
  page_views: number;
  api_calls: number;
  hours: UsageTimelineHour[];
  top_lists_basis: string;
  top_pages: { key: string; count: number }[];
  top_endpoints: { key: string; count: number }[];
}

// ---------------------------------------------------------------------------
// Rhythm  GET /users/usage/users/:userId/rhythm
// ---------------------------------------------------------------------------

export interface UsageRhythmParams {
  from?: string;
  to?: string;
  metric?: UsageMetric;
  tz?: string;
}

export interface UsageRhythmResponse {
  from: string;
  to: string;
  tz: string;
  metric: UsageMetric;
  weekdays: string[];
  matrix: number[][];
}

// ---------------------------------------------------------------------------
// Overview  GET /users/usage/overview
// ---------------------------------------------------------------------------

export interface UsageOverviewParams {
  month?: string;
  exclude_internal?: boolean;
}

export interface UsageOverviewResponse {
  month: string;
  scope: string;
  basis: string;
  mau: number;
  avg_dau: number;
  peak_dau: { date: string; active_users: number };
  stickiness_pct: number;
  page_views: number;
  api_calls: number;
  sessions: number;
  lifecycle: {
    new: number;
    returning: number;
    resurrected: number;
    dormant: number;
  };
  change_pct: {
    mau: number | null;
    page_views: number | null;
    api_calls: number | null;
    sessions: number | null;
  };
  previous_month: {
    month: string;
    mau: number;
    page_views: number;
    api_calls: number;
    sessions: number;
  };
  daily: {
    date: string;
    active_users: number;
    page_views: number;
    api_calls: number;
    sessions: number;
  }[];
}

// ---------------------------------------------------------------------------
// Pages  GET /users/usage/pages
// ---------------------------------------------------------------------------

export interface UsagePagesParams {
  month?: string;
  kind?: UsageKind;
  limit?: number;
  exclude_internal?: boolean;
}

export interface UsagePagesItem {
  key: string;
  count: number;
  unique_users: number;
  adoption_pct: number;
  share_pct: number;
  avg_duration_sec?: number;
}

export interface UsagePagesResponse {
  month: string;
  kind: UsageKind;
  scope: string;
  mau: number;
  basis: string;
  items: UsagePagesItem[];
}

// ---------------------------------------------------------------------------
// Users table  GET /users/usage/users
// ---------------------------------------------------------------------------

export interface UsageUsersParams {
  month?: string;
  sort?: UsageSort;
  order?: UsageOrder;
  search?: string;
  page?: number;
  limit?: number;
  exclude_internal?: boolean;
}

export interface UsageUserRow extends UsageUserBase {
  active_days: number;
  total_actions: number;
  page_views: number;
  api_calls: number;
  sessions: number;
  total_time_sec: number;
  last_active_day: string | null;
  first_seen: string | null;
  last_seen: string | null;
  sparkline: number[];
}

export interface UsageUsersResponse {
  month: string;
  scope: string;
  basis: string;
  page: number;
  limit: number;
  total: number;
  pages: number;
  sort: string;
  order: UsageOrder;
  users: UsageUserRow[];
}

// ---------------------------------------------------------------------------
// Retention  GET /users/usage/retention
// ---------------------------------------------------------------------------

export interface UsageRetentionParams {
  months?: number;
  exclude_internal?: boolean;
}

export interface UsageRetentionCell {
  offset: number;
  month: string;
  active: number;
  rate_pct: number | null;
}

export interface UsageCohort {
  cohort: string;
  size: number;
  retention: UsageRetentionCell[];
}

export interface UsageRetentionResponse {
  scope: string;
  cohort_basis: string;
  months: number;
  cohorts: UsageCohort[];
}

// ---------------------------------------------------------------------------
// CSV export  GET /users/usage/users?format=csv
// ---------------------------------------------------------------------------

/**
 * CSV export accepts the exact same filter set as the users table, so this
 * is an alias of `UsageUsersParams` rather than a structurally duplicated
 * interface that can silently drift.
 */
export type UsageExportCsvParams = UsageUsersParams;

export interface UsageCsvExportResult {
  blob: Blob;
  filename: string;
}

// ---------------------------------------------------------------------------
// Beacon  POST /users/usage/events
// ---------------------------------------------------------------------------

export interface UsageBeaconEvent {
  type?: 'page_view';
  path: string;
  duration_sec?: number;
  session_start?: boolean;
}

export interface UsageBeaconPayload {
  session_id?: string;
  events: UsageBeaconEvent[];
}

export interface UsageBeaconResult {
  success: boolean;
  message: string;
  accepted: number;
}

/** Raw event as produced by the hook before client-side sanitisation. */
export interface UsageRawBeaconEvent {
  path: string;
  duration_sec?: number;
  session_start?: boolean;
}
