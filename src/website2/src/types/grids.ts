/**
 * Types for AirQo Monitoring Coverage Data
 */

export interface Site {
  _id: string;
  name: string;
  generated_name?: string;
  formatted_name?: string;
  approximate_latitude: number;
  approximate_longitude: number;
  country?: string;
  region?: string;
  district?: string;
  county?: string;
  sub_county?: string;
  parish?: string;
  city?: string;
  search_name?: string;
  location_name?: string;
  isOnline: boolean;
  rawOnlineStatus?: boolean;
  lastRawData?: string;
}

export interface Grid {
  _id: string;
  groups: string[];
  visibility: boolean;
  name: string;
  admin_level: string;
  network: string;
  long_name: string;
  createdAt: string;
  sites: Site[];
  numberOfSites: number;
}

export interface GridsSummaryMeta {
  total: number;
  limit: number;
  skip: number;
  page: number;
  totalPages: number;
  nextPage?: string;
}

export interface GridsSummaryResponse {
  success: boolean;
  message: string;
  meta: GridsSummaryMeta;
  grids: Grid[];
}

export interface GridsQueryParams {
  limit?: number;
  skip?: number;
  page?: number;
  tenant?: string;
  detailLevel?: string;
}

export interface SiteStatistics {
  totalSites: number;
  onlineSites: number;
  offlineSites: number;
  countries: string[];
  cities: string[];
}

export interface GridSummary {
  gridId: string;
  gridName: string;
  totalSites: number;
  onlineSites: number;
  adminLevel: string;
  network: string;
}
