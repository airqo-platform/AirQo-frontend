import { config } from "@/lib/config";
import { fetchWithAuth } from "@/lib/api-client";
import { isMockMode } from "@/lib/mock-data";
import {
  DeviceHealthSnapshot,
  DiagnosticEvaluationResult,
  DiagnosticFeedbackCreate,
  DiagnosticTemplate,
  DeviceProfile,
  FleetTriageDeviceItem,
  FleetTriageSummary,
  LifecycleState,
} from "@/types/diagnostics";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_BEACON_API_URL || config.apiUrl || "http://localhost:8000";
  }
  return process.env.NEXT_PUBLIC_BEACON_API_URL || "http://localhost:8000";
};

const getAuthHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

// ==========================================
// SEED DATA & MOCK SIMULATION ENGINE
// ==========================================

export const DEFAULT_PROFILES: DeviceProfile[] = [
  {
    id: "prof_airqo_v5_dualpm",
    name: "AirQo v5 Dual-Laser PM Station",
    category: "air_quality",
    description: "Standard dual-optical particulate monitor with solar harvesting & LiFePO4 battery pack.",
    vendor: "AirQo / Makerere University",
    firmware_compatibility: ">=v4.2.0",
    created_at: "2026-01-15T08:00:00Z",
    components: [
      {
        id: "comp_pwr",
        name: "Power Subsystem",
        component_type: "power",
        criticality: 0.95,
        metrics: [
          { key: "battery_voltage", name: "Battery Voltage", unit: "V", expected_min: 11.2, expected_max: 14.6, is_telemetry_field: true },
          { key: "solar_voltage", name: "Solar PV Voltage", unit: "V", expected_min: 0.0, expected_max: 22.0, is_telemetry_field: true },
          { key: "battery_current", name: "Battery Net Current", unit: "mA", expected_min: -2500, expected_max: 4000, is_telemetry_field: true },
        ],
      },
      {
        id: "comp_sensor_primary",
        name: "Optical PM Sensor 1",
        component_type: "sensor",
        criticality: 0.9,
        metrics: [
          { key: "pm2_5", name: "PM 2.5 (Primary)", unit: "µg/m³", expected_min: 0, expected_max: 500, is_telemetry_field: true },
          { key: "pm10", name: "PM 10 (Primary)", unit: "µg/m³", expected_min: 0, expected_max: 1000, is_telemetry_field: true },
        ],
      },
      {
        id: "comp_sensor_secondary",
        name: "Optical PM Sensor 2",
        component_type: "sensor",
        criticality: 0.7,
        metrics: [
          { key: "pm2_5_sensor_2", name: "PM 2.5 (Secondary)", unit: "µg/m³", expected_min: 0, expected_max: 500, is_telemetry_field: true },
          { key: "pm10_sensor_2", name: "PM 10 (Secondary)", unit: "µg/m³", expected_min: 0, expected_max: 1000, is_telemetry_field: true },
        ],
      },
      {
        id: "comp_connectivity",
        name: "Cellular GSM/LTE Modem",
        component_type: "connectivity",
        criticality: 0.8,
        metrics: [
          { key: "rssi", name: "Signal RSSI", unit: "dBm", expected_min: -110, expected_max: -50, is_telemetry_field: true },
          { key: "packet_loss_rate", name: "Transmission Loss Rate", unit: "%", expected_min: 0, expected_max: 5, is_telemetry_field: true },
        ],
      },
    ],
    relationships: [
      { source_component: "Solar Subsystem", target_component: "Power Subsystem", relation_type: "POWERS" },
      { source_component: "Power Subsystem", target_component: "Optical PM Sensor 1", relation_type: "POWERS" },
      { source_component: "Power Subsystem", target_component: "Cellular GSM/LTE Modem", relation_type: "POWERS" },
    ],
  },
  {
    id: "prof_coldchain_ultralow",
    name: "ColdChain UltraLow Vaccine Freezer Monitor",
    category: "cold_chain",
    description: "Deep cryogenic and ultra-low temperature medical vaccine storage monitor (-86°C).",
    vendor: "CryoGlow Medical",
    firmware_compatibility: ">=v2.1.0",
    created_at: "2026-02-10T10:30:00Z",
    components: [
      {
        id: "comp_temp_chamber",
        name: "Internal Cryo Chamber",
        component_type: "sensor",
        criticality: 1.0,
        metrics: [
          { key: "chamber_temp_c", name: "Chamber Temp", unit: "°C", expected_min: -88.0, expected_max: -70.0, is_telemetry_field: true },
          { key: "evaporator_temp_c", name: "Evaporator Temp", unit: "°C", expected_min: -95.0, expected_max: -60.0, is_telemetry_field: true },
        ],
      },
      {
        id: "comp_compressor",
        name: "Cooling Compressor & Relay",
        component_type: "cooling",
        criticality: 0.95,
        metrics: [
          { key: "compressor_current_a", name: "Compressor Draw", unit: "A", expected_min: 1.2, expected_max: 8.5, is_telemetry_field: true },
          { key: "duty_cycle_pct", name: "Duty Cycle", unit: "%", expected_min: 20, expected_max: 85, is_telemetry_field: true },
        ],
      },
      {
        id: "comp_door",
        name: "Lid Seal & Alarm",
        component_type: "sensor",
        criticality: 0.7,
        metrics: [
          { key: "door_open_seconds", name: "Door Open Time", unit: "s", expected_min: 0, expected_max: 60, is_telemetry_field: true },
        ],
      },
    ],
    relationships: [
      { source_component: "Cooling Compressor & Relay", target_component: "Internal Cryo Chamber", relation_type: "COOLS" },
    ],
  },
  {
    id: "prof_solar_harvester",
    name: "Solar Microgrid & Inverter Monitor",
    category: "solar",
    description: "Multi-string solar harvesting and lithium storage station for off-grid power.",
    vendor: "SunVolt Power",
    firmware_compatibility: ">=v3.0.0",
    created_at: "2026-03-01T14:00:00Z",
    components: [
      {
        id: "comp_pv_strings",
        name: "PV Array Strings",
        component_type: "power",
        criticality: 0.9,
        metrics: [
          { key: "pv_string_voltage", name: "PV String Voltage", unit: "V", expected_min: 30.0, expected_max: 95.0, is_telemetry_field: true },
          { key: "pv_power_watts", name: "PV Yield", unit: "W", expected_min: 0, expected_max: 1200, is_telemetry_field: true },
        ],
      },
      {
        id: "comp_inverter",
        name: "DC/AC Inverter Unit",
        component_type: "power",
        criticality: 1.0,
        metrics: [
          { key: "ac_output_voltage", name: "AC Output", unit: "V", expected_min: 210, expected_max: 245, is_telemetry_field: true },
          { key: "inverter_temp_c", name: "Inverter Temp", unit: "°C", expected_min: 20, expected_max: 75, is_telemetry_field: true },
        ],
      },
    ],
    relationships: [
      { source_component: "PV Array Strings", target_component: "DC/AC Inverter Unit", relation_type: "POWERS" },
    ],
  },
  {
    id: "prof_smart_water_pump",
    name: "Smart Borehole & Submersible Pump",
    category: "water_pump",
    description: "Deep well water flow, pressure, and motor cavitation monitor.",
    vendor: "AquaFlow Technologies",
    firmware_compatibility: ">=v1.5.0",
    created_at: "2026-03-12T09:15:00Z",
    components: [
      {
        id: "comp_motor",
        name: "Submersible 3-Phase Motor",
        component_type: "motor",
        criticality: 1.0,
        metrics: [
          { key: "motor_current_a", name: "Phase Current", unit: "A", expected_min: 4.0, expected_max: 18.0, is_telemetry_field: true },
          { key: "vibration_rms", name: "Vibration RMS", unit: "mm/s", expected_min: 0.1, expected_max: 3.5, is_telemetry_field: true },
        ],
      },
      {
        id: "comp_hydraulics",
        name: "Hydraulic Manifold & Flow",
        component_type: "sensor",
        criticality: 0.85,
        metrics: [
          { key: "flow_rate_lpm", name: "Flow Rate", unit: "L/min", expected_min: 10, expected_max: 250, is_telemetry_field: true },
          { key: "head_pressure_bar", name: "Line Pressure", unit: "bar", expected_min: 1.5, expected_max: 9.0, is_telemetry_field: true },
        ],
      },
    ],
    relationships: [
      { source_component: "Submersible 3-Phase Motor", target_component: "Hydraulic Manifold & Flow", relation_type: "FEEDS" },
    ],
  },
];

