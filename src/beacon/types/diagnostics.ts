export type LifecycleState =
  | "HEALTHY"
  | "DEGRADING"
  | "SUSPICIOUS"
  | "LIKELY_FAILURE"
  | "FAILED"
  | "RECOVERING";

export interface TelemetryMapping {
  key: string;
  label: string;
  unit?: string;
  source?: string;
}

export interface ConfigMapping {
  key: string;
  label: string;
  type?: "int" | "float" | "str" | "bool" | string;
  unit?: string;
  default?: any;
}

export interface MetadataMapping {
  key: string;
  label: string;
}

export interface MetricDefinition {
  id?: string;
  component_id?: string;
  key: string;
  name?: string;
  unit?: string;
  data_type?: "float" | "int" | "integer" | "bool" | "boolean" | "str" | "string";
  expected_min?: number | null;
  expected_max?: number | null;
  max_rate_of_change?: number | null;
  is_telemetry_field?: boolean;
  description?: string;
}

export type RelationshipType =
  | "MEASURES_SAME_AS"
  | "POWERS"
  | "COMMUNICATES_VIA"
  | "COOLS"
  | string;

export const RELATIONSHIP_OPTIONS = [
  {
    value: "MEASURES_SAME_AS",
    label: "MEASURES_SAME_AS",
    description: "Redundant / co-located sensors measuring the same parameter",
  },
  {
    value: "POWERS",
    label: "POWERS",
    description: "Supplies electrical power to component",
  },
  {
    value: "COMMUNICATES_VIA",
    label: "COMMUNICATES_VIA",
    description: "Transmits telemetry or data via bus / interface",
  },
  {
    value: "COOLS",
    label: "COOLS",
    description: "Provides thermal cooling or regulation",
  },
] as const;

export interface ComponentRelationship {
  id?: string;
  profile_id?: string;
  source_component?: string;
  source_component_id?: string;
  source_component_name?: string;
  target_component?: string;
  target_component_id?: string;
  target_component_name?: string;
  relation_type?: RelationshipType;
  relationship_type?: RelationshipType;
  criticality?: number;
  description?: string;
}

export interface ComponentDefinition {
  id?: string;
  profile_id?: string;
  name: string;
  component_type: "power" | "battery" | "sensor" | "connectivity" | "cooling" | "motor" | "compute" | "storage" | "actuator" | "other" | string;
  criticality: number; // 0.0 to 1.0
  x_coordinate?: number | null;
  y_coordinate?: number | null;
  x?: number | null;
  y?: number | null;
  meta_data?: Record<string, any> | null;
  metrics: MetricDefinition[];
}

