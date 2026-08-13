import type {
  UserChartConfig,
  GroupChartReferenceLine,
  ChartLocationColor,
} from '@/shared/types/api';
import type {
  FrequencyType,
  PollutantType,
  StandardsType,
} from '@/shared/components/charts/types';

export type ExplorerChartType = 'Line' | 'Area' | 'Bar';

export interface ExplorerChartDraft {
  /** Persisted chart config _id (empty for an unsaved draft) */
  id: string;
  /** ThingSpeak field slot (1–8) the backend requires — round-tripped */
  fieldId: number;
  title: string;
  /** Display subtitle — persisted server-side via `subTitle` (v2 API) */
  subtitle: string;
  chartType: ExplorerChartType;
  /** Pollutant — kept client-side (see sidecar note below) */
  pollutant: PollutantType;
  /** Frequency — kept client-side (see sidecar note below) */
  frequency: FrequencyType;
  /** Effective request date range (from the picker or derived from `days`) */
  startDate: string;
  endDate: string;
  siteIds: string[];
  deviceIds: string[];
  /** Null = use the chart component's default palette */
  color: string | null;
  /** Per-location series colors (id = site_id or device_id) */
  locationColors: ChartLocationColor[];
  /** Reference standard driving the guideline line and summary (WHO default) */
  referenceStandard: StandardsType;
  showLegend: boolean;
  showGrid: boolean;
  showTooltip: boolean;
  referenceLines: GroupChartReferenceLine[];
}

export interface ExplorerChartSidecar {
  subtitle: string;
  pollutant: PollutantType;
  frequency: FrequencyType;
  /** Reference standard for the guideline line (WHO default) */
  referenceStandard: StandardsType;
  /**
   * Null = chart component default palette. Absent (no stored entry) = legacy
   * draft that should fall back to the persisted color.
   */
  color?: string | null;
  /** Custom range picked in the dialog (fallback: derive from `days`) */
  startDate: string;
  endDate: string;
  /** Display names for the chart's sites (chips, forecast selector) */
  siteNames?: Record<string, string>;
  /**
   * Friendly device names for sites resolved from DEVICE selections
   * (siteId → device name) — used to label chart series with device names.
   */
  deviceNames?: Record<string, string>;
}

/**
 * The group-chart backend only persists a whitelist of fields (verified live
 * against staging: extra fields like `pollutant` are silently dropped), so
 * display/UX preferences live in a localStorage sidecar keyed by group +
 * chart id. Server-persisted fields (title, chartType, days, sites, color,
 * toggles, reference lines) still sync across devices; the sidecar falls back
 * to sensible defaults when missing.
 */
const SIDECAR_STORAGE_KEY = 'nexus:analytics:chart-sidecar';

export const DEFAULT_CHART_SIDECAR: ExplorerChartSidecar = {
  subtitle: '',
  pollutant: 'pm2_5',
  frequency: 'daily',
  referenceStandard: 'WHO',
  color: null,
  startDate: '',
  endDate: '',
};

const readSidecarMap = (): Record<string, ExplorerChartSidecar> => {
  try {
    const raw = window.localStorage.getItem(SIDECAR_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ExplorerChartSidecar>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeSidecarMap = (map: Record<string, ExplorerChartSidecar>) => {
  try {
    window.localStorage.setItem(SIDECAR_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Storage unavailable (private mode) — sidecar persistence is best-effort.
  }
};

const sidecarKey = (groupId: string, chartId: string) =>
  `${groupId}:${chartId}`;

/**
 * Reads the sidecar entry for a chart. When no entry exists, `color` is left
 * `undefined` so legacy drafts fall back to their persisted color (see
 * persistedConfigToDraft).
 */
export const readChartSidecar = (
  groupId: string,
  chartId: string
): ExplorerChartSidecar => {
  const map = readSidecarMap();
  const stored = map[sidecarKey(groupId, chartId)];
  if (!stored) {
    // No stored entry — leave `color` absent so legacy drafts fall back to
    // their persisted color (see persistedConfigToDraft).
    return {
      subtitle: '',
      pollutant: 'pm2_5',
      frequency: 'daily',
      referenceStandard: 'WHO',
      startDate: '',
      endDate: '',
    };
  }
  return { ...DEFAULT_CHART_SIDECAR, ...stored };
};

export const writeChartSidecar = (
  groupId: string,
  chartId: string,
  sidecar: Partial<ExplorerChartSidecar>
) => {
  const map = readSidecarMap();
  map[sidecarKey(groupId, chartId)] = {
    ...DEFAULT_CHART_SIDECAR,
    ...map[sidecarKey(groupId, chartId)],
    ...sidecar,
  };
  writeSidecarMap(map);
};

export const removeChartSidecar = (groupId: string, chartId: string) => {
  const map = readSidecarMap();
  delete map[sidecarKey(groupId, chartId)];
  writeSidecarMap(map);
};

const VALID_POLLUTANTS: ReadonlySet<string> = new Set(['pm2_5', 'pm10']);
const VALID_FREQUENCIES: ReadonlySet<string> = new Set([
  'hourly',
  'daily',
  'weekly',
  'monthly',
]);
const VALID_STANDARDS: ReadonlySet<string> = new Set([
  'WHO',
  'NEMA_UGANDA',
  'NEMA_KENYA',
]);

export const normalizeStandard = (value?: string | null): StandardsType => {
  const normalized = (value ?? 'WHO').toUpperCase();
  return VALID_STANDARDS.has(normalized)
    ? (normalized as StandardsType)
    : 'WHO';
};

export const normalizePollutant = (value?: string | null): PollutantType => {
  const normalized = (value ?? '').toLowerCase().replace('.', '_');
  return VALID_POLLUTANTS.has(normalized)
    ? (normalized as PollutantType)
    : 'pm2_5';
};

export const normalizeFrequency = (value?: string | null): FrequencyType => {
  const normalized = (value ?? '').toLowerCase();
  return VALID_FREQUENCIES.has(normalized)
    ? (normalized as FrequencyType)
    : 'daily';
};

export const normalizeExplorerChartType = (
  value?: string | null
): ExplorerChartType => {
  const normalized = (value ?? '').toLowerCase();
  if (normalized === 'area') return 'Area';
  if (normalized === 'bar' || normalized === 'column') return 'Bar';
  return 'Line';
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Range ending today covering `days` days, mirroring the backend semantics */
export const deriveRangeFromDays = (
  days: number
): { startDate: string; endDate: string } => {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  const startDate = new Date(endDate.getTime() - days * DAY_MS);
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

/** Number of days covered by a range (1 minimum) — persisted as `days` */
export const computeDaysFromRange = (
  startDate: string,
  endDate: string
): number => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 7;
  }
  return Math.max(1, Math.round((end - start) / DAY_MS));
};

/** Compact label for a chart's date range, e.g. "Aug 4 - Aug 11, 2026" */
export const formatChartRangeLabel = (
  startDate: string,
  endDate: string
): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return '';
  }
  const format = (date: Date, includeYear: boolean) =>
    date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      ...(includeYear ? { year: 'numeric' } : {}),
    });
  const sameYear = start.getFullYear() === end.getFullYear();
  if (sameYear) {
    return `${format(start, false)} - ${format(end, true)}`;
  }
  return `${format(start, true)} - ${format(end, true)}`;
};