export const DEFAULT_TEMPLATES: DiagnosticTemplate[] = [
  {
    id: "tpl_lifepo4_battery",
    name: "LiFePO4 Battery Pack Failure & Health Pack",
    category: "power",
    version: "2.3.0",
    description: "Evaluates rapid night discharge, internal resistance degradation, and solar charge efficiency.",
    target_profile_categories: ["air_quality", "solar", "weather_station"],
    symptoms: [
      {
        id: "sym_night_drop",
        code: "SYM_RAPID_NIGHT_VOLTAGE_DROP",
        name: "Rapid Overnight Voltage Collapse",
        description: "Battery voltage falls below 11.8V within 4 hours of sunset.",
        category: "power",
        threshold_condition: "delta_v_night < -1.4V",
        evaluation_window: "12 hours (sunset to sunrise)",
      },
      {
        id: "sym_low_yield",
        code: "SYM_SOLAR_HARVEST_DEFICIT",
        name: "Solar Charging Deficit",
        description: "Insufficient amp-hours generated during peak solar irradiance window.",
        category: "power",
        threshold_condition: "pv_yield_kwh < 0.15 * expected_irradiance",
        evaluation_window: "24 hours",
      },
    ],
    causes: [
      {
        cause_code: "CAUSE_BATTERY_CAPACITY_LOSS",
        title: "Battery Cell Capacity Degradation",
        category: "RESOURCE_DEPLETION",
        default_severity: "HIGH",
        recommended_action: "Schedule LiFePO4 battery pack replacement. Solar PV harvesting and MPPT controller are operating normally.",
        rules: [
          { id: "r1", evidence_code: "EVID_BATTERY_RAPID_NIGHT_DISCHARGE", description: "Night voltage discharge slope > 0.15V/hr", weight: 3.8, is_mandatory: true, component_name: "Power Subsystem" },
          { id: "r2", evidence_code: "EVID_SOLAR_INPUT_NORMAL", description: "Daytime solar panel peak voltage > 17.5V", weight: 2.5, is_mandatory: false, component_name: "Power Subsystem" },
          { id: "r3", evidence_code: "EVID_SOLAR_PV_DIRT_OR_SHADOW", description: "Solar harvesting restricted due to physical soiling", weight: -4.2, is_mandatory: false, component_name: "Power Subsystem" },
          { id: "r4", evidence_code: "EVID_CELL_MODEM_HIGH_TX_POWER", description: "Modem retries draining current excessively", weight: -2.8, is_mandatory: false, component_name: "Cellular GSM/LTE Modem" },
        ],
      },
      {
        cause_code: "CAUSE_SOLAR_PANEL_SOILING",
        title: "Solar Panel Soiling / Dust Deposition",
        category: "ENVIRONMENTAL",
        default_severity: "MEDIUM",
        recommended_action: "Clean solar panel surface during next site visit. Check tree foliage for seasonal shading.",
        rules: [
          { id: "r5", evidence_code: "EVID_SOLAR_INPUT_SUB_NOMINAL", description: "PV generation curve dampened by > 40%", weight: 4.1, is_mandatory: true, component_name: "Power Subsystem" },
          { id: "r6", evidence_code: "EVID_BATTERY_CHARGE_ACCEPTANCE_OK", description: "Battery accepts full charge current when available", weight: 2.1, is_mandatory: false, component_name: "Power Subsystem" },
        ],
      },
    ],
  },
  {
    id: "tpl_dual_optical_pm",
    name: "Dual Optical PM Sensor Drift & Contamination",
    category: "sensor",
    version: "1.8.0",
    description: "Monitors cross-sensor Pearson correlation, zero-offset drift, fan obstruction, and optical chamber fouling.",
    target_profile_categories: ["air_quality"],
    symptoms: [
      {
        id: "sym_divergence",
        code: "SYM_DUAL_SENSOR_DIVERGENCE",
        name: "Dual Channel Inter-Sensor Divergence",
        description: "Primary and secondary PM2.5 readings diverge by > 35% over a 6-hour moving window.",
        category: "sensor",
        threshold_condition: "abs(pm_ch1 - pm_ch2) / mean(pm_ch1, pm_ch2) > 0.35",
        evaluation_window: "6 hours",
      },
    ],
    causes: [
      {
        cause_code: "CAUSE_OPTICAL_CHAMBER_CONTAMINATION",
        title: "Optical Sensor Chamber Dust/Insect Contamination",
        category: "HARDWARE_FAILURE",
        default_severity: "HIGH",
        recommended_action: "Clean laser scattering chamber with compressed air or swap Sensor Unit 2. Recalibrate baseline zero-offset.",
        rules: [
          { id: "r7", evidence_code: "EVID_SENSOR_INTER_CHANNEL_DIVERGENCE", description: "Pearson correlation r < 0.65 between Channel 1 and Channel 2", weight: 4.5, is_mandatory: true, component_name: "Optical PM Sensor 2" },
          { id: "r8", evidence_code: "EVID_SENSOR_NOISE_FLOOR_ELEVATED", description: "Sensor 2 baseline noise floor elevated > 12 µg/m³ during clean air hours", weight: 3.2, is_mandatory: false, component_name: "Optical PM Sensor 2" },
          { id: "r9", evidence_code: "EVID_HIGH_AMBIENT_HUMIDITY_CONFIRMED", description: "High humidity fog causing optical particle swelling", weight: -3.6, is_mandatory: false, component_name: "Optical PM Sensor 1" },
        ],
      },
    ],
  },
  {
    id: "tpl_coldchain_cryo",
    name: "Ultra-Low Freezer Compressor & Thermal Breach",
    category: "cold_chain",
    version: "1.4.0",
    description: "Evaluates thermal excursion rates, compressor thermal relay lockout, and refrigerant leaks.",
    target_profile_categories: ["cold_chain"],
    symptoms: [
      {
        id: "sym_temp_rise",
        code: "SYM_CRYO_TEMPERATURE_EXCURSION",
        name: "Cryogenic Thermal Excursion",
        description: "Freezer core temp climbed above -70°C for more than 15 minutes.",
        category: "cooling",
        threshold_condition: "chamber_temp > -70.0 C",
        evaluation_window: "15 minutes",
      },
    ],
    causes: [
      {
        cause_code: "CAUSE_COMPRESSOR_RELAY_FAULT",
        title: "Cooling Compressor Relay Stalled / Overheated",
        category: "HARDWARE_FAILURE",
        default_severity: "CRITICAL",
        recommended_action: "Immediate technician dispatch required: Move vaccine batches to backup liquid nitrogen / dry-ice vessel immediately. Inspect stage-2 thermal relay and condenser airflow.",
        rules: [
          { id: "r10", evidence_code: "EVID_COMPRESSOR_CURRENT_ZERO_WHILE_CALLING_FOR_COOLING", description: "Thermostat calling for cooling but compressor draw is 0.0A", weight: 5.2, is_mandatory: true, component_name: "Cooling Compressor & Relay" },
          { id: "r11", evidence_code: "EVID_THERMAL_WARMING_RATE_ABNORMAL", description: "Chamber warming slope +1.8°C/hr", weight: 3.4, is_mandatory: false, component_name: "Internal Cryo Chamber" },
          { id: "r12", evidence_code: "EVID_DOOR_AJAR_TRIGGERED", description: "Door/lid contact switch shows open state", weight: -4.8, is_mandatory: false, component_name: "Lid Seal & Alarm" },
        ],
      },
    ],
  },
];

