'use client';

import {
  THEME_STORAGE_KEY,
  SKIN_STORAGE_KEY,
  THEME_SKINS,
  THEME_MODES,
} from '../constants/themeConstants';

/**
 * Apply the chosen theme (light, dark, or system) to the <html> element.
 */
export const applyTheme = (mode, systemTheme) => {
  // Remove any existing light/dark classes
  document.documentElement.classList.remove('light', 'dark');

  // Determine which theme to actually apply
  const effectiveTheme =
    mode === THEME_MODES.SYSTEM && systemTheme ? systemTheme : mode;

  // Add the correct class and data attribute
  document.documentElement.classList.add(effectiveTheme);
  document.documentElement.setAttribute('data-theme', effectiveTheme);
};

/**
 * Safe localStorage getter with a fallback.
 */
const getLocalStorageItem = (key, defaultValue) => {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const value = localStorage.getItem(key);
    return value || defaultValue;
  } catch (err) {
    console.warn(`Could not access localStorage for ${key}:`, err);
    return defaultValue;
  }
};

/**
 * Initialize theme state: load from storage or default to LIGHT.
 */
export const getInitialTheme = () =>
  getLocalStorageItem(THEME_STORAGE_KEY, THEME_MODES.LIGHT);

/**
 * Initialize skin state: load from storage or default to BORDERED.
 */
export const getInitialSkin = () =>
  getLocalStorageItem(SKIN_STORAGE_KEY, THEME_SKINS.BORDERED);