/**
 * Convert a persisted chart config (+ sidecar) into the runtime draft the
 * explorer works with.
 */
export const persistedConfigToDraft = (
  config: UserChartConfig,
  sidecar: ExplorerChartSidecar = {
    // Legacy default: no stored sidecar → persisted color/range apply.
    subtitle: '',
    pollutant: 'pm2_5',
    frequency: 'daily',
    referenceStandard: 'WHO',
    startDate: '',
    endDate: '',
  }
): ExplorerChartDraft => {
  const days =
    typeof config.days === 'number' && config.days > 0 ? config.days : 7;
  const hasCustomRange = Boolean(sidecar.startDate && sidecar.endDate);
  const range = hasCustomRange
    ? { startDate: sidecar.startDate, endDate: sidecar.endDate }
    : deriveRangeFromDays(days);

  return {
    id: config._id ?? '',
    fieldId:
      typeof config.fieldId === 'number' && config.fieldId >= 1
        ? config.fieldId
        : 1,
    title: config.title || 'Untitled chart',
    // The v2 API persists subTitle server-side; the sidecar remains a
    // fallback for charts created before that field was supported.
    subtitle: config.subTitle ?? sidecar.subtitle,
    chartType: normalizeExplorerChartType(config.chartType),
    pollutant: normalizePollutant(sidecar.pollutant),
    frequency: normalizeFrequency(sidecar.frequency),
    ...range,
    siteIds: config.site_ids ?? [],
    deviceIds: config.device_ids ?? [],
    // Explicit `null` (user picked the chart default) or an explicit color
    // wins; an absent sidecar falls back to the persisted color.
    color: sidecar.color === undefined ? (config.color ?? null) : sidecar.color,
    locationColors: Array.isArray(config.locationColors)
      ? config.locationColors
      : [],
    referenceStandard: normalizeStandard(sidecar.referenceStandard),
    showLegend: config.showLegend !== false,
    showGrid: config.showGrid !== false,
    showTooltip: config.showTooltip !== false,
    referenceLines: Array.isArray(config.referenceLines)
      ? config.referenceLines
      : [],
  };
};

/**
 * Convert a draft into the persistable fields of the user-chart contract.
 * `fieldId` (1–8) is required by the backend; the caller assigns a stable
 * slot per chart. A null color is omitted so the backend keeps its default.
 * `subTitle` and `locationColors` are persisted server-side on v2.
 */
export const draftToPersistedConfig = (
  draft: ExplorerChartDraft,
  fieldId = 1
): UserChartConfig => ({
  fieldId,
  title: draft.title.trim() || 'Untitled chart',
  subTitle: draft.subtitle.trim() || undefined,
  chartType: draft.chartType,
  days: computeDaysFromRange(draft.startDate, draft.endDate),
  showLegend: draft.showLegend,
  showGrid: draft.showGrid,
  showTooltip: draft.showTooltip,
  ...(draft.color ? { color: draft.color } : {}),
  ...(draft.locationColors.length > 0
    ? { locationColors: draft.locationColors }
    : {}),
  backgroundColor: '#ffffff',
  referenceLines: draft.referenceLines,
});
