import type { NormalizedChartData } from '@/shared/components/charts/types';
import { isLikelySiteId } from '@/shared/components/charts/utils';
import { isUnknownPlaceholder } from './chartConfig';

export const normalizeLocationName = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[,_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getSafeChartLabel = (value: unknown): string => {
  const label = typeof value === 'string' ? value.trim() : '';
  if (!label || isUnknownPlaceholder(label) || isLikelySiteId(label)) {
    return '';
  }
  return label;
};

/**
 * Chart series key (the name the data API returns) per site_id — recharts
 * keys series by this value, so colors must be keyed by it.
 */
export const buildDataKeyBySiteId = (
  chartData: NormalizedChartData[]
): Map<string, string> => {
  const map = new Map<string, string>();
  chartData.forEach(point => {
    const siteKey = String(point.site ?? '').trim();
    const siteId = String(point.site_id ?? '').trim();
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
    const siteId = String(point.site_id ?? '').trim();
    if (!siteId) return;
    const name =
      getSafeChartLabel(siteNames.get(siteId)) || getSafeChartLabel(point.site);
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
    const siteKey = String(point.site ?? '').trim();
    const siteId = String(point.site_id ?? '').trim();
    if (!siteKey || !siteId) return;
    labels[siteKey] =
      getSafeChartLabel(siteLabels[siteId]) ||
      getSafeChartLabel(siteKey) ||
      'Unknown Location';
  });
  const uniqueSiteKeys = new Set(
    chartData.map(point => String(point.site ?? '')).filter(Boolean)
  );
  if (uniqueSiteKeys.size === 1) {
    const first = chartData.find(point => point.site && point.site_id);
    const siteId = first ? String(first.site_id) : '';
    const label =
      (siteId ? getSafeChartLabel(siteLabels[siteId]) : '') ||
      getSafeChartLabel(first?.site) ||
      'Unknown Location';
    labels['value'] = label;
  }
  return labels;
};

/**
 * Reverse-match chart data points against the app's known siteNames Map
 * (id → name). Handles both named chart rows and the pie API's categorical
 * `{label, value}` rows, where `label` can be the site id when site_id metadata
 * was requested.
 *
 * When a point's label/site/time matches a known id or display name and it has
 * no `site_id`, the corresponding id is filled in. Existing ids are preserved
 * and their display names are canonicalised to the picker/config value.
 *
 * Returns a NEW array (no mutation of inputs). Unknown/placeholder names are
 * skipped; name matching is case/spacing/punctuation-insensitive.
 */
export const enrichChartDataSiteIds = (
  chartData: NormalizedChartData[],
  siteNames: Map<string, string>
): NormalizedChartData[] => {
  if (chartData.length === 0 || siteNames.size === 0) return chartData;

  const nameById = new Map<string, string>();
  const nameToId = new Map<string, string>();
  siteNames.forEach((name, id) => {
    const siteId = String(id).trim();
    const displayName = typeof name === 'string' ? name.trim() : '';
    if (
      !siteId ||
      !displayName ||
      isUnknownPlaceholder(displayName) ||
      isLikelySiteId(displayName)
    ) {
      return;
    }
    nameById.set(siteId, displayName);

    const normalizedName = normalizeLocationName(displayName);
    if (normalizedName && !nameToId.has(normalizedName)) {
      nameToId.set(normalizedName, siteId);
    }
  });

  if (nameById.size === 0) return chartData;

  return chartData.map(point => {
    const currentSiteId = String(point.site_id ?? '').trim();
    const currentSite = String(point.site ?? '').trim();
    const identityCandidates = [point.label, currentSite, point.time]
      .map(value => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean);
    const matchedId = currentSiteId
      ? nameById.has(currentSiteId)
        ? currentSiteId
        : undefined
      : identityCandidates.find(candidate => nameById.has(candidate));

    if (matchedId) {
      const canonicalName = nameById.get(matchedId) ?? currentSite;
      return {
        ...point,
        site_id: matchedId,
        site: canonicalName,
        site_name: point.site_name ?? canonicalName,
      };
    }

    if (!currentSiteId && currentSite && !isUnknownPlaceholder(currentSite)) {
      const matchedNameId = nameToId.get(normalizeLocationName(currentSite));
      if (matchedNameId) {
        const canonicalName = nameById.get(matchedNameId) ?? currentSite;
        return {
          ...point,
          site_id: matchedNameId,
          site: canonicalName,
          site_name: point.site_name ?? canonicalName,
        };
      }
    }

    if (currentSiteId) {
      const knownName = nameById.get(currentSiteId);
      if (knownName && knownName !== currentSite) {
        return {
          ...point,
          site: knownName,
          site_name: point.site_name ?? knownName,
        };
      }
    }

    return point;
  });
};
