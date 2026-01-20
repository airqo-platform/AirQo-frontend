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
}

export interface GridSummary {
  gridId: string;
  gridName: string;
  totalSites: number;
  onlineSites: number;
  adminLevel: string;
  network: string;
}

/**
 * Types for Grid Representative Readings
 */

export interface AQIRange {
  min: number;
  max: number | null;
}

export interface AQIRanges {
  good: AQIRange;
  moderate: AQIRange;
  u4sg: AQIRange;
  unhealthy: AQIRange;
  very_unhealthy: AQIRange;
  hazardous: AQIRange;
}

export interface PollutantValue {
  value: number | null;
}

export interface WeeklyAverages {
  currentWeek: number;
  previousWeek: number;
}

export interface Averages {
  dailyAverage: number;
  percentageDifference: number;
  weeklyAverages: WeeklyAverages;
}

export interface HealthTip {
  title: string;
  description: string;
  image?: string;
  tag_line: string;
}

export interface SiteCategory {
  tags: string[];
  category: string;
}

export interface SiteDetails {
  _id: string;
  formatted_name: string;
  location_name: string;
  search_name: string;
  street?: string;
  town?: string;
  city: string;
  region: string;
  country: string;
  name: string;
  approximate_latitude: number;
  approximate_longitude: number;
  bearing_in_radians?: number;
  data_provider: string;
  description: string;
  site_category: SiteCategory;
}

export interface RepresentativeReading {
  _id: string;
  site_id: string;
  time: string;
  __v: number;
  aqi_category: string;
  aqi_color: string;
  aqi_color_name: string;
  aqi_ranges: AQIRanges;
  averages: Averages;
  createdAt: string;
  device: string;
  device_id: string;
  frequency: string;
  health_tips: HealthTip[];
  is_reading_primary: boolean;
  no2: PollutantValue;
  pm10: PollutantValue;
  pm2_5: PollutantValue;
  siteDetails: SiteDetails;
  timeDifferenceHours: number;
  updatedAt: string;
}

export interface GridRepresentativeReadingResponse {
  message: string;
  data: RepresentativeReading;
  errors: any | null;
}
