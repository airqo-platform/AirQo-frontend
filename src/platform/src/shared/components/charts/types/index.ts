// Chart data types
export interface AirQualityDataPoint {
  site_id: string;
  value: number;
  time: string;
  generated_name: string;
  device_id: string;
  name: string;
}

export interface NormalizedChartData {
  time: string;
  value: number;
  site: string;
  device_id: string;
  site_id?: string;
  rawTime?: string;
  count?: number;
  [key: string]: string | number | undefined;
}

// Chart filter types
export type FrequencyType = 'raw' | 'hourly' | 'daily' | 'weekly' | 'monthly';
export type PollutantType = 'pm2_5' | 'pm10';
export type StandardsType = 'WHO' | 'NEMA';

export interface ChartFilters {
  sites: string[];
  startDate: string;
  endDate: string;
  frequency: FrequencyType;
  pollutant: PollutantType;
  organisation_name?: string;
}

export interface ChartAPIRequest extends ChartFilters {
  chartType: ChartType;
}

// Chart configuration types
export type ChartType = 'line' | 'bar' | 'area' | 'scatter' | 'radar' | 'pie';

export interface ChartConfig {
  type: ChartType;
  title: string;
  subtitle?: string;
  dataKey: string;
  xAxisKey: string;
  yAxisKey?: string;
  color?: string;
  strokeWidth?: number;
  fillOpacity?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number;
  width?: number | string;
  pollutant?: PollutantType;
  standards?: StandardsType;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

// Export types
export type ExportFormat = 'pdf' | 'png' | 'svg';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  quality?: number;
  width?: number;
  height?: number;
}

export interface ExportOptionsPartial {
  filename?: string;
  quality?: number;
  width?: number;
  height?: number;
}

// Tooltip types
export interface TooltipData {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: string | number;
    color: string;
    dataKey: string;
    payload: NormalizedChartData;
  }>;
  label?: string | number;
}

// Legend types
export interface LegendData {
  payload?: Array<{
    value: string;
    type: string;
    color: string;
    dataKey: string;
  }>;
}

// Chart container props
export interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  exportOptions?: {
    enablePDF?: boolean;
    enablePNG?: boolean;
    filename?: string;
  };
  onRefresh?: () => void;
  onMoreInsights?: (
    sites?: Array<{
      _id: string;
      name: string;
      search_name?: string;
      country?: string;
    }>
  ) => void;
  onAirQualityStandards?: () => void;
  onChartTypeChange?: (type: ChartType) => void;
  onStandardsChange?: (standards: StandardsType) => void;
  onFiltersChange?: (filters: Partial<ChartFilters>) => void;
  currentChartType?: ChartType;
  selectedStandards?: StandardsType;
  autoSelectChart?: boolean;
  onAutoSelectToggle?: () => void;
  showReferenceLines?: boolean;
  onReferenceLinesToggle?: (show: boolean) => void;
  currentFilters?: Partial<ChartFilters>;
  currentSites?: Array<{
    _id: string;
    name: string;
    search_name?: string;
    country?: string;
  }>;
  className?: string;
  loading?: boolean;
  error?: string | null;
  showTitle?: boolean;
  showMoreButton?: boolean;
}

// Dynamic chart props
export interface DynamicChartProps {
  data: NormalizedChartData[];
  config?: Partial<ChartConfig>;
  autoSelectType?: boolean;
  responsive?: boolean;
  className?: string;
  frequency?: FrequencyType;
  pollutant?: PollutantType;
  showReferenceLines?: boolean;
  standards?: StandardsType;
  id?: string;
  onReferenceLinesToggle?: (show: boolean) => void;
}

// Air quality standards
export interface AirQualityStandard {
  level: string;
  range: {
    min: number;
    max: number;
  };
  color: string;
  description: string;
}

export interface AirQualityStandardsConfig {
  organization: 'WHO' | 'NEMA';
  pollutant: 'PM2.5' | 'PM10';
  showReferenceLine?: boolean;
}

export type ChartStandardsType = 'WHO' | 'NEMA';

export interface ChartConfiguration extends Omit<ChartConfig, 'standards'> {
  standards?: AirQualityStandardsConfig;
  showStandardsDialog?: boolean;
}