export interface DeviceVendor {
  id?: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DeviceProfile {
  id: string;
  name: string;
  category: "air_quality" | "air_quality_gas" | "reference_monitor" | "cold_chain" | "solar" | "water_pump" | "weather_station" | "generic_iot" | string;
  description?: string | null;
  vendor?: string | DeviceVendor | null;
  vendor_id?: string | null;
  meta_data?: Record<string, any> | null;
  telemetry_mappings?: Record<string, TelemetryMapping>;
  config_mappings?: Record<string, ConfigMapping>;
  metadata_mappings?: Record<string, MetadataMapping>;
  components: ComponentDefinition[];
  relationships?: ComponentRelationship[];
  created_at?: string;
  updated_at?: string;
}

export function getVendorName(vendor?: string | DeviceVendor | null): string {
  if (!vendor) return "";
  if (typeof vendor === "string") return vendor;
  return vendor.name || "";
}

export interface ProfileCompleteness {
  isComplete: boolean;
  hasSlots: boolean;
  hasSubsystems: boolean;
  hasRelationships: boolean;
  missingItems: string[];
}

export function getProfileCompleteness(profile?: Partial<DeviceProfile> | null): ProfileCompleteness {
  if (!profile) {
    return {
      isComplete: false,
      hasSlots: false,
      hasSubsystems: false,
      hasRelationships: false,
      missingItems: ["Slot Mappings", "Subsystems", "Relationships"],
    };
  }

  const slotCount =
    Object.keys(profile.telemetry_mappings || {}).length +
    Object.keys(profile.config_mappings || {}).length +
    Object.keys(profile.metadata_mappings || {}).length;

  const hasSlots = slotCount > 0;
  const hasSubsystems = Boolean(profile.components && profile.components.length > 0);
  const hasRelationships = Boolean(profile.relationships && profile.relationships.length > 0);

  const missingItems: string[] = [];
  if (!hasSlots) missingItems.push("Slot Mappings");
  if (!hasSubsystems) missingItems.push("Subsystems");
  if (!hasRelationships) missingItems.push("Relationships");

  return {
    isComplete: hasSlots && hasSubsystems && hasRelationships,
    hasSlots,
    hasSubsystems,
    hasRelationships,
    missingItems,
  };
}

export function getRelationshipDetails(
  rel: ComponentRelationship,
  components?: ComponentDefinition[]
): {
  sourceName: string;
  targetName: string;
  relationType: string;
  sourceId?: string;
  targetId?: string;
} {
  const relType = rel.relationship_type || rel.relation_type || "POWERS";

  const sourceRef =
    rel.source_component_id ||
    rel.source_component ||
    rel.source_component_name ||
    "";

  const targetRef =
    rel.target_component_id ||
    rel.target_component ||
    rel.target_component_name ||
    "";

  const resolveCompName = (ref: string, fallbackName?: string): string => {
    if (!ref && !fallbackName) return "Unknown Subsystem";
    const found = (components || []).find((c) => c.id === ref || c.name === ref);
    if (found) return found.name;
    if (fallbackName) return fallbackName;
    // If it's a UUID and not found directly in components list, display a readable identifier
    if (ref.length > 20 && ref.includes("-")) {
      return `Subsystem (${ref.slice(0, 8)}...)`;
    }
    return ref;
  };

  const resolveCompId = (ref: string, fallbackId?: string): string | undefined => {
    if (!ref && !fallbackId) return undefined;
    const found = (components || []).find((c) => c.id === ref || c.name === ref);
    return found?.id || fallbackId || (ref.includes("-") ? ref : undefined);
  };

  return {
    sourceName: resolveCompName(sourceRef, rel.source_component_name || rel.source_component),
    targetName: resolveCompName(targetRef, rel.target_component_name || rel.target_component),
    relationType: relType,
    sourceId: resolveCompId(sourceRef, rel.source_component_id),
    targetId: resolveCompId(targetRef, rel.target_component_id),
  };
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

export interface HypothesisRule {
  id?: string;
  cause_id?: string;
  evidence_code: string;
  weight: number; // e.g. +4.5 (supporting) or -5.0 (refuting)
  is_mandatory: boolean;
  description?: string | null;
  component_name?: string;
}

// Backward-compatible alias
export type DiagnosticRule = HypothesisRule;

export interface TemplateSymptom {
  id?: string;
  template_id?: string;
  code: string; // e.g. SYMP_RAPID_DISCHARGE, SYMP_DUAL_PM_DIVERGENCE
  name: string; // e.g. "Overnight Battery Voltage Collapse"
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  evaluation_logic?: any;
  category?: string;
  threshold_condition?: string;
  evaluation_window?: string;
}

// Backward-compatible alias
export type DiagnosticSymptom = TemplateSymptom;

export interface TemplateCause {
  id?: string;
  template_id?: string;
  code: string; // e.g. CAUSE_BATTERY_DEGRADATION
  cause_code?: string; // alias for code
  title: string; // e.g. "Battery Capacity Loss / Internal Cell Degradation"
  category: "HARDWARE_FAILURE" | "MAINTENANCE_REQUIRED" | "FIRMWARE_OR_BUS_FAULT" | "ENVIRONMENTAL" | string;
  description?: string | null;
  recommended_action: string;
  hypothesis_rules: HypothesisRule[];
  rules?: HypothesisRule[]; // alias for hypothesis_rules
  default_severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface DiagnosticTemplate {
  id: string;
  name: string; // Human-readable template title
  target_component_type: "battery" | "sensor" | "connectivity" | "solar" | "cooling" | "motor" | "compute" | "storage" | "actuator" | "other" | string;
  category?: string; // alias for target_component_type
  version: string; // e.g. "1.0.0"
  description: string;
  symptoms: TemplateSymptom[];
  causes: TemplateCause[];
  target_profile_categories?: string[];
  created_at?: string;
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
