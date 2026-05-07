export const DEVICE_CATEGORIES = [
  { value: "lowcost", label: "Low Cost" },
  { value: "bam", label: "Reference Monitor" },
  { value: "gas", label: "Gas" },
] as const;

export type DeviceCategory = typeof DEVICE_CATEGORIES[number]["value"];

export const DEVICE_DEPLOYMENT_TYPES = [
  { value: "static", label: "Static" },
  { value: "mobile", label: "Mobile" },
] as const;

export type DeviceDeploymentType =
  typeof DEVICE_DEPLOYMENT_TYPES[number]["value"];

// Bulk update jobs API uses string values for mobility (e.g. "fixed").
export const DEVICE_MOBILITY_TYPES = [
  { value: "fixed", label: "Fixed" },
  { value: "mobile", label: "Mobile" },
] as const;

export type DeviceMobilityType = typeof DEVICE_MOBILITY_TYPES[number]["value"];

export const DEVICE_STATUSES = [
  { value: "deployed", label: "Deployed" },
  { value: "not deployed", label: "Not Deployed" },
  { value: "recalled", label: "Recalled" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
] as const;

export type DeviceStatus = typeof DEVICE_STATUSES[number]["value"];

export const DEVICE_IS_ACTIVE_OPTIONS = [
  { value: true, label: "Active" },
  { value: false, label: "Inactive" },
] as const;

export const DEVICE_POWER_TYPES = [
  { value: "solar", label: "Solar" },
  { value: "battery", label: "Battery" },
  { value: "mains", label: "Mains" },
] as const;

export type DevicePowerType = typeof DEVICE_POWER_TYPES[number]["value"];

export const DEFAULT_COHORT_TAGS = [
  { value: "organizational", label: "organizational" },
  { value: "individual", label: "individual" },
  { value: "hardware", label: "hardware" },
  { value: "inlab", label: "inlab"},
  { value: "misc", label: "misc" }
]

export const DEFAULT_DEVICE_TAGS = [
  { value: "urban", label: "urban" },
  { value: "rural", label: "rural" },
  { value: "industrial", label: "industrial" },
  { value: "residential", label: "residential" },
  { value: "commercial", label: "commercial" },
  { value: "inlab", label: "inlab" },
  { value: "reference-station", label: "reference-station" },
  { value: "pilot", label: "pilot" }
]
