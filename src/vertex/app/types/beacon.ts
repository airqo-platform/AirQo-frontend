export type BeaconLifecycleState =
  | "HEALTHY"
  | "DEGRADING"
  | "SUSPICIOUS"
  | "LIKELY_FAILURE"
  | "FAILED"
  | "RECOVERING"
  | "NO_DATA";

export type BeaconIssueSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface BeaconDeviceIssue {
  issue_code: string;
  title: string;
  subsystem: string;
  severity: BeaconIssueSeverity;
  days_observed: number;
  first_seen: string;
  last_seen: string;
  is_active: boolean;
  current_streak_days: number;
}

export interface BeaconHealthTrendPoint {
  diagnosis_date: string;
  overall_health_score: number;
  lifecycle_state: BeaconLifecycleState;
  issue_count: number;
}

export interface BeaconDeviceIssueSummary {
  device_id: string;
  days_diagnosed: number;
  average_health_score?: number | null;
  latest_diagnosis_date?: string | null;
  latest_lifecycle_state?: BeaconLifecycleState | null;
  latest_headline?: string | null;
  issues: BeaconDeviceIssue[];
  health_trend: BeaconHealthTrendPoint[];
}

export interface BeaconReadingRow {
  datetime: string;
}

export interface BeaconDevicePerformance {
  device_name: string;
  uptime: number;
  data: BeaconReadingRow[];
}

export interface BeaconDeviceDiagnosis {
  diagnosis_date: string;
  overall_health_score: number;
  lifecycle_state: BeaconLifecycleState;
  issue_count: number;
  max_severity?: BeaconIssueSeverity | null;
  headline?: string | null;
}

export interface BeaconHealthDevice {
  device_id: string;
  device_name: string;
  uptime?: number | null;
  diagnostics?: BeaconDeviceDiagnosis | null;
}

export interface BeaconSummaryIssue {
  issue_code: string;
  title: string;
  severity: BeaconIssueSeverity;
  subsystem: string;
  device_count: number;
}

/** Roll-up of the latest diagnoses of the devices in a site or cohort. */
export interface BeaconDiagnosticsSummary {
  devices_total: number;
  devices_diagnosed: number;
  devices_not_diagnosed: number;
  devices_with_issues: number;
  average_health_score?: number | null;
  min_health_score?: number | null;
  lifecycle_state_counts: Partial<Record<BeaconLifecycleState, number>>;
  max_severity?: BeaconIssueSeverity | null;
  latest_diagnosis_date?: string | null;
  top_issues: BeaconSummaryIssue[];
}

export interface BeaconHealthContainer {
  name: string;
  number_of_devices?: number;
  uptime?: number | null;
  data?: BeaconReadingRow[];
  devices?: BeaconHealthDevice[];
  diagnostics_summary?: BeaconDiagnosticsSummary | null;
}
