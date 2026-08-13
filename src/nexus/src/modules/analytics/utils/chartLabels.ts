import type { NormalizedChartData } from '@/shared/components/charts/types';

/**
 * Chart series key (the name the data API returns) per site_id — recharts
 * keys series by this value, so colors must be keyed by it.
 */
export const buildDataKeyBySiteId = (
  chartData: NormalizedChartData[]
): Map<string, string> => {
  const map = new Map<string, string>();
  chartData.forEach(point => {
    const siteKey = String(point.site ?? '');
    const siteId = String(point.site_id ?? '');
    if (siteKey && siteId && !map.has(siteId)) map.set(siteId, siteKey);
  });
  return map;
};

/**
 * siteId → display name as the USER selected it: the device name when the
 * site was picked via the Devices tab, otherwise the picker's site name
 * (search_name || location_name || name || formatted_name). Falls back to
 * the chart-data name so a fresh browser (empty sidecar) never leaks ids.
 */
export const buildSiteLabels = (
  chartData: NormalizedChartData[],
  siteNames: Map<string, string>,
  deviceNames?: Map<string, string>
): Record<string, string> => {
  const labels: Record<string, string> = {};
  chartData.forEach(point => {
    const siteId = String(point.site_id ?? '');
    if (!siteId) return;
    const name =
      deviceNames?.get(siteId) ??
      siteNames.get(siteId) ??
      (point.site ? String(point.site) : undefined);
    if (name) labels[siteId] = name;
  });
  return labels;
};

/**
 * Legend/tooltip label overrides keyed by series key (data names). The
 * d3 data name is always the final fallback so the legend never shows
 * a raw id or empty string — if no sidecar/fallback name exists, the
 * chart-data display name (search_name || location_name || name || ...) is
 * used directly. Single-series charts render under recharts' generic
 * 'value' key, which also gets the label.
 */
export const buildSeriesLabels = (
  chartData: NormalizedChartData[],
  siteLabels: Record<string, string>
): Record<string, string> => {
  const labels: Record<string, string> = {};
  chartData.forEach(point => {
    const siteKey = String(point.site ?? '');
    const siteId = String(point.site_id ?? '');
    if (!siteKey || !siteId) return;
    // ALWAYS set: sidecar name wins, d3 data name is the guaranteed fallback.
    // This ensures the legend never shows raw ids or empty placeholders.
    labels[siteKey] = siteLabels[siteId] ?? siteKey;
  });
  const uniqueSiteKeys = new Set(
    chartData.map(point => String(point.site ?? '')).filter(Boolean)
  );
  if (uniqueSiteKeys.size === 1) {
    const first = chartData.find(point => point.site && point.site_id);
    const siteId = first ? String(first.site_id) : '';
    const label =
      (siteId ? siteLabels[siteId] : undefined) ??
      (first ? String(first.site) : undefined);
    if (label) labels['value'] = label;
  }
  return Object.keys(labels).length > 0 ? labels : labels;
};