// Helper to calculate lifecycle state from health score
export const calculateLifecycleState = (healthScore: number, topConfidence: number = 0): LifecycleState => {
  if (healthScore < 20) return "FAILED";
  if (healthScore < 50 || topConfidence >= 85) return "LIKELY_FAILURE";
  if (healthScore < 70 || topConfidence >= 70) return "SUSPICIOUS";
  if (healthScore < 85) return "DEGRADING";
  return "HEALTHY";
};

// Generate realistic mock snapshot for a device ID
export const generateMockSnapshot = (deviceId: string): DeviceHealthSnapshot => {
  const isAirQuality = !deviceId.toLowerCase().includes("cold") && !deviceId.toLowerCase().includes("solar") && !deviceId.toLowerCase().includes("pump");
  const isColdChain = deviceId.toLowerCase().includes("cold") || deviceId.toLowerCase().includes("cryo");
  const isSolar = deviceId.toLowerCase().includes("solar") || deviceId.toLowerCase().includes("sun");
  const isWaterPump = deviceId.toLowerCase().includes("pump") || deviceId.toLowerCase().includes("aqua");

  if (isColdChain) {
    const healthScore = 42;
    return {
      id: `snap_${deviceId}_${Date.now()}`,
      device_id: deviceId,
      device_name: `Vaccine Freezer Unit #${deviceId}`,
      category: "cold_chain",
      timestamp: new Date().toISOString(),
      overall_health_score: healthScore,
      lifecycle_state: "LIKELY_FAILURE",
      subsystem_scores: {
        "Internal Cryo Chamber": 48,
        "Cooling Compressor & Relay": 22,
        "Lid Seal & Alarm": 94,
        "Backup Battery": 96,
      },
      active_evidences: [
        { code: "EVID_COMPRESSOR_CURRENT_ZERO_WHILE_CALLING_FOR_COOLING", component_name: "Cooling Compressor & Relay", description: "Thermostat calling for cooling but compressor draw is 0.0A", confidence: 0.98, value: "0.02 A", polarity: "SUPPORTING" },
        { code: "EVID_THERMAL_WARMING_RATE_ABNORMAL", component_name: "Internal Cryo Chamber", description: "Chamber warming slope +1.8°C/hr above baseline", confidence: 0.91, value: "-68.2 °C (Slope: +1.8 °C/hr)", polarity: "SUPPORTING" },
        { code: "EVID_DOOR_AJAR_TRIGGERED", component_name: "Lid Seal & Alarm", description: "Door/lid contact switch shows securely closed state", confidence: 0.99, value: "Closed (0s open)", polarity: "REFUTING" },
      ],
      detected_symptoms: ["SYM_CRYO_TEMPERATURE_EXCURSION", "SYM_COMPRESSOR_NO_CURRENT"],
      top_diagnoses: [
        {
          cause_code: "CAUSE_COMPRESSOR_RELAY_FAULT",
          title: "Cooling Compressor Relay Stalled / Overheated",
          category: "HARDWARE_FAILURE",
          confidence_percentage: 94.8,
          recommended_action: "Immediate technician dispatch required: Move vaccine batches to backup liquid nitrogen / dry-ice vessel immediately. Inspect stage-2 thermal relay and condenser airflow.",
          supporting_evidence: [
            { evidence: "Compressor draw 0.0A while cooling requested", contribution: 5.2 },
            { evidence: "Chamber temp slope +1.8°C/hr exceeds safety envelope", contribution: 3.4 },
          ],
          refuting_evidence: [
            { evidence: "Door seal sensor confirmed 100% closed (lid not left ajar)", contribution: -4.8 },
          ],
          severity: "CRITICAL",
        },
      ],
      evaluated_window_hours: 24,
      is_simulated: true,
    };
  }

  if (isSolar) {
    const healthScore = 78;
    return {
      id: `snap_${deviceId}_${Date.now()}`,
      device_id: deviceId,
      device_name: `Solar Harvester Site #${deviceId}`,
      category: "solar",
      timestamp: new Date().toISOString(),
      overall_health_score: healthScore,
      lifecycle_state: "DEGRADING",
      subsystem_scores: {
        "PV Array Strings": 64,
        "DC/AC Inverter Unit": 88,
        "Storage Bank": 91,
        "Telemetry": 99,
      },
      active_evidences: [
        { code: "EVID_SOLAR_INPUT_SUB_NOMINAL", component_name: "PV Array Strings", description: "PV generation curve dampened by 42% relative to irradiance sensor", confidence: 0.88, value: "Peak 540W vs Expected 930W", polarity: "SUPPORTING" },
        { code: "EVID_BATTERY_CHARGE_ACCEPTANCE_OK", component_name: "Storage Bank", description: "Battery internal resistance nominal; accepts maximum charge current", confidence: 0.94, value: "Ri = 22 mΩ", polarity: "SUPPORTING" },
      ],
      detected_symptoms: ["SYM_SOLAR_HARVEST_DEFICIT"],
      top_diagnoses: [
        {
          cause_code: "CAUSE_SOLAR_PANEL_SOILING",
          title: "Solar Panel Soiling / Heavy Dust Deposition",
          category: "ENVIRONMENTAL",
          confidence_percentage: 76.5,
          recommended_action: "Clean solar panel surface during next site visit. Check tree foliage for seasonal shading.",
          supporting_evidence: [
            { evidence: "Peak yield 42% below expected solar clear-sky model", contribution: 4.1 },
            { evidence: "Inverter conversion efficiency remains nominal at 97%", contribution: 2.1 },
          ],
          refuting_evidence: [
            { evidence: "Zero open-circuit diode faults detected on PV strings", contribution: -3.2 },
          ],
          severity: "MEDIUM",
        },
      ],
      evaluated_window_hours: 24,
      is_simulated: true,
    };
  }

  if (isWaterPump) {
    const healthScore = 55;
    return {
      id: `snap_${deviceId}_${Date.now()}`,
      device_id: deviceId,
      device_name: `Smart Borehole Pump #${deviceId}`,
      category: "water_pump",
      timestamp: new Date().toISOString(),
      overall_health_score: healthScore,
      lifecycle_state: "SUSPICIOUS",
      subsystem_scores: {
        "Submersible 3-Phase Motor": 48,
        "Hydraulic Manifold & Flow": 52,
        "Power Supply": 95,
      },
      active_evidences: [
        { code: "EVID_MOTOR_HIGH_VIBRATION", component_name: "Submersible 3-Phase Motor", description: "Vibration RMS 4.2 mm/s exceeds ISO vibration limit (3.5 mm/s)", confidence: 0.92, value: "4.2 mm/s", polarity: "SUPPORTING" },
        { code: "EVID_FLOW_RATE_FLUCTUATING", component_name: "Hydraulic Manifold & Flow", description: "Discharge flow rate fluctuating ±35% under constant motor RPM", confidence: 0.85, value: "110 L/min ± 38 L/min", polarity: "SUPPORTING" },
      ],
      detected_symptoms: ["SYM_PUMP_CAVITATION_SIGNATURE"],
      top_diagnoses: [
        {
          cause_code: "CAUSE_PUMP_IMPELLER_CAVITATION",
          title: "Impeller Cavitation / Low Well Water Head",
          category: "HARDWARE_FAILURE",
          confidence_percentage: 72.4,
          recommended_action: "Inspect well static water level. Reduce VFD pump RPM by 15% to prevent impeller cavitation erosion until groundwater recovers.",
          supporting_evidence: [
            { evidence: "Vibration RMS spiked to 4.2 mm/s at 50Hz operation", contribution: 3.8 },
            { evidence: "Discharge pressure erratic under steady electric supply", contribution: 2.4 },
          ],
          refuting_evidence: [
            { evidence: "Motor winding insulation resistance nominal (> 50 MΩ)", contribution: -2.1 },
          ],
          severity: "HIGH",
        },
      ],
      evaluated_window_hours: 24,
      is_simulated: true,
    };
  }

  // Default AirQo Station Diagnostic Snapshot
  const healthScore = 38;
  return {
    id: `snap_${deviceId}_${Date.now()}`,
    device_id: deviceId,
    device_name: `AirQo Node #${deviceId}`,
    category: "air_quality",
    timestamp: new Date().toISOString(),
    overall_health_score: healthScore,
    lifecycle_state: "LIKELY_FAILURE",
    subsystem_scores: {
      "Power System": 35,
      "Sensors": 92,
      "Connectivity": 98,
      "Cooling & Enclosure": 89,
    },
    active_evidences: [
      { code: "EVID_BATTERY_RAPID_NIGHT_DISCHARGE", component_name: "Power System", description: "Battery voltage dropped from 13.2V to 11.4V in 3.5 hours overnight", confidence: 1.0, value: "11.4 V (Drop: -1.8V)", polarity: "SUPPORTING" },
      { code: "EVID_SOLAR_INPUT_NORMAL", component_name: "Power System", description: "Daytime solar panel peak voltage nominal at 18.4V with 2.8A peak charge current", confidence: 0.92, value: "18.4 V / 2.8 A", polarity: "SUPPORTING" },
      { code: "EVID_CELL_MODEM_HIGH_TX_POWER", component_name: "Connectivity", description: "Cellular signal strong (-68 dBm); modem is not in high-power retry loop", confidence: 0.89, value: "RSSI: -68 dBm", polarity: "REFUTING" },
      { code: "EVID_SENSOR_INTER_CHANNEL_DIVERGENCE", component_name: "Sensors", description: "PM2.5 Sensor 1 and Sensor 2 maintain high correlation (r = 0.96)", confidence: 0.96, value: "r = 0.96", polarity: "REFUTING" },
    ],
    detected_symptoms: ["SYM_RAPID_NIGHT_VOLTAGE_DROP"],
    top_diagnoses: [
      {
        cause_code: "CAUSE_BATTERY_CAPACITY_LOSS",
        title: "Battery Cell Capacity Loss / Degradation",
        category: "RESOURCE_DEPLETION",
        confidence_percentage: 99.5,
        recommended_action: "Schedule LiFePO4 battery pack replacement during the next maintenance cycle. Solar PV harvesting and charge controller are operating normally.",
        supporting_evidence: [
          { evidence: "Rapid overnight voltage collapse (-1.8V in 3.5 hrs)", contribution: 3.8 },
          { evidence: "Normal daytime solar recharge curve confirms solar PV health", contribution: 2.5 },
        ],
        refuting_evidence: [
          { evidence: "No excessive cellular modem TX retries detected (ruled out power draw leak)", contribution: -2.8 },
          { evidence: "Zero short-circuit signatures across motherboard power rail", contribution: -4.6 },
        ],
        severity: "HIGH",
      },
      {
        cause_code: "CAUSE_SOLAR_PANEL_SOILING",
        title: "Solar Panel Soiling",
        category: "ENVIRONMENTAL",
        confidence_percentage: 18.2,
        recommended_action: "Clean solar panel surface during next routine visit.",
        supporting_evidence: [
          { evidence: "Slight 8% reduction in morning solar capture curve", contribution: 1.1 },
        ],
        refuting_evidence: [
          { evidence: "Mid-day peak wattage reached 48W / 50W rated capacity", contribution: -3.9 },
        ],
        severity: "LOW",
      },
    ],
    evaluated_window_hours: 24,
    is_simulated: true,
  };
};

