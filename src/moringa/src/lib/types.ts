export interface Location {
  lat: number
  lng: number
}
export interface FileUploadProps {
  onUpload: (locations: Location[]) => void
}

export interface SiteLocatorPayload {
  polygon: {
    coordinates: number[][][] // 3D array for the polygon coordinates
  }
  must_have_locations: number[][] // Array of must-have locations (latitude, longitude)
  min_distance_km: number // Minimum distance between sites for placement in kilometers
  num_sensors: number // Number of sensors to deploy
}

export interface SiteInformation {
  category_counts: {
    [key: string]: number // Counts of categories
  }
  total_sites: number // Total number of sites
}

export interface SiteLocation {
  area_name: string // Name of the area
  category: string // Category of the site
  highway: string | null // Highway information, if any
  landuse: string | null // Land use type
  latitude: number // Latitude of the site
  longitude: number // Longitude of the site
  natural: string | null // Natural feature info, if any
}

export interface SiteLocatorResponse {
  site_information: SiteInformation // Information about the sites
  site_location: SiteLocation[] // Array of site locations
}

export interface ControlPanelProps {
  onSubmit: (data: SiteLocatorPayload) => void
  polygon: Location[] // Polygon points defining an area
  mustHaveLocations: Location[] // Must-have locations for site placement
  onMustHaveLocationsChange: (locations: Location[]) => void // Callback for changes in must-have locations
}

export interface SourceCandidate {
  confidence: number
  source_type: string
}

export interface SourceMetadataSiteCategory {
  area_name?: string | null
  category: string | null
  classification_confidence?: number | null
  classification_method?: string | null
  distance_to_matched_feature_m?: number | null
  highway: string | null
  landuse: string | null
  natural: string | null
  search_radius?: number | null
  waterway: string | null
}

export interface SourceMetadataMatchedFeature {
  name: string | null
  osm_id: number | null
  osm_type: string | null
  tags: Record<string, string>
}

export interface SourceMetadataSentinel2Context {
  aerosol_optical_thickness: number | null
  cache_hit: boolean
  collection: string | null
  date_range: SourceMetadataDateRange | null
  elapsed_ms: number | null
  indices: Record<string, number | null>
  provider: string | null
  scene_classification: number | null
  scene_cloud_cover: number | null
  scene_datetime: string | null
  scene_id: string | null
}

export interface SourceMetadataEvidence {
  matched_feature?: SourceMetadataMatchedFeature | null
  nearby_feature_counts?: Record<string, number>
  osm_debug_info?: string[]
  reasoning?: string[]
  sentinel2_context?: SourceMetadataSentinel2Context | null
  sentinel2_error?: string | null
  satellite_error?: string | null
  satellite_pollutants_mean?: Record<string, number | null>
  satellite_reasoning?: string[]
  site_category: SourceMetadataSiteCategory | null
  site_reasoning?: string[]
}

export interface SourceMetadataDateRange {
  end_date: string
  start_date: string
}

export interface SourceMetadataMetadata {
  computed_at_utc: string
  data_sources: string[]
  date_range?: SourceMetadataDateRange
  disclaimer: string
  cache_hit?: boolean
  elapsed_ms?: number | null
  model_version: string
  satellite_data_used?: boolean
  satellite_provider?: string | null
}

export interface SourceMetadataPayload {
  candidate_sources: SourceCandidate[]
  evidence: SourceMetadataEvidence
  location: {
    area_name?: string | null
    latitude: number
    longitude: number
  }
  metadata: SourceMetadataMetadata
  primary_source: SourceCandidate | null
}

export interface SourceMetadataResponse {
  data: SourceMetadataPayload
  message: string
}

export interface LegacyCategorizeSiteResponse {
  site: {
    OSM_info: string[]
    "site-category": {
      area_name: string
      category: string
      highway: string | null
      landuse: string | null
      latitude: number
      longitude: number
      natural: string | null
      search_radius: number | null
      waterway: string | null
    }
  }
}

export interface GridOption {
  grid_id: string // Grid identifier
  grid_name: string // Name of the grid
}

export interface AirQualityReportPayload {
  grid_id: string // Grid identifier
  start_time: string // Start time for the report
  end_time: string // End time for the report
}

