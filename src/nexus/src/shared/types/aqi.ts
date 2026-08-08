export const AQI_RANGE_KEYS = [
  'good',
  'moderate',
  'u4sg',
  'unhealthy',
  'very_unhealthy',
  'hazardous',
] as const;

export type AqiRangeKey = (typeof AQI_RANGE_KEYS)[number];

export interface AqiRange {
  key: AqiRangeKey;
  label: string;
  min_value: number;
  max_value: number | null;
  color: string;
  color_name?: string | null;
  display_order: number;
}

export interface AqiConfig {
  standard: string;
  source: string;
  version: string | null;
  effective_from: string | null;
  ranges: AqiRange[];
}

export interface AqiRangesResponse {
  success: boolean;
  message: string;
  data: AqiConfig;
}

export interface AqiRangeUpdate {
  key: AqiRangeKey;
  label: string;
  max_value: number | null;
  color: string;
  color_name?: string;
}

export interface UpdateAqiRangesRequest {
  admin_secret: string;
  ranges: AqiRangeUpdate[];
  updated_by?: string;
}
