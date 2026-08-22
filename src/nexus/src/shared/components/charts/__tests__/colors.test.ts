import {
  getThemeShade,
  resolveDefaultSeriesColor,
  THEME_SHADE_COUNT,
} from '../colors';
import { getPrimaryColor } from '../constants';

describe('getThemeShade', () => {
  it('index 0 is the full theme primary', () => {
    expect(getThemeShade(0)).toBe('rgb(var(--primary))');
  });

  it('produces distinct shades for consecutive indices', () => {
    const shades = [0, 1, 2, 3, 4, 5].map(getThemeShade);
    expect(new Set(shades).size).toBe(shades.length);
  });

  it('keeps the active theme primary as the mixing base', () => {
    expect(getThemeShade(3)).toContain('rgb(var(--primary))');
    expect(getThemeShade(3)).toContain('color-mix');
  });

  it('cycles into dark shades after the light ramp (no near-white flattening)', () => {
    const lastLight = getThemeShade(THEME_SHADE_COUNT - 1);
    const firstDark = getThemeShade(THEME_SHADE_COUNT);
    expect(lastLight).toContain('white');
    expect(firstDark).toContain('black');
    expect(firstDark).not.toBe(lastLight);
  });
});

describe('resolveDefaultSeriesColor', () => {
  it('defaults to the fixed multi-hue palette', () => {
    expect(resolveDefaultSeriesColor(2)).toBe(getPrimaryColor(2));
    expect(resolveDefaultSeriesColor(2, false)).toBe(getPrimaryColor(2));
  });

  it('uses theme-primary shades when themeColors is on', () => {
    expect(resolveDefaultSeriesColor(2, true)).toBe(getThemeShade(2));
  });

  it('theme mode and palette mode differ for the same index', () => {
    expect(resolveDefaultSeriesColor(3, true)).not.toBe(
      resolveDefaultSeriesColor(3, false)
    );
  });
});