export interface DailyMeanData {
  date: string // Date of the data
  pm10_calibrated_value: number | null // Calibrated PM10 value
  pm10_raw_value: number // Raw PM10 value
  pm2_5_calibrated_value: number | null // Calibrated PM2.5 value
  pm2_5_raw_value: number // Raw PM2.5 value
}

export interface DiurnalData {
  hour: number // Hour of the day
  pm10_calibrated_value: number // Calibrated PM10 value
  pm10_raw_value: number // Raw PM10 value
  pm2_5_calibrated_value: number // Calibrated PM2.5 value
  pm2_5_raw_value: number // Raw PM2.5 value
}

export interface MonthlyData {
  month: number // Month number
  year: number // Year
  pm10_calibrated_value: number // Calibrated PM10 value
  pm10_raw_value: number // Raw PM10 value
  pm2_5_calibrated_value: number // Calibrated PM2.5 value
  pm2_5_raw_value: number // Raw PM2.5 value
  site_latitude: number // Latitude of the site
  site_longitude: number // Longitude of the site
  site_name: string // Name of the site
}

export interface AirQualityReportResponse {
  report: {
    daily_mean_data: DailyMeanData[] // Daily mean data for the report
    diurnal: DiurnalData[] // Diurnal data for the report
    monthly_data: MonthlyData[] // Monthly data for the report
    report: string // Textual report
  }
}

export interface SatelliteDataPayload {
  latitude: number // Latitude for satellite data
  longitude: number // Longitude for satellite data
  timestamp: string // Timestamp for satellite data
}

export interface SatelliteDataResponse {
  latitude: number // Latitude
  longitude: number // Longitude
  pm2_5_prediction: number // PM2.5 prediction value
  timestamp: string // Timestamp
}

export interface Grid {
  _id: string // Grid ID
  name: string // Grid name
  admin_level: string // Administrative level of the grid
  network: string // Network type
  long_name: string // Long name for the grid
  sites: Site[] // List of sites in the grid
}

export interface Site {
  _id: string // Site ID
  search_name: string // Searchable name for the site
  city: string // City where the site is located
  district: string // District of the site
  county: string // County of the site
  region: string // Region of the site
  country: string // Country of the site
  name: string // Site name
  site_category: {
    category: string // Category of the site
  }
  groups: string[] // Groups associated with the site
  lastActive: string // Last active timestamp
}

export interface SiteData {
  _id: string
  site_id: string
  time: string
  aqi_category: string
  aqi_color: string
  pm2_5: { value: number | null }
  reportMeasurements?: Array<{
    timestamp: string
    value: number
  }>
  reportAggregation?: "daily" | "weekly" | "monthly"
  averages?: {
    percentageDifference: number
    weeklyAverages: {
      currentWeek: number
      previousWeek: number
    }
    monthlyPercentageDifference?: number
    monthlyAverages?: {
      currentMonth: number
      previousMonth: number
    }
  }
  siteDetails: {
    _id?: string
    name: string
    formatted_name?: string
    location_name?: string
    approximate_latitude: number
    approximate_longitude: number
    city?: string
    district?: string
    country?: string
    site_category?: {
      category: string
      area_name: string
    }
  }
}

// Filter interface for reports page
export interface Filters {
  country: string[]
  city: string[]
  district: string[]
  category: string[]
}

export interface AqiMapData {
  mapimage: {
    bounds: [[number, number], [number, number]]
    image: string
    message: string
  }
}

export interface MapProps {
  map: any
}

export interface DataDownloadRequest {
  datatype: "calibrated" | "raw"
  downloadType: "json"
  startDateTime: string
  endDateTime: string
  frequency: "raw" | "hourly" | "daily"
  minimum: boolean
  outputFormat: "airqo-standard"
  pollutants: string[]
  sites: string[]
  metaDataFields?: string[]
  weatherFields?: string[]
  device_category?: "lowcost" | "bam" | "mobile" | "gas"
}

export type DataDownloadRecord = Record<string, unknown>

export interface DataDownloadResponse {
  status?: string
  message?: string
  data?: DataDownloadRecord[]
}

export interface ReportDataOptions {
  selectedSiteIds: string[]
  startDate: string
  endDate: string
  frequency: "daily" | "weekly" | "monthly"
  dataType: "calibrated" | "raw"
  pollutants: string[]
}

export interface ReportDateRange {
  startDate: string
  endDate: string
}
