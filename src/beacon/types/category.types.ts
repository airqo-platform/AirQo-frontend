/**
 * Category Type Definitions
 */

export interface CategoryBase {
  name: string;
  description?: string | null;
}

export interface Category extends CategoryBase {
  created_at: string;
  updated_at?: string | null;
  fields?: Record<string, string | null> | null;
  configs?: Record<string, string | null> | null;
  metadata?: Record<string, string | null> | null;
}

export interface DeviceConfigSummary {
  name: string;
  device_key: string;
  device_id: string;
  config_updated: boolean;
  recent_config: Record<string, string | null>;
}

export interface CategoryDevicesPagination {
  total: number;
  skip: number;
  limit: number | null;
  returned: number;
  pages: number;
  current_page: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface CategoryWithDevices extends Category {
  device_count: number;
  devices: DeviceConfigSummary[];
  pagination?: CategoryDevicesPagination | null;
}

export interface CategoryCreate {
  name: string;
  description?: string | null;
  fields?: Record<string, string | null> | null;
  configs?: Record<string, string | null> | null;
  metadata?: Record<string, string | null> | null;
}

export interface CategoryUpdate {
  name?: string;
  description?: string | null;
  fields?: Record<string, string | null> | null;
  configs?: Record<string, string | null> | null;
  metadata?: Record<string, string | null> | null;
}

export interface CategoryListParams {
  skip?: number;
  limit?: number;
}
