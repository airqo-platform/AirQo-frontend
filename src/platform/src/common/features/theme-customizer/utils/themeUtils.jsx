import {
  THEME_STORAGE_KEY,
  SKIN_STORAGE_KEY,
  PRIMARY_COLOR_STORAGE_KEY,
  LAYOUT_STORAGE_KEY,
  SEMI_DARK_STORAGE_KEY,
  THEME_MODES,
  THEME_SKINS,
  THEME_LAYOUT,
} from '../constants/themeConstants';

function hexToRgb(hex) {
  let cleaned = hex.replace('#', '');
  if (cleaned.length === 3)
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  const intVal = parseInt(cleaned, 16);
  return [(intVal >> 16) & 255, (intVal >> 8) & 255, intVal & 255];
}

export function applyTheme(mode, systemTheme) {
  document.documentElement.classList.remove('light', 'dark');
  const effective =
    mode === THEME_MODES.SYSTEM && systemTheme ? systemTheme : mode;
  document.documentElement.classList.add(effective);
  document.documentElement.setAttribute('data-theme', effective);
}

export function applyPrimaryColor(hex) {
  document.documentElement.style.setProperty('--color-primary', hex);
  const [r, g, b] = hexToRgb(hex);
  document.documentElement.style.setProperty(
    '--color-primary-rgb',
    `${r}, ${g}, ${b}`,
  );
}

export function applyLayout(layout) {
  document.documentElement.setAttribute('data-layout', layout);
}

export function applySemiDark(enabled) {
  document.documentElement.setAttribute(
    'data-semi-dark',
    enabled ? 'true' : 'false',
  );
}

function getLocalStorageItem(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

export function getInitialTheme() {
  return getLocalStorageItem(THEME_STORAGE_KEY, THEME_MODES.LIGHT);
}

export function getInitialSkin() {
  return getLocalStorageItem(SKIN_STORAGE_KEY, THEME_SKINS.BORDERED);
}

export function getInitialPrimaryColor() {
  return getLocalStorageItem(PRIMARY_COLOR_STORAGE_KEY, '#145FFF');
}

export function getInitialLayout() {
  return getLocalStorageItem(LAYOUT_STORAGE_KEY, THEME_LAYOUT.WIDE);
}

export function getInitialSemiDark() {
  return getLocalStorageItem(SEMI_DARK_STORAGE_KEY, 'false') === 'true';
}
