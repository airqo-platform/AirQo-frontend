export type LifecycleState =
  | "HEALTHY"
  | "DEGRADING"
  | "SUSPICIOUS"
  | "LIKELY_FAILURE"
  | "FAILED"
  | "RECOVERING";

export interface MetricDefinition {
  id?: string;
  key: string;
  name?: string;
  unit?: string;
  data_type?: "float" | "integer" | "boolean" | "string";
  expected_min?: number;
  expected_max?: number;
  max_rate_of_change?: number;
  is_telemetry_field?: boolean;
  description?: string;
}

export interface ComponentRelationship {
  id?: string;
  source_component: string;
  target_component: string;
  relation_type: "POWERS" | "CONNECTS_TO" | "COOLS" | "MONITORS" | "CONTROLS" | "FEEDS";
  description?: string;
}

export interface ComponentDefinition {
  id?: string;
  name: string;
  component_type: "power" | "sensor" | "connectivity" | "cooling" | "motor" | "compute" | "storage" | "actuator" | "other";
  criticality: number; // 0.0 to 1.0
  metrics?: MetricDefinition[];
  meta_data?: Record<string, any>;
}

export interface DeviceProfile {
  id: string;
  name: string;
  category: "air_quality" | "cold_chain" | "solar" | "water_pump" | "weather_station" | "generic_iot" | string;
  description?: string;
  vendor?: string;
  firmware_compatibility?: string;
  components: ComponentDefinition[];
  relationships?: ComponentRelationship[];
  created_at?: string;
  updated_at?: string;
}

export interface EvidenceContribution {
  evidence: string;
  contribution: number;
  description?: string;
}

export interface DiagnosisResult {
  cause_code: string;
  title: string;
  category?: "HARDWARE_FAILURE" | "RESOURCE_DEPLETION" | "ENVIRONMENTAL" | "CALIBRATION" | "CONNECTIVITY" | "FIRMWARE" | string;
  confidence_percentage: number;
  supporting_evidence: EvidenceContribution[];
  refuting_evidence: EvidenceContribution[];
  recommended_action: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface EvidenceFact {
  code: string;
  component_name: string;
  description: string;
  confidence: number;
  value: any;
  polarity?: "SUPPORTING" | "REFUTING" | "NEUTRAL";
}

export interface DiagnosticEvaluationResult {
  device_id: string;
  profile_id?: string;
  overall_health_score: number;
  lifecycle_state: LifecycleState;
  subsystem_scores: Record<string, number>;
  active_evidences: EvidenceFact[];
  detected_symptoms: string[];
  top_diagnoses: DiagnosisResult[];
  evaluated_window_hours: number;
  timestamp: string;
  context?: Record<string, any>;
}

export interface DeviceHealthSnapshot {
  id: string;
  device_id: string;
  device_name?: string;
  category?: string;
  timestamp: string;
  overall_health_score: number;
  lifecycle_state: LifecycleState;
  subsystem_scores: Record<string, number>;
  active_evidences?: EvidenceFact[];
  detected_symptoms?: string[];
  top_diagnoses?: DiagnosisResult[];
  evaluated_window_hours: number;
  is_simulated?: boolean;
}

export interface DiagnosticFeedbackCreate {
  snapshot_id?: string;
  device_id: string;
  technician_user_id: string;
  confirmed_cause_code: string;
  was_prediction_accurate: boolean;
  actions_taken?: string;
  technician_notes?: string;
}

export interface DiagnosticFeedbackRecord extends DiagnosticFeedbackCreate {
  id: string;
  created_at: string;
}

export interface DiagnosticRule {
  id: string;
  evidence_code: string;
  description: string;
  weight: number; // e.g. +3.5 or -5.0
  is_mandatory: boolean;
  component_name?: string;
}

export interface DiagnosticSymptom {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  threshold_condition: string;
  evaluation_window: string;
}

export interface DiagnosticTemplate {
  id: string;
  name: string;
  category: string;
  version: string;
  description: string;
  target_profile_categories: string[];
  symptoms: DiagnosticSymptom[];
  causes: {
    cause_code: string;
    title: string;
    category: string;
    default_severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    recommended_action: string;
    rules: DiagnosticRule[];
  }[];
  updated_at?: string;
}

export interface FleetTriageDeviceItem {
  device_id: string;
  device_name: string;
  category: string;
  cohort?: string;
  site?: string;
  overall_health_score: number;
  lifecycle_state: LifecycleState;
  top_diagnosis?: {
    cause_code: string;
    title: string;
    confidence_percentage: number;
  };
  subsystem_scores: Record<string, number>;
  last_evaluated: string;
}

export interface FleetTriageSummary {
  total_devices: number;
  healthy_count: number;
  degrading_count: number;
  suspicious_count: number;
  likely_failure_count: number;
  failed_count: number;
  recovering_count: number;
  failure_modes_distribution: {
    name: string;
    count: number;
    percentage: number;
    category: string;
  }[];
}
