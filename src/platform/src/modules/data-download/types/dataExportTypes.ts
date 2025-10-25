import { DateRange } from '@/shared/components/calendar/types';

export type TabType = 'sites' | 'devices';

export type DeviceCategory = 'lowcost' | 'bam' | 'mobile' | 'gas';

export type DataType = 'raw' | 'calibrated';

export type Frequency = 'raw' | 'hourly' | 'daily';

export type FileType = 'csv' | 'json';

export interface TabState {
  page: number;
  pageSize: number;
  search: string;
}

export interface DataExportState {
  activeTab: TabType;
  sidebarOpen: boolean;
  previewOpen: boolean;
  fileTitle: string;
  dataType: DataType;
  frequency: Frequency;
  fileType: FileType;
  selectedPollutants: string[];
  selectedSites: string[];
  selectedDevices: string[];
  selectedSiteIds: string[];
  selectedDeviceIds: string[];
  deviceCategory: DeviceCategory;
  dateRange: DateRange | undefined;
  tabStates: Record<TabType, TabState>;
}

export interface TableItem {
  id: string | number;
  [key: string]: unknown;
}

export interface ColumnConfig {
  key: string;
  label: string;
  render?: (value: unknown) => React.ReactNode;
}

export interface TabConfig {
  columns: ColumnConfig[];
  title: string;
  hasCategory: boolean;
}
