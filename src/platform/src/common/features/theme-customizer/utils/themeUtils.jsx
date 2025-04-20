import { THEME_MODES } from '../constants/themeConstants';

/**
 * Convert hex color to RGB components
 */
function hexToRgb(hex) {
  const cleaned = hex.replace('#', '');
  const expanded =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned;

  const intVal = parseInt(expanded, 16);
  return [(intVal >> 16) & 255, (intVal >> 8) & 255, intVal & 255];
}

/**
 * Apply all theme styles at once
 */
export function applyStyles({ theme, skin, primaryColor, layout, semiDark }) {
  // Apply theme mode
  const root = document.documentElement;
  const effectiveTheme =
    theme.value === THEME_MODES.SYSTEM && theme.system
      ? theme.system
      : theme.value;

  root.classList.remove('light', 'dark');
  root.classList.add(effectiveTheme);
  root.setAttribute('data-theme', effectiveTheme);

  // Apply skin
  root.setAttribute('data-skin', skin);

  // Apply primary color
  if (primaryColor) {
    const [r, g, b] = hexToRgb(primaryColor);
    root.style.setProperty('--color-primary', primaryColor);
    root.style.setProperty('--color-primary-rgb', `${r}, ${g}, ${b}`);
  }

  // Apply layout
  root.setAttribute('data-layout', layout);

  // Apply semi-dark mode
  root.setAttribute('data-semi-dark', semiDark ? 'true' : 'false');
}

/**
 * Safe localStorage getter with fallback
 */
export function getStoredValue(key, fallback) {
  if (typeof window === 'undefined') return fallback;

  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}
