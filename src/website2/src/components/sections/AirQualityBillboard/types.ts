export type DataType = 'cohort' | 'grid';

export interface AirQualityBillboardProps {
  className?: string;
  hideControls?: boolean;
  autoRotate?: boolean;
  dataType?: DataType;
  itemName?: string;
  centered?: boolean;
}

export interface Cohort {
  _id: string;
  name?: string;
  long_name?: string;
}

export interface Grid {
  _id: string;
  name?: string;
  long_name?: string;
}

export type Item = Cohort | Grid;

export interface Measurement {
  _id?: string;
  device?: string;
  device_id?: string;
  site_id?: string;
  time?: string;
  pm2_5?: {
    value: number | null;
  };
  deviceDetails?: {
    name: string;
  };
  siteDetails?: {
    name?: string;
    search_name?: string;
  };
  // Additional fields from API responses
  frequency?: string;
  no2?: any;
  pm10?: any;
  __v?: number;
  aqi_category?: string;
  aqi_color?: string;
  aqi_color_name?: string;
  aqi_ranges?: any;
  averages?: any;
  createdAt?: string;
  health_tips?: any[];
  is_reading_primary?: boolean;
}

export interface Forecast {
  pm2_5?: number;
}

export interface MeasurementsData {
  measurements: Measurement[];
}

export interface SummaryData {
  cohorts?: Cohort[];
  grids?: Grid[];
  meta?: {
    nextPage?: string;
  };
}

export interface BillboardState {
  dataType: DataType;
  selectedItem: Item | null;
  currentMeasurement: Measurement | null;
  dataLoaded: boolean;
  currentSiteIndex: number;
  currentDeviceIndex: number;
  searchQuery: string;
  isDropdownOpen: boolean;
  hoveredItemId: string | null;
  copiedItemId: string | null;
}
