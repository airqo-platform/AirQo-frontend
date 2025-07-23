import { useCallback } from 'react';

export function useColorResolver(activeIndex, theme, systemTheme) {
  return useCallback(
    (idx) => {
      if (typeof window === 'undefined') return 'rgba(20,95,255,1)';
      const css = window.getComputedStyle(document.documentElement);
      const [r, g, b] = css
        .getPropertyValue('--color-primary-rgb')
        .trim()
        .split(',')
        .map(Number);

      const shadeMap = [950, 800, 500, 200];
      const factorMap = { 950: 0.2, 800: 0.4, 500: 0.7, 200: 0.9 };
      const shade = shadeMap[idx % shadeMap.length];
      const factor = factorMap[shade];

      const sr = Math.round(r * factor);
      const sg = Math.round(g * factor);
      const sb = Math.round(b * factor);

      const color = `rgb(${sr}, ${sg}, ${sb})`;
      return activeIndex === null || activeIndex === idx
        ? color
        : 'rgba(204, 204, 204, 0.5)';
    },
    [activeIndex, theme, systemTheme],
  );
}
