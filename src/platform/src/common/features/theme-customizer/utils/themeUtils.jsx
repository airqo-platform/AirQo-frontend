// src/utils/themeUtils.js

import {
  THEME_STORAGE_KEY,
  SKIN_STORAGE_KEY,
  PRIMARY_COLOR_STORAGE_KEY,
  THEME_MODES,
  THEME_SKINS,
} from '../constants/themeConstants';

/**
 * Convert a hex color string to its RGB components.
 * Supports shorthand (#abc) and full (#aabbcc) formats.
 * @param {string} hex - The hex color code.
 * @returns {[number, number, number]} Array of [r, g, b].
 */
function hexToRgb(hex) {
  let cleaned = hex.replace('#', '');
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const intVal = parseInt(cleaned, 16);
  const r = (intVal >> 16) & 255;
  const g = (intVal >> 8) & 255;
  const b = intVal & 255;
  return [r, g, b];
}

/**
 * Apply light, dark, or system theme to the <html> element.
 * @param {string} mode - One of THEME_MODES.
 * @param {string|null} systemTheme - Current system preference ('light'|'dark').
 */
export function applyTheme(mode, systemTheme) {
  document.documentElement.classList.remove('light', 'dark');
  const effective =
    mode === THEME_MODES.SYSTEM && systemTheme ? systemTheme : mode;
  document.documentElement.classList.add(effective);
  document.documentElement.setAttribute('data-theme', effective);
}

/**
 * Apply primary color CSS variables for solid and opacity-based fills.
 * @param {string} hex - The hex color code for primary.
 */
export function applyPrimaryColor(hex) {
  // Solid fill hex
  document.documentElement.style.setProperty('--color-primary', hex);
  // Compute and set RGB components for opacity utilities
  const [r, g, b] = hexToRgb(hex);
  document.documentElement.style.setProperty(
    '--color-primary-rgb',
    `${r}, ${g}, ${b}`,
  );
}

/**
 * Safely retrieve a value from localStorage, with fallback.
 * @param {string} key - The storage key.
 * @param {string} fallback - Value to return if none found.
 * @returns {string}
 */
function getLocalStorageItem(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

/** Initialize theme from storage or default to LIGHT. */
export function getInitialTheme() {
  return getLocalStorageItem(THEME_STORAGE_KEY, THEME_MODES.LIGHT);
}

/** Initialize skin from storage or default to BORDERED. */
export function getInitialSkin() {
  return getLocalStorageItem(SKIN_STORAGE_KEY, THEME_SKINS.BORDERED);
}

/** Initialize primary color from storage or default to #145FFF. */
export function getInitialPrimaryColor() {
  return getLocalStorageItem(PRIMARY_COLOR_STORAGE_KEY, '#145FFF');
}
