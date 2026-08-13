import {
  getPrimaryColor,
  PRIMARY_COLOR_PALETTE,
} from '@/shared/components/charts/constants';
import type { ExplorerChartDraft } from './chartConfig';

/**
 * Theme-default series color for a site at `index` within the selected list.
 *
 * Colors are strictly opt-in (only explicit picks are persisted), so unset
 * sites fall back to the app's theme palette. The palette is ordered from the
 * base primary through darker/lighter mixes; once it repeats (more selections
 * than palette entries) the opacity drops per cycle so repeats still read as
 * distinct shades. Nothing here is written to the saved configuration.
 */
export const getDefaultSiteColor = (index: number): string => {
  const base = getPrimaryColor(index);
  const cycle = Math.floor(index / PRIMARY_COLOR_PALETTE.length);
  if (cycle === 0) return base;
  const alpha = Math.max(0.4, 1 - cycle * 0.2);
  return `color-mix(in srgb, ${base} ${Math.round(alpha * 100)}%, transparent)`;
};

/**
 * The resolved series color for a site — the same resolution everywhere
 * (picker preview, selected-items strip, overview cards, focused workspace):
 * an explicit per-location pick wins, then the chart's single color, then
 * the theme-default variation for the site's position.
 */
export const resolveSiteColor = (
  draft: ExplorerChartDraft,
  siteId: string,
  index: number
): string =>
  draft.locationColors.find(entry => entry.id === siteId)?.color ??
  draft.color ??
  getDefaultSiteColor(index);

/**
 * Build the series-colors map (rendered series key → color) for a chart's
 * observed data. Always resolves a color for every selected site — explicit
 * picks, the chart color, or the theme-default shade — so the overview
 * preview and the focused workspace render identically.
 */
export const buildSeriesColors = (
  draft: ExplorerChartDraft,
  dataKeyBySiteId: Map<string, string>,
  siteNames: Map<string, string>
): Record<string, string> | undefined => {
  const colors: Record<string, string> = {};
  draft.siteIds.forEach((siteId, index) => {
    const seriesKey = dataKeyBySiteId.get(siteId) ?? siteNames.get(siteId);
    if (seriesKey) colors[seriesKey] = resolveSiteColor(draft, siteId, index);
  });
  return Object.keys(colors).length > 0 ? colors : undefined;
};
