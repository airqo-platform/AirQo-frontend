export const DEVICE_CATEGORIES = [
  { value: "lowcost", label: "Low Cost" },
  { value: "bam", label: "Reference Monitor" },
  { value: "gas", label: "Gas" },
] as const;

export type DeviceCategory = typeof DEVICE_CATEGORIES[number]["value"];

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
