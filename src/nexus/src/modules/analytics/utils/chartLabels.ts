import type { NormalizedChartData } from '@/shared/components/charts/types';
import { isUnknownPlaceholder } from './chartConfig';

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
 * siteId → display name as the USER selected it (the picker's site name:
 * search_name || location_name || name || formatted_name). Falls back to
 * the chart-data name so a fresh browser (empty sidecar) never leaks ids.
 */
export const buildSiteLabels = (
  chartData: NormalizedChartData[],
  siteNames: Map<string, string>
): Record<string, string> => {
  const labels: Record<string, string> = {};
  chartData.forEach(point => {
    const siteId = String(point.site_id ?? '');
    if (!siteId) return;
    const name =
      siteNames.get(siteId) ?? (point.site ? String(point.site) : undefined);
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
  return labels;
};

/**
 * Reverse-match chart data points that carry a `site` display name but no
 * `site_id` (the backend d3 chart-data shape: `{site_name, pm2_5, ...}`)
 * against the app's known siteNames Map (id → name).
 *
 * When a point's `site` exactly matches a name in the reverse map and the
 * point has no `site_id`, the corresponding id is filled in.  When a point
 * already has a `site_id`, its `site` is canonicalised to the sidecar/config
 * name so series keys stay consistent with the picker.
 *
 * Returns a NEW array (no mutation of inputs).  Unknown/placeholder names
 * are skipped; case-sensitive exact match only.
 */
export const enrichChartDataSiteIds = (
  chartData: NormalizedChartData[],
  siteNames: Map<string, string>
): NormalizedChartData[] => {
  if (chartData.length === 0 || siteNames.size === 0) return chartData;

  // Build reverse map: name → first id.  Skip placeholder / empty names.
  const nameToId = new Map<string, string>();
  siteNames.forEach((name, id) => {
    if (!isUnknownPlaceholder(name) && name.trim() && !nameToId.has(name)) {
      nameToId.set(name, id);
    }
  });

  if (nameToId.size === 0) return chartData;

  return chartData.map(point => {
    const currentSiteId = String(point.site_id ?? '');
    const currentSite = String(point.site ?? '');

    // Case 1: no site_id yet — try to fill from name match
    if (!currentSiteId && currentSite && !isUnknownPlaceholder(currentSite)) {
      const matchedId = nameToId.get(currentSite);
      if (matchedId) {
        // Canonicalise site to the sidecar/config name for consistent keys
        const canonicalName = siteNames.get(matchedId) ?? currentSite;
        return {
          ...point,
          site_id: matchedId,
          site: canonicalName,
        };
      }
    }

    // Case 2: site_id already present — canonicalise site name if sidecar
    // has a name for it (ensures series keys match picker labels).
    if (currentSiteId) {
      const knownName = siteNames.get(currentSiteId);
      if (knownName && knownName !== currentSite) {
        return { ...point, site: knownName };
      }
    }

    return point;
  });
};
