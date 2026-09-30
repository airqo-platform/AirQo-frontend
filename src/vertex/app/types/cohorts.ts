export interface Cohort {
  _id: string;
  /**
   * Optional self-service identifier chosen at creation time (lowercase
   * letters, digits and hyphens). Accepted anywhere a cohort id is, alongside
   * the Mongo `_id`.
   */
  cohort_slug?: string;
  visibility: boolean;
  cohort_tags: string[];
  cohort_codes: string[];
  name: string;
  network: string;
  groups: string[];
  numberOfDevices: number;
  devices: Device[];
  createdAt?: string;
}

export interface CohortsSummaryResponse {
  success: boolean;
  message: string;
  meta: {
    total: number;
    limit: number;
    skip: number;
    page: number;
    totalPages: number;
  };
  cohorts: Cohort[];
}

export interface GroupCohortsResponse {
  success: boolean;
  message: string;
  data: string[];
}

export interface PersonalUserCohortsResponse {
  success: boolean;
  message: string;
  cohorts: string[];
}

export interface OriginalCohortResponse {
  success: boolean;
  message: string;
  original_cohort: Cohort;
}

interface Grid {
    _id: string;
    visibility: boolean;
    name: string;
    admin_level: string;
    network: string;
    long_name: string;
    createdAt: string;
    sites: Site[];
}

interface Site {
  _id: string;
  isOnline: boolean;
  formatted_name: string;
  location_name: string;
  search_name: string;
  city: string;
  district: string;
  county: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  name: string;
  approximate_latitude: number;
  approximate_longitude: number;
  generated_name: string;
  data_provider: string;
  description: string;
  site_category: SiteCategory;
  groups: string[];
  grids: Grid[];
  devices: Device[];
  airqlouds: unknown[];
  createdAt: string;
  updatedAt?: string;
}

interface SiteCategory {
    tags: string[];
    area_name: string;
    category: string;
    highway: string;
    landuse: string;
    latitude: number;
    longitude: number;
    natural: string;
    search_radius: number;
    waterway: string;
  }
  
interface Device {
  _id: string;
  name: string;
  network: string;
  groups: string[];
  authRequired: boolean;
  serial_number: string;
  api_code: string;
  long_name: string;
}

/** Response of GET /devices/cohorts/check-slug. */
export interface CohortSlugCheckResponse {
  success: boolean;
  message: string;
  slug_check: {
    /** The slug the backend would actually store, after sanitisation. */
    candidate_slug: string;
    available: boolean;
    /** null when available; otherwise "taken", "too_short", "reserved" or "objectid_shape". */
    reason: "taken" | "too_short" | "reserved" | "objectid_shape" | null;
  };
}
