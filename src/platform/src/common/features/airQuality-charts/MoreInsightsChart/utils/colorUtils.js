import { useCallback } from 'react';

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// Enhanced series color presets - optimized for clear visual differentiation
// Strategy: Use dramatic lightness gaps and complementary saturation levels to ensure
// each location/series is easily distinguishable, even for 8+ series on one chart.
//
// Pattern explanation:
// - Alternates between very dark, medium, and light shades with high saturation gaps
// - First 4 entries are optimized for the most common 4-location scenario
// - Entries 5-12 handle additional locations with continued strong differentiation
//
// Manual adjustment guide:
// - `s` (saturation %): Higher = more vivid, Lower = more muted (keep 50-98 for distinction)
// - `l` (lightness %): Lower = darker, Higher = lighter (use 15-75 range for max contrast)
// - For 4 locations: focus on indices 0-3. For more: all entries are used cyclically.
const SERIES_STYLES = [
  /* 0 */ { s: 95, l: 22 }, // Very dark, highly saturated - primary series
  /* 1 */ { s: 75, l: 58 }, // Medium-light, less saturated - strong contrast to #0
  /* 2 */ { s: 88, l: 35 }, // Medium-dark, high saturation - distinct from both above
  /* 3 */ { s: 65, l: 68 }, // Light, muted - maximum contrast to #0, clear from #2

  // Additional locations (5th and beyond) - continues the pattern
  /* 4 */ { s: 98, l: 18 }, // Darkest possible, maximum saturation
  /* 5 */ { s: 70, l: 62 }, // Light, medium saturation
  /* 6 */ { s: 85, l: 28 }, // Dark, high saturation
  /* 7 */ { s: 60, l: 72 }, // Lightest, low saturation
  /* 8 */ { s: 92, l: 25 }, // Dark, very high saturation
  /* 9 */ { s: 68, l: 65 }, // Medium-light, medium saturation
  /* 10 */ { s: 80, l: 32 }, // Medium-dark, high saturation
  /* 11 */ { s: 55, l: 75 }, // Very light, low saturation - maximum contrast
];

export function useColorResolver(activeIndex) {
  return useCallback(
    (idx) => {
      if (typeof window === 'undefined') return 'rgb(20,95,255)';

      const css = window.getComputedStyle(document.documentElement);
      let rgb = css.getPropertyValue('--color-primary-rgb') || '';
      rgb = rgb.trim();

      if (!rgb) rgb = '20,95,255';

      const parts = rgb
        .split(',')
        .map((p) => Number(p.trim()))
        .slice(0, 3);
      if (parts.length < 3 || parts.some(Number.isNaN)) {
        parts[0] = 20;
        parts[1] = 95;
        parts[2] = 255;
      }

      const [baseHue] = rgbToHsl(parts[0], parts[1], parts[2]);

      const style = SERIES_STYLES[idx % SERIES_STYLES.length];
      const hue = baseHue;
      // Allow wider saturation range (50-100) for better differentiation
      const sat = Math.max(50, Math.min(100, style.s));
      // Allow darker colors (15% minimum instead of 8%) and expand upper range to 80%
      const light = Math.max(15, Math.min(80, style.l));

      const color = `hsl(${hue}, ${sat}%, ${light}%)`;

      return activeIndex === null || activeIndex === idx
        ? color
        : 'rgba(128,128,128,0.45)';
    },
    [activeIndex],
  );
}