export const generateMockHistory = (deviceId: string, count: number = 30): DeviceHealthSnapshot[] => {
  const history: DeviceHealthSnapshot[] = [];
  const now = Date.now();
  const stepMs = 24 * 3600 * 1000; // 1 day per step

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * stepMs).toISOString();
    // Simulate gradual health decline towards the end
    const baseScore = Math.max(25, Math.min(98, 92 - (count - 1 - i) * 1.8 + Math.sin(i) * 4));
    const score = Math.round(baseScore);
    const state = calculateLifecycleState(score);

    history.push({
      id: `snap_hist_${deviceId}_${i}`,
      device_id: deviceId,
      timestamp,
      overall_health_score: score,
      lifecycle_state: state,
      subsystem_scores: {
        "Power System": Math.max(20, Math.round(score * 0.9)),
        "Sensors": Math.min(100, Math.round(score * 1.05)),
        "Connectivity": Math.min(100, Math.round(95 + Math.sin(i) * 3)),
      },
      evaluated_window_hours: 24,
      is_simulated: true,
    });
  }

  return history;
};

// ==========================================
// SERVICE IMPLEMENTATION
// ==========================================

export const diagnosticsService = {
  /**
   * Fetch Latest Device Health & Diagnoses
   * GET /api/v1/diagnostics/devices/{device_id}/health
   */
  async getDeviceHealth(deviceId: string): Promise<DeviceHealthSnapshot> {
    if (isMockMode()) {
      return generateMockSnapshot(deviceId);
    }

    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/devices/${encodeURIComponent(deviceId)}/health`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Device health unavailable (${res.status} ${res.statusText})`);
    }

    return await res.json();
  },

  /**
   * Fetch Historical Health Trajectory
   * GET /api/v1/diagnostics/devices/{device_id}/health/history?limit=30
   */
  async getDeviceHealthHistory(deviceId: string, limit: number = 30): Promise<DeviceHealthSnapshot[]> {
    if (isMockMode()) {
      return generateMockHistory(deviceId, limit);
    }

    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/devices/${encodeURIComponent(deviceId)}/health/history?limit=${limit}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Device health history unavailable (${res.status} ${res.statusText})`);
    }

    return await res.json();
  },

  /**
   * Run Live On-Demand Device Evaluation
   * POST /api/v1/diagnostics/evaluate/{device_id}?save_snapshot=true
   */
  async evaluateDevice(
    deviceId: string,
    payload?: { context?: Record<string, any>; window_hours?: number }
  ): Promise<DiagnosticEvaluationResult> {
    try {
      const baseUrl = getBaseUrl();
      const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/evaluate/${encodeURIComponent(deviceId)}?save_snapshot=true`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload || { window_hours: 24 }),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("API evaluate error, falling back to local evaluation:", e);
    }

    // Local evaluation simulation
    const snapshot = generateMockSnapshot(deviceId);
    return {
      device_id: deviceId,
      overall_health_score: snapshot.overall_health_score,
      lifecycle_state: snapshot.lifecycle_state,
      subsystem_scores: snapshot.subsystem_scores,
      active_evidences: snapshot.active_evidences || [],
      detected_symptoms: snapshot.detected_symptoms || [],
      top_diagnoses: snapshot.top_diagnoses || [],
      evaluated_window_hours: payload?.window_hours || 24,
      timestamp: new Date().toISOString(),
      context: payload?.context,
    };
  },

  /**
   * Ad-Hoc Payload Evaluation (Simulator / Bench Tester)
   * POST /api/v1/diagnostics/evaluate-payload
   */
  async evaluatePayload(payload: {
    device_id: string;
    telemetry_window: any[];
    context?: Record<string, any>;
    window_hours?: number;
    profile_id?: string;
  }): Promise<DiagnosticEvaluationResult> {
    try {
      const baseUrl = getBaseUrl();
      const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/evaluate-payload`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("API evaluate-payload error, running in-memory bench evaluation:", e);
    }

    // High-fidelity in-memory heuristic engine for Simulator
    return simulateTelemetryEvaluation(payload);
  },

  /**
   * Submit Field Technician Feedback
   * POST /api/v1/diagnostics/feedback
   */
  async submitFeedback(feedback: DiagnosticFeedbackCreate): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const baseUrl = getBaseUrl();
      const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/feedback`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(feedback),
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, data };
      }
    } catch (e) {
      console.warn("Feedback endpoint unreachable, recording locally:", e);
    }

    // Persist in local storage for bench testing
    if (typeof window !== "undefined") {
      const existing = JSON.parse(localStorage.getItem("beacon_diagnostic_feedback") || "[]");
      existing.unshift({
        ...feedback,
        id: `fb_${Date.now()}`,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem("beacon_diagnostic_feedback", JSON.stringify(existing.slice(0, 50)));
    }

    return {
      success: true,
      data: {
        id: `fb_local_${Date.now()}`,
        ...feedback,
        created_at: new Date().toISOString(),
      },
    };
  },

  /**
   * Fetch Registered Device Profiles
   * GET /api/v1/diagnostics/profiles
   */
  async getProfiles(): Promise<DeviceProfile[]> {
    try {
      const baseUrl = getBaseUrl();
      const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/profiles`, {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const profiles = await res.json();
        if (Array.isArray(profiles) && profiles.length > 0) {
          return profiles;
        }
      }
    } catch (e) {
      console.warn("Profiles API error, using stored/default profiles:", e);
    }

    if (typeof window !== "undefined") {
      const custom = localStorage.getItem("beacon_custom_device_profiles");
      if (custom) {
        try {
          return JSON.parse(custom);
        } catch {}
      }
    }
    return DEFAULT_PROFILES;
  },

  /**
   * Save / Create Device Profile
   * POST /api/v1/diagnostics/profiles
   */
  async createProfile(profile: Partial<DeviceProfile>): Promise<DeviceProfile> {
    const newProfile: DeviceProfile = {
      id: profile.id || `prof_${Date.now()}`,
      name: profile.name || "Untitled Profile",
      category: profile.category || "generic_iot",
      description: profile.description || "",
      vendor: profile.vendor || "AirQo Custom",
      firmware_compatibility: profile.firmware_compatibility || ">=v1.0.0",
      components: profile.components || [],
      relationships: profile.relationships || [],
      created_at: new Date().toISOString(),
    };

    try {
      const baseUrl = getBaseUrl();
      const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/profiles`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newProfile),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Save profile API error, saving to local state:", e);
    }

    if (typeof window !== "undefined") {
      const current = await this.getProfiles();
      const updated = [newProfile, ...current.filter((p) => p.id !== newProfile.id)];
      localStorage.setItem("beacon_custom_device_profiles", JSON.stringify(updated));
    }

    return newProfile;
  },

  /**
   * Update Device Profile
   */
  async updateProfile(id: string, profile: Partial<DeviceProfile>): Promise<DeviceProfile> {
    try {
      const baseUrl = getBaseUrl();
      const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/profiles/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Update profile API error, updating local state:", e);
    }

    const current = await this.getProfiles();
    const index = current.findIndex((p) => p.id === id);
    if (index !== -1) {
      const updatedProfile = { ...current[index], ...profile, updated_at: new Date().toISOString() };
      current[index] = updatedProfile;
      if (typeof window !== "undefined") {
        localStorage.setItem("beacon_custom_device_profiles", JSON.stringify(current));
      }
      return updatedProfile;
    }
    throw new Error(`Profile with id ${id} not found`);
  },

  /**
   * Delete Device Profile
   */
  async deleteProfile(id: string): Promise<{ success: boolean }> {
    try {
      const baseUrl = getBaseUrl();
      const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/profiles/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        if (typeof window !== "undefined") {
          const current = await this.getProfiles();
          const updated = current.filter((p) => p.id !== id);
          localStorage.setItem("beacon_custom_device_profiles", JSON.stringify(updated));
        }
        return { success: true };
      }

      console.warn("Delete profile API responded with non-OK status:", res.status);
      return { success: false };
    } catch (e) {
      console.warn("Delete profile API error, falling back to local deletion:", e);
    }

    if (typeof window !== "undefined") {
      const current = await this.getProfiles();
      const updated = current.filter((p) => p.id !== id);
      localStorage.setItem("beacon_custom_device_profiles", JSON.stringify(updated));
    }
    return { success: true };
  },

  /**
   * Fetch Diagnostic Templates & Rule Packs
   * GET /api/v1/diagnostics/templates
   */
  async getTemplates(): Promise<DiagnosticTemplate[]> {
    try {
      const baseUrl = getBaseUrl();
      const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/templates`, {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        const templates = await res.json();
        if (Array.isArray(templates) && templates.length > 0) {
          return templates;
        }
      }
    } catch (e) {
      console.warn("Templates API error, using default templates:", e);
    }

    if (typeof window !== "undefined") {
      const custom = localStorage.getItem("beacon_custom_diagnostic_templates");
      if (custom) {
        try {
          return JSON.parse(custom);
        } catch {}
      }
    }
    return DEFAULT_TEMPLATES;
  },

  /**
   * Save / Create Diagnostic Template
   * POST /api/v1/diagnostics/templates
   */
  async createTemplate(template: Partial<DiagnosticTemplate>): Promise<DiagnosticTemplate> {
    const newTemplate: DiagnosticTemplate = {
      id: template.id || `tpl_${Date.now()}`,
      name: template.name || "Untitled Diagnostic Pack",
      category: template.category || "custom",
      version: template.version || "1.0.0",
      description: template.description || "",
      target_profile_categories: template.target_profile_categories || ["generic_iot"],
      symptoms: template.symptoms || [],
      causes: template.causes || [],
      updated_at: new Date().toISOString(),
    };

    try {
      const baseUrl = getBaseUrl();
      const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/templates`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newTemplate),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Save template API error, saving to local state:", e);
    }

    if (typeof window !== "undefined") {
      const current = await this.getTemplates();
      const updated = [newTemplate, ...current.filter((t) => t.id !== newTemplate.id)];
      localStorage.setItem("beacon_custom_diagnostic_templates", JSON.stringify(updated));
    }

    return newTemplate;
  },

  /**
   * Reset / Seed Default Profiles and Templates
   * POST /api/v1/diagnostics/seed-defaults
   */
  async seedDefaults(): Promise<{ message: string; profiles_seeded: number; templates_seeded: number }> {
    try {
      const baseUrl = getBaseUrl();
      const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/seed-defaults`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Seed defaults API error:", e);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("beacon_custom_device_profiles", JSON.stringify(DEFAULT_PROFILES));
      localStorage.setItem("beacon_custom_diagnostic_templates", JSON.stringify(DEFAULT_TEMPLATES));
    }

    return {
      message: "Successfully seeded default IoT profiles and diagnostic template rule packs.",
      profiles_seeded: DEFAULT_PROFILES.length,
      templates_seeded: DEFAULT_TEMPLATES.length,
    };
  },

  /**
   * Fleet-Wide Triage Data
   * GET /api/v1/diagnostics/fleet-triage
   */
  async getFleetTriage(filters?: {
    category?: string;
    lifecycle_state?: string;
    search?: string;
  }): Promise<{ summary: FleetTriageSummary; devices: FleetTriageDeviceItem[] }> {
    try {
      const baseUrl = getBaseUrl();
      const query = new URLSearchParams();
      if (filters?.category && filters.category !== "all") query.set("category", filters.category);
      if (filters?.lifecycle_state && filters.lifecycle_state !== "all") query.set("state", filters.lifecycle_state);
      if (filters?.search) query.set("search", filters.search);

      const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/fleet-triage?${query.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Fleet triage API error, generating fleet dataset:", e);
    }

    // High-fidelity fallback fleet dataset
    return generateMockFleetTriage(filters);
  },
};

// ==========================================
// SIMULATOR HEURISTIC EVALUATION ENGINE
// ==========================================

function simulateTelemetryEvaluation(payload: {
  device_id: string;
  telemetry_window: any[];
  context?: Record<string, any>;
  window_hours?: number;
  profile_id?: string;
}): DiagnosticEvaluationResult {
  const window = payload.telemetry_window || [];
  const count = window.length;
  const activeEvidences: DiagnosticEvaluationResult["active_evidences"] = [];
  const detectedSymptoms: string[] = [];
  const topDiagnoses: DiagnosticEvaluationResult["top_diagnoses"] = [];
  const subsystemScores: Record<string, number> = {
    "Power System": 90,
    "Sensors": 95,
    "Connectivity": 98,
  };

  if (count === 0) {
    return {
      device_id: payload.device_id,
      profile_id: payload.profile_id,
      overall_health_score: 100,
      lifecycle_state: "HEALTHY",
      subsystem_scores: subsystemScores,
      active_evidences: [],
      detected_symptoms: [],
      top_diagnoses: [],
      evaluated_window_hours: payload.window_hours || 24,
      timestamp: new Date().toISOString(),
    };
  }

  // 1. Analyze Battery & Solar PV
  const batteryVoltages = window.map((d) => d.battery_voltage).filter((v) => typeof v === "number");
  const solarVoltages = window.map((d) => d.solar_voltage).filter((v) => typeof v === "number");
  const pm1Vals = window.map((d) => d.pm2_5).filter((v) => typeof v === "number");
  const pm2Vals = window.map((d) => d.pm2_5_sensor_2).filter((v) => typeof v === "number");
  const chamberTemps = window.map((d) => d.chamber_temp_c).filter((v) => typeof v === "number");
  const compressorCurrents = window.map((d) => d.compressor_current_a).filter((v) => typeof v === "number");
  const pumpVibrations = window.map((d) => d.vibration_rms).filter((v) => typeof v === "number");

  let overallHealth = 95;

  // Battery collapse heuristic
  if (batteryVoltages.length >= 2) {
    const minV = Math.min(...batteryVoltages);
    const maxV = Math.max(...batteryVoltages);
    const deltaV = maxV - minV;

    if (minV < 11.5 && deltaV > 1.2) {
      detectedSymptoms.push("SYM_RAPID_NIGHT_VOLTAGE_DROP");
      activeEvidences.push({
        code: "EVID_BATTERY_RAPID_NIGHT_DISCHARGE",
        component_name: "Power System",
        description: `Rapid overnight voltage collapse detected: Min ${minV.toFixed(2)}V (Delta ${deltaV.toFixed(2)}V)`,
        confidence: 0.98,
        value: `${minV.toFixed(2)} V`,
        polarity: "SUPPORTING",
      });

      const maxSolar = solarVoltages.length > 0 ? Math.max(...solarVoltages) : 0;
      if (maxSolar >= 16.0) {
        activeEvidences.push({
          code: "EVID_SOLAR_INPUT_NORMAL",
          component_name: "Power System",
          description: `Solar PV harvesting is healthy (Peak PV Voltage: ${maxSolar.toFixed(1)}V)`,
          confidence: 0.94,
          value: `${maxSolar.toFixed(1)} V`,
          polarity: "SUPPORTING",
        });
      }

      subsystemScores["Power System"] = 32;
      overallHealth = Math.min(overallHealth, 36);

      topDiagnoses.push({
        cause_code: "CAUSE_BATTERY_CAPACITY_LOSS",
        title: "Battery Cell Capacity Loss & Rapid Night Collapse",
        category: "RESOURCE_DEPLETION",
        confidence_percentage: 98.6,
        recommended_action: "Schedule LiFePO4 battery pack replacement. Solar panel harvesting and charge controller remain healthy.",
        supporting_evidence: [
          { evidence: `Night voltage dropped below 11.5V (min: ${minV.toFixed(2)}V)`, contribution: 3.8 },
          { evidence: `Daytime solar peak reaches normal ${maxSolar.toFixed(1)}V`, contribution: 2.5 },
        ],
        refuting_evidence: [
          { evidence: "Cellular radio not in high-power reconnect retry loop", contribution: -2.8 },
        ],
        severity: "HIGH",
      });
    }
  }

  // Dual sensor divergence heuristic
  if (pm1Vals.length > 3 && pm2Vals.length > 3 && pm1Vals.length === pm2Vals.length) {
    let diffSum = 0;
    for (let i = 0; i < pm1Vals.length; i++) {
      const avg = (pm1Vals[i] + pm2Vals[i]) / 2 || 1;
      diffSum += Math.abs(pm1Vals[i] - pm2Vals[i]) / avg;
    }
    const divergence = diffSum / pm1Vals.length;

    if (divergence > 0.35) {
      detectedSymptoms.push("SYM_DUAL_SENSOR_DIVERGENCE");
      activeEvidences.push({
        code: "EVID_SENSOR_INTER_CHANNEL_DIVERGENCE",
        component_name: "Sensors",
        description: `Cross-channel particulate divergence ${(divergence * 100).toFixed(1)}% exceeds 35% threshold`,
        confidence: 0.95,
        value: `${(divergence * 100).toFixed(1)}%`,
        polarity: "SUPPORTING",
      });

      subsystemScores["Sensors"] = 45;
      overallHealth = Math.min(overallHealth, 48);

      topDiagnoses.push({
        cause_code: "CAUSE_OPTICAL_CHAMBER_CONTAMINATION",
        title: "Optical Sensor Chamber Dust/Insect Contamination",
        category: "HARDWARE_FAILURE",
        confidence_percentage: 88.4,
        recommended_action: "Clean laser scattering chamber with compressed air or swap Sensor Unit 2 during next maintenance.",
        supporting_evidence: [
          { evidence: `Channel 1 vs Channel 2 divergence reached ${(divergence * 100).toFixed(1)}%`, contribution: 4.5 },
        ],
        refuting_evidence: [
          { evidence: "Ambient relative humidity below condensation threshold (< 85%)", contribution: -3.2 },
        ],
        severity: "MEDIUM",
      });
    }
  }

  // Cold Chain Cryo Excursion heuristic
  if (chamberTemps.length > 0) {
    const maxTemp = Math.max(...chamberTemps);
    if (maxTemp > -70.0) {
      detectedSymptoms.push("SYM_CRYO_TEMPERATURE_EXCURSION");
      activeEvidences.push({
        code: "EVID_CRYO_THERMAL_EXCURSION",
        component_name: "Internal Cryo Chamber",
        description: `Chamber temperature climbed to ${maxTemp.toFixed(1)}°C (safe threshold: -70.0°C)`,
        confidence: 0.99,
        value: `${maxTemp.toFixed(1)} °C`,
        polarity: "SUPPORTING",
      });

      const avgCurr = compressorCurrents.length > 0 ? compressorCurrents.reduce((a, b) => a + b, 0) / compressorCurrents.length : 0;
      if (avgCurr < 0.5) {
        activeEvidences.push({
          code: "EVID_COMPRESSOR_CURRENT_ZERO_WHILE_CALLING_FOR_COOLING",
          component_name: "Cooling Compressor & Relay",
          description: "Cooling requested but compressor electrical current draw is 0.0A",
          confidence: 0.97,
          value: `${avgCurr.toFixed(2)} A`,
          polarity: "SUPPORTING",
        });

        subsystemScores["Cooling"] = 15;
        overallHealth = Math.min(overallHealth, 25);

        topDiagnoses.push({
          cause_code: "CAUSE_COMPRESSOR_RELAY_FAULT",
          title: "Cooling Compressor Thermal Relay Stalled / Tripped",
          category: "HARDWARE_FAILURE",
          confidence_percentage: 96.5,
          recommended_action: "CRITICAL: Immediate vaccine transfer to backup freezer required! Inspect stage-2 thermal relay and condenser fans.",
          supporting_evidence: [
            { evidence: `Chamber breached safety envelope at ${maxTemp.toFixed(1)}°C`, contribution: 5.2 },
            { evidence: "Compressor draw 0.0A while cooling requested", contribution: 4.8 },
          ],
          refuting_evidence: [
            { evidence: "Lid contact seal shows zero door-ajar openings", contribution: -4.8 },
          ],
          severity: "CRITICAL",
        });
      }
    }
  }

  // Smart Water Pump Vibration / Cavitation
  if (pumpVibrations.length > 0) {
    const maxVib = Math.max(...pumpVibrations);
    if (maxVib > 3.5) {
      detectedSymptoms.push("SYM_PUMP_CAVITATION_SIGNATURE");
      activeEvidences.push({
        code: "EVID_MOTOR_HIGH_VIBRATION",
        component_name: "Submersible 3-Phase Motor",
        description: `Pump vibration RMS ${maxVib.toFixed(2)} mm/s exceeds ISO safety threshold (3.5 mm/s)`,
        confidence: 0.91,
        value: `${maxVib.toFixed(2)} mm/s`,
        polarity: "SUPPORTING",
      });

      subsystemScores["Motor"] = 42;
      overallHealth = Math.min(overallHealth, 52);

      topDiagnoses.push({
        cause_code: "CAUSE_PUMP_IMPELLER_CAVITATION",
        title: "Impeller Cavitation / Low Hydraulic Head Pressure",
        category: "HARDWARE_FAILURE",
        confidence_percentage: 78.0,
        recommended_action: "Reduce VFD pump motor speed by 15% and verify groundwater recharge rate.",
        supporting_evidence: [
          { evidence: `Vibration RMS reached ${maxVib.toFixed(2)} mm/s`, contribution: 3.8 },
        ],
        refuting_evidence: [
          { evidence: "Motor 3-phase current balance nominal (< 5% phase variance)", contribution: -2.1 },
        ],
        severity: "HIGH",
      });
    }
  }

  // If no faults detected, mark healthy
  if (topDiagnoses.length === 0) {
    activeEvidences.push({
      code: "EVID_ALL_TELEMETRY_IN_SPEC",
      component_name: "System",
      description: "All telemetry values conform to expected operational limits.",
      confidence: 1.0,
      value: "Nominal",
      polarity: "NEUTRAL",
    });
  }

  const topConf = topDiagnoses.length > 0 ? topDiagnoses[0].confidence_percentage : 0;
  const lifecycle = calculateLifecycleState(overallHealth, topConf);

  return {
    device_id: payload.device_id,
    profile_id: payload.profile_id,
    overall_health_score: overallHealth,
    lifecycle_state: lifecycle,
    subsystem_scores: subsystemScores,
    active_evidences: activeEvidences,
    detected_symptoms: detectedSymptoms,
    top_diagnoses: topDiagnoses,
    evaluated_window_hours: payload.window_hours || 24,
    timestamp: new Date().toISOString(),
    context: payload.context,
  };
}

// Generate realistic mock fleet triage dataset
function generateMockFleetTriage(filters?: {
  category?: string;
  lifecycle_state?: string;
  search?: string;
}): { summary: FleetTriageSummary; devices: FleetTriageDeviceItem[] } {
  const allDevices: FleetTriageDeviceItem[] = [
    {
      device_id: "aq_gaba_01",
      device_name: "AirQo Gaba Water Station",
      category: "air_quality",
      cohort: "Kampala Urban Core",
      site: "Gaba Landing Site",
      overall_health_score: 35,
      lifecycle_state: "LIKELY_FAILURE",
      top_diagnosis: { cause_code: "CAUSE_BATTERY_CAPACITY_LOSS", title: "Battery Cell Capacity Loss", confidence_percentage: 99.5 },
      subsystem_scores: { "Power System": 35, "Sensors": 92, "Connectivity": 98 },
      last_evaluated: "10 mins ago",
    },
    {
      device_id: "aq_makerere_02",
      device_name: "AirQo Makerere Lab Collocation",
      category: "air_quality",
      cohort: "Kampala Urban Core",
      site: "Makerere CoCIS",
      overall_health_score: 96,
      lifecycle_state: "HEALTHY",
      subsystem_scores: { "Power System": 98, "Sensors": 96, "Connectivity": 100 },
      last_evaluated: "14 mins ago",
    },
    {
      device_id: "aq_jinja_05",
      device_name: "AirQo Jinja Industrial Hub",
      category: "air_quality",
      cohort: "Eastern Region",
      site: "Jinja Highway",
      overall_health_score: 48,
      lifecycle_state: "LIKELY_FAILURE",
      top_diagnosis: { cause_code: "CAUSE_OPTICAL_CHAMBER_CONTAMINATION", title: "Optical PM Sensor Contamination", confidence_percentage: 89.2 },
      subsystem_scores: { "Power System": 88, "Sensors": 42, "Connectivity": 95 },
      last_evaluated: "25 mins ago",
    },
    {
      device_id: "cryo_freezer_04",
      device_name: "National Vaccine Depot Freezer 4",
      category: "cold_chain",
      cohort: "Central Medical Stores",
      site: "Entebbe Cold Hub",
      overall_health_score: 22,
      lifecycle_state: "FAILED",
      top_diagnosis: { cause_code: "CAUSE_COMPRESSOR_RELAY_FAULT", title: "Compressor Relay Stalled", confidence_percentage: 98.1 },
      subsystem_scores: { "Cryo Chamber": 40, "Compressor": 15, "Power": 98 },
      last_evaluated: "5 mins ago",
    },
    {
      device_id: "sun_soroti_01",
      device_name: "Soroti Solar Microgrid Node 1",
      category: "solar",
      cohort: "Renewable Offgrid Hubs",
      site: "Soroti Substation",
      overall_health_score: 74,
      lifecycle_state: "DEGRADING",
      top_diagnosis: { cause_code: "CAUSE_SOLAR_PANEL_SOILING", title: "Solar Panel Soiling / Dust", confidence_percentage: 76.4 },
      subsystem_scores: { "PV Array": 65, "Inverter": 90, "Storage": 94 },
      last_evaluated: "32 mins ago",
    },
    {
      device_id: "pump_lira_02",
      device_name: "Lira Borehole Water Pump 2",
      category: "water_pump",
      cohort: "Northern Water Security",
      site: "Lira Municipal Well",
      overall_health_score: 58,
      lifecycle_state: "SUSPICIOUS",
      top_diagnosis: { cause_code: "CAUSE_PUMP_IMPELLER_CAVITATION", title: "Impeller Cavitation & Vibration", confidence_percentage: 74.0 },
      subsystem_scores: { "Motor": 52, "Flow & Pressure": 58, "Power": 96 },
      last_evaluated: "45 mins ago",
    },
    {
      device_id: "aq_mbarara_03",
      device_name: "AirQo Mbarara Regional Hub",
      category: "air_quality",
      cohort: "Western Region",
      site: "Mbarara High Street",
      overall_health_score: 82,
      lifecycle_state: "DEGRADING",
      top_diagnosis: { cause_code: "CAUSE_SOLAR_PANEL_SOILING", title: "Solar Panel Soiling", confidence_percentage: 68.0 },
      subsystem_scores: { "Power System": 78, "Sensors": 94, "Connectivity": 96 },
      last_evaluated: "1 hour ago",
    },
    {
      device_id: "cryo_freezer_09",
      device_name: "Mulago Hospital Vaccine Clinic",
      category: "cold_chain",
      cohort: "Hospital Clinics",
      site: "Mulago Pediatric Wing",
      overall_health_score: 92,
      lifecycle_state: "HEALTHY",
      subsystem_scores: { "Cryo Chamber": 94, "Compressor": 91, "Power": 98 },
      last_evaluated: "12 mins ago",
    },
    {
      device_id: "aq_fortportal_01",
      device_name: "AirQo Fort Portal Eco Station",
      category: "air_quality",
      cohort: "Western Region",
      site: "Kabarole Forest Edge",
      overall_health_score: 88,
      lifecycle_state: "RECOVERING",
      subsystem_scores: { "Power System": 89, "Sensors": 92, "Connectivity": 94 },
      last_evaluated: "18 mins ago",
    },
  ];

  let filtered = allDevices;

  if (filters?.category && filters.category !== "all") {
    filtered = filtered.filter((d) => d.category.toLowerCase() === filters.category!.toLowerCase());
  }

  if (filters?.lifecycle_state && filters.lifecycle_state !== "all") {
    filtered = filtered.filter((d) => d.lifecycle_state === filters.lifecycle_state);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.device_id.toLowerCase().includes(q) ||
        d.device_name.toLowerCase().includes(q) ||
        (d.site && d.site.toLowerCase().includes(q)) ||
        (d.cohort && d.cohort.toLowerCase().includes(q)) ||
        (d.top_diagnosis && d.top_diagnosis.title.toLowerCase().includes(q))
    );
  }

  const summary: FleetTriageSummary = {
    total_devices: allDevices.length,
    healthy_count: allDevices.filter((d) => d.lifecycle_state === "HEALTHY").length,
    degrading_count: allDevices.filter((d) => d.lifecycle_state === "DEGRADING").length,
    suspicious_count: allDevices.filter((d) => d.lifecycle_state === "SUSPICIOUS").length,
    likely_failure_count: allDevices.filter((d) => d.lifecycle_state === "LIKELY_FAILURE").length,
    failed_count: allDevices.filter((d) => d.lifecycle_state === "FAILED").length,
    recovering_count: allDevices.filter((d) => d.lifecycle_state === "RECOVERING").length,
    failure_modes_distribution: [
      { name: "Battery Capacity Degradation", count: 42, percentage: 42, category: "Power" },
      { name: "Optical Sensor Dust Contamination", count: 28, percentage: 28, category: "Sensors" },
      { name: "Solar Panel Soiling / Shading", count: 15, percentage: 15, category: "Power" },
      { name: "Compressor Relay Failure", count: 8, percentage: 8, category: "Cooling" },
      { name: "Motor Cavitation & Vibration", count: 7, percentage: 7, category: "Motor" },
    ],
  };

  return { summary, devices: filtered };
}
