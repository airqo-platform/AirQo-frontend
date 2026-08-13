import type { AqiConfig } from '@/shared/types/aqi';

// Chart data types
export interface AirQualityDataPoint {
  site_id: string;
  value: number;
  time: string;
  generated_name: string;
  device_id: string;
  name: string;
  search_name?: string;
  location_name?: string;
  formatted_name?: string;
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
export type StandardsType =
  | 'WHO'
  | 'NEMA_UGANDA'
  | 'NEMA_KENYA'
  | 'SOUTH_AFRICA'
  | 'NIGERIA';

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
  seriesColors?: Record<string, string>;
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
  /** Index of the hovered data point (recharts 3 passes this to tooltip content) */
  activeIndex?: number | undefined;
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
  /**
   * When provided, the More menu gains "Edit title & subtitle" and the header
   * becomes inline-editable. The callback persists the change.
   */
  onEditTitle?: (title: string, subtitle?: string) => Promise<void> | void;
  /** Custom actions rendered at the top of the More dropdown (e.g. edit/delete chart) */
  menuItems?: React.ReactNode;
  /**
   * Footer hint rendered under the chart body (e.g. "Last update …"), used
   * for trust signaling (IQAir/AirGradient pattern).
   */
  footerHint?: React.ReactNode;
  /**
   * Optional toolbar row rendered between the header and the chart. When
   * provided, the More menu moves out of the header into the right side of
   * this row (with `toolbarActions` just before it), and a matching
   * separator line is drawn under the chart to close the section.
   */
  toolbar?: React.ReactNode;
  /** Right-aligned actions inside the toolbar row, before the More menu */
  toolbarActions?: React.ReactNode;
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
  aqiConfig?: AqiConfig | null;
  showReferenceLines?: boolean;
  standards?: StandardsType;
  id?: string;
  onReferenceLinesToggle?: (show: boolean) => void;
  /**
   * Controlled hidden series keys. When provided, the internal legend-click
   * state is overridden and clicks report through `onHiddenSeriesChange`.
   */
  hiddenSeries?: string[];
  /** Called when the legend toggles a series while `hiddenSeries` is controlled */
  onHiddenSeriesChange?: (hidden: string[]) => void;
  /**
   * Controlled series emphasis — while set, only this series stays vivid and
   * the rest are dimmed (drives the location legend hover-highlight).
   */
  focusedSeries?: string | null;
  /** Series keys rendered with a dashed stroke + connected nulls (forecast) */
  dashedSeries?: string[];
  /** Extra reference lines (e.g. the forecast "Now" boundary) */
  additionalReferenceLines?: AdditionalReferenceLine[];
  /** Prefer the 24-hour guideline over the annual one for the standards line */
  referenceLinePeriod?: '24hr' | 'annual';
  /**
   * Display-label overrides keyed by series key (the picker's names).
   * Applied to the legend and the tooltip.
   */
  seriesLabels?: Record<string, string>;
  /**
   * Display-label overrides keyed by site_id (the picker's names) — used by
   * the tooltip's "Location:" line so it matches what the user selected.
   */
  locationLabels?: Record<string, string>;
  /**
   * Enables the top-right zoom controls (zoom in / out / reset) that window
   * the rendered data. Defaults to auto — controls appear only on dense
   * ordered charts (line/area/bar/scatter) above the zoom threshold.
   * Pass `false` to force-disable, `true` to force-enable (still only on
   * the zoom-capable chart types above — never on pie/radar, which don't
   * support windowing).
   */
  zoomable?: boolean;
}

/** A generic reference line drawn on top of the chart (x or y anchored). */
export interface AdditionalReferenceLine {
  x?: number | string;
  y?: number | string;
  /** Short label rendered in a chip on the line (e.g. "Now") */
  label?: string;
  stroke?: string;
  strokeDasharray?: string;
  strokeWidth?: number;
}

// Air quality standards
export interface AirQualityStandardsConfig {
  organization: StandardsType;
  pollutant: 'PM2.5' | 'PM10';
  showReferenceLine?: boolean;
}

export type ChartStandardsType =
  | 'WHO'
  | 'NEMA_UGANDA'
  | 'NEMA_KENYA'
  | 'SOUTH_AFRICA'
  | 'NIGERIA';

export interface ChartConfiguration extends Omit<ChartConfig, 'standards'> {
  standards?: AirQualityStandardsConfig;
  showStandardsDialog?: boolean;
}
