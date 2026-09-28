/**
 * Types for the admin "API Key Usage" endpoints (System module).
 *
 * Endpoints (relative to the versioned API base URL — build paths with the
 * shared routing helpers, never inline the version prefix):
 * - GET /users/usage/api-keys                    → leaderboard / table
 * - GET /users/usage/api-keys/timeseries         → usage over time chart
 * - GET /users/usage/api-keys/:clientId          → single-key drill-down
 *
 * All dates are UTC (`YYYY-MM-DD`), all timestamps are ISO-8601 UTC.
 */

export interface ApiKeyUsageOwnerOrganisation {
  group_id: string;
  title: string;
}

export interface ApiKeyUsageOwner {
  user_id: string;
  email: string | null;
  name: string | null;
  organisations: ApiKeyUsageOwnerOrganisation[];
}

export interface ApiKeyUsageKey {
  client_id: string;
  key_name: string;
  client_name: string;
  tier: string;
  client_active: boolean;
  auto_suspended: boolean;
  key_expires: string | null;
  deleted: boolean;
  owner: ApiKeyUsageOwner | null;
}

export interface ApiKeyUsageRange {
  from: string;
  to: string;
  days: number;
}

export interface ApiKeyUsageTotals {
  keys: number;
  calls: number;
}

export interface ApiKeyUsageMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiKeyUsageLeaderboardKey extends ApiKeyUsageKey {
  rank: number;
  calls: number;
  share_pct: number;
  active_days: number;
  avg_calls_per_active_day: number;
  peak_day_calls: number;
  services: Record<string, number>;
  first_seen: string | null;
  last_seen: string | null;
  last_ip: string | null;
}

export interface ApiKeyUsageLeaderboardData {
  range: ApiKeyUsageRange;
  service: string | null;
  totals: ApiKeyUsageTotals;
  keys: ApiKeyUsageLeaderboardKey[];
  meta: ApiKeyUsageMeta;
}

export interface ApiKeyUsageLeaderboardParams {
  from?: string;
  to?: string;
  service?: string;
  user_id?: string;
  sort?: 'calls' | 'active_days' | 'peak_day_calls' | 'last_used';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  /** Only forced by the CSV export helper; JSON calls never send it. */
  format?: 'json' | 'csv';
}

export interface ApiKeyUsageTimeseriesParams {
  from?: string;
  to?: string;
  interval?: 'day' | 'hour';
  top?: number;
  client_id?: string;
  service?: string;
  user_id?: string;
}

export interface ApiKeyUsageTimeseriesSeries {
  client_id: string;
  label: string;
  owner_name?: string | null;
  owner_email?: string | null;
  total: number;
  data: number[];
}

export interface ApiKeyUsageTimeseriesData {
  range: ApiKeyUsageRange;
  interval: 'day' | 'hour';
  service: string | null;
  labels: string[];
  series: ApiKeyUsageTimeseriesSeries[];
  /** Sum of every key not in `series`; `null` when `client_id` was passed. */
  other: number[] | null;
  total: number[];
}

export interface ApiKeyUsageDetailParams {
  from?: string;
  to?: string;
}

export interface ApiKeyUsageDetailTotals {
  calls: number;
  active_days: number;
  peak_day_calls: number;
  last_seen: string | null;
  last_ip: string | null;
}

export interface ApiKeyUsageDailyPoint {
  day: string;
  calls: number;
}

export interface ApiKeyUsageServiceShare {
  service: string;
  calls: number;
  share_pct: number;
}

export interface ApiKeyUsageRoute {
  method: string;
  path: string;
  calls: number;
  share_pct: number;
}

export interface ApiKeyUsageHourPoint {
  hour: number;
  calls: number;
}

export interface ApiKeyUsageIp {
  ip: string;
  calls: number;
}

export interface ApiKeyUsageDetailData {
  range: ApiKeyUsageRange;
  key: ApiKeyUsageKey;
  totals: ApiKeyUsageDetailTotals;
  daily: ApiKeyUsageDailyPoint[];
  services: ApiKeyUsageServiceShare[];
  routes: ApiKeyUsageRoute[];
  hours_utc: ApiKeyUsageHourPoint[];
  ips: ApiKeyUsageIp[];
}
