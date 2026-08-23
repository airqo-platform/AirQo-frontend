import {
  getPrimaryColor,
  PRIMARY_COLOR_PALETTE,
} from '@/shared/components/charts/constants';
import { getThemeShade } from '@/shared/components/charts/colors';
import type { ExplorerChartDraft } from './chartConfig';

/**
 * Theme-default series color for a site at `index` within the selected list.
 *
 * In palette mode (default), sites are assigned distinct palette shades by
 * their position in the selection, so creating a chart with multiple sites
 * always yields distinguishable series without any manual picking. The
 * palette has 20 distinct hues; once it repeats (more selections than
 * palette entries) each successive cycle is lightened via white mix so
 * repeated shades remain visually distinct without becoming transparent.
 *
 * In theme mode (`themeColors`), sites get shades of the ACTIVE theme
 * primary instead (see `getThemeShade`).
 */
export const getDefaultSiteColor = (
  index: number,
  themeColors = false
): string => {
  if (themeColors) return getThemeShade(index);
  const base = getPrimaryColor(index);
  const cycle = Math.floor(index / PRIMARY_COLOR_PALETTE.length);
  if (cycle === 0) return base;
  // Gentle lightening per cycle: 20% white, 35%, 50%, … — keeps colors
  // opaque and visible while still distinguishing repeat shades.
  const whitePct = Math.min(20 + (cycle - 1) * 15, 65);
  return `color-mix(in srgb, ${base} ${100 - whitePct}%, white)`;
};

/** Hex literal of the theme primary — used for color-input display and for
 * uniqueness comparison (the primary renders as `rgb(var(--primary))`). */
const PRIMARY_HEX = '#145DFF';

/**
 * Normalizes a color string for uniqueness comparison: the theme primary's
 * rgb()/hsl() form equals its hex literal, and `rgb(r, g, b)` becomes its
 * hex form. `color-mix(...)` strings (palette repeat cycles) and arbitrary
 * strings pass through unchanged.
 */
export const normalizeColorKey = (color: string): string => {
  const trimmed = color.trim().toLowerCase();
  if (trimmed === 'rgb(var(--primary))' || trimmed === 'hsl(var(--primary))') {
    return PRIMARY_HEX.toLowerCase();
  }
  const rgbMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    const toHex = (channel: string) =>
      Number(channel).toString(16).padStart(2, '0');
    return `#${toHex(rgbMatch[1])}${toHex(rgbMatch[2])}${toHex(rgbMatch[3])}`;
  }
  return trimmed;
};

/**
 * A color for display inside a `<input type="color">`: any `#rrggbb` passes
 * through, `rgb(r, g, b)` is converted to hex, and theme-var / color-mix
 * strings fall back to the primary's hex (the input cannot render them).
 */
export const toHexInputValue = (color: string): string => {
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color;
  const key = normalizeColorKey(color);
  return /^#[0-9a-fA-F]{6}$/.test(key) ? key : PRIMARY_HEX;
};

/**
 * The resolved series color for a site — the same resolution everywhere
 * (picker preview, selected-items strip, overview cards, focused workspace):
 * an explicit per-location pick wins, then a distinct theme-default shade
 * for the site's position. Every site always resolves to a color, and
 * materialized charts are de-duplicated, so two sites can never render the
 * same color (the legacy single `draft.color` no longer paints unset sites
 * identically).
 */
export const resolveSiteColor = (
  draft: ExplorerChartDraft,
  siteId: string,
  index: number
): string =>
  draft.locationColors.find(entry => entry.id === siteId)?.color ??
  getDefaultSiteColor(index, draft.themeColors);

/**
 * Materializes one explicit color entry per selected site — unset sites get
 * a distinct theme-default shade. Runs at chart save so persisted charts
 * carry explicit, collision-free colors (replacing the old behavior where
 * only opt-in picks were saved and everything else fell back to one shared
 * chart color). Collisions with already-used colors (including a pick that
 * duplicates another site's default) roll forward to the next free palette
 * shade so no two sites ever share a color.
 *
 * In theme mode (`themeColors`), defaults are theme-primary shades resolved
 * at RENDER time (they can't be frozen into storage — `color-mix(...)` strings
 * are meaningless off-app), so only explicit picks are persisted here.
 */
export const materializeSiteColors = (
  siteIds: string[],
  locationColors: { id: string; color: string }[],
  themeColors = false
): { id: string; color: string }[] => {
  if (themeColors) {
    return siteIds
      .map(siteId => locationColors.find(entry => entry.id === siteId))
      .filter((entry): entry is { id: string; color: string } => !!entry);
  }

  const used = new Set<string>();
  return siteIds.map((siteId, index) => {
    const picked = locationColors.find(entry => entry.id === siteId)?.color;
    let color = picked ?? getDefaultSiteColor(index);
    let guard = 0;
    while (used.has(normalizeColorKey(color)) && guard < 40) {
      color = getDefaultSiteColor(index + used.size + ++guard);
    }
    used.add(normalizeColorKey(color));
    return { id: siteId, color };
  });
};

/**
 * Applies a manual color pick with collision handling: if another selected
 * site already uses `nextColor`, the two sites swap colors so both stay
 * distinct (the previous owner keeps this site's old color). Passing `null`
 * clears the pick.
 */
export const applySiteColorPick = (
  locationColors: { id: string; color: string }[],
  siteId: string,
  nextColor: string | null
): { id: string; color: string }[] => {
  if (!nextColor) {
    return locationColors.filter(entry => entry.id !== siteId);
  }
  const rest = locationColors.filter(entry => entry.id !== siteId);
  const conflict = rest.find(
    entry => normalizeColorKey(entry.color) === normalizeColorKey(nextColor)
  );
  if (conflict) {
    const currentColor = locationColors.find(
      entry => entry.id === siteId
    )?.color;
    // The previous owner takes this site's old color when it had one;
    // otherwise it falls back to its theme-default shade (the new pick wins).
    const restWithoutConflict = currentColor
      ? rest.map(entry =>
          entry.id === conflict.id ? { ...entry, color: currentColor } : entry
        )
      : rest.filter(entry => entry.id !== conflict.id);
    return [...restWithoutConflict, { id: siteId, color: nextColor }];
  }
  return [...rest, { id: siteId, color: nextColor }];
};

/**
 * Build the series-colors map (rendered series key → color) for a chart's
 * observed data. Always resolves a color for every selected site — explicit
 * picks or a distinct theme-default shade — so the overview preview and the
 * focused workspace render identically.
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
