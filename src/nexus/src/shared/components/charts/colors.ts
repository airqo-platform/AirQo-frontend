import { getPrimaryColor } from './constants';

/**
 * Number of theme-shade steps in one cycle. Indices beyond this cycle into
 * the complementary (darkening) ramp so large multi-series charts keep
 * distinguishable colors instead of flattening into near-white shades.
 */
export const THEME_SHADE_COUNT = 10;

/**
 * Generates a shade of the ACTIVE theme primary color (`--primary` CSS var)
 * based on the series index. Index 0 is the full primary; subsequent indices
 * get progressively lighter shades (white mix) up to `THEME_SHADE_COUNT`,
 * then progressively darker shades (black mix) on the next cycle, repeating.
 *
 * The result keeps the CSS var / color-mix() strings so series re-theme live
 * when the app theme changes (light/dark or a new primary). Exports resolve
 * these strings to concrete colors via `useChartExport`.
 *
 * @param index - The index of the data series (0-based)
 * @returns CSS color string derived from the active theme primary
 */
export const getThemeShade = (index: number): string => {
  if (index === 0) return 'rgb(var(--primary))';
  const cycle = Math.floor(index / THEME_SHADE_COUNT);
  const step = index % THEME_SHADE_COUNT;
  const mixPct = Math.min(16 + step * 8, 72);
  const mixColor = cycle % 2 === 0 ? 'white' : 'black';
  return `color-mix(in srgb, rgb(var(--primary)) ${100 - mixPct}%, ${mixColor})`;
};

/**
 * Resolves the default series color for a chart index.
 *
 * Two color modes exist across the app:
 * - `themeColors: false` — the fixed multi-hue palette (`getPrimaryColor`),
 *   perceptually distinct hues that never depend on the theme.
 * - `themeColors: true` — shades of the ACTIVE theme primary (`getThemeShade`),
 *   visually cohesive with the current theme (light/dark or custom primary).
 *
 * This is the single shared resolver for series defaults so every chart
 * (DynamicChart, StatsPieChart, per-site colors, overview cards) honors the
 * mode identically. Explicit picks (seriesColors / locationColors) always
 * win over this default.
 *
 * @param index - The index of the data series (0-based)
 * @param themeColors - When true, use theme-primary shades instead of the
 *   fixed palette
 * @returns CSS color string
 */
export const resolveDefaultSeriesColor = (
  index: number,
  themeColors = false
): string =>
  themeColors ? getThemeShade(index) : getPrimaryColor(index);
