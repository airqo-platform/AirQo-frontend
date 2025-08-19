export const DEVICE_CATEGORIES = [
  { value: "lowcost", label: "Low Cost" },
  { value: "bam", label: "BAM" },
  { value: "gas", label: "Gas" },
] as const;

export type DeviceCategory = typeof DEVICE_CATEGORIES[number]["value"];

export const DEVICE_POWER_TYPES = [
  { value: "solar", label: "Solar" },
  { value: "battery", label: "Battery" },
  { value: "mains", label: "Mains" },
] as const;

export type DevicePowerType = typeof DEVICE_POWER_TYPES[number]["value"];
