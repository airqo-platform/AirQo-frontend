export const DEVICE_CATEGORIES = [
  { value: "lowcost", label: "Low Cost" },
  { value: "bam", label: "BAM" },
  { value: "gas", label: "Gas" },
] as const;

export type DeviceCategory = typeof DEVICE_CATEGORIES[number]["value"];
