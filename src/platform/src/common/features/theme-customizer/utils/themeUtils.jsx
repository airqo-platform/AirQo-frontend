'use client';

import {
  THEME_STORAGE_KEY,
  SKIN_STORAGE_KEY,
  SEMI_DARK_STORAGE_KEY,
  THEME_SKINS,
  SEMI_DARK_MODES,
} from '../constants/themeConstants';

export const applyTheme = (mode, systemTheme, semiDarkMode) => {
  // Remove all theme classes first
  document.documentElement.classList.remove('light', 'dark', 'semi-dark');

  // Determine effective theme
  const effectiveTheme = mode === 'system' && systemTheme ? systemTheme : mode;

  // Apply theme class
  document.documentElement.classList.add(effectiveTheme);

  // Apply semi-dark mode if enabled
  if (semiDarkMode === SEMI_DARK_MODES.ENABLED) {
    document.documentElement.classList.add('semi-dark');
  }

  // Set theme attribute for potential CSS selectors
  document.documentElement.setAttribute('data-theme', effectiveTheme);
};

const getLocalStorageItem = (key, defaultValue) => {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const savedValue = localStorage.getItem(key);
    return savedValue || defaultValue;
  } catch (error) {
    console.warn(`Could not access localStorage for ${key}:`, error);
    return defaultValue;
  }
};

export const getInitialTheme = () =>
  getLocalStorageItem(
    THEME_STORAGE_KEY,
    window?.matchMedia ? 'system' : 'light',
  );

export const getInitialSkin = () =>
  getLocalStorageItem(SKIN_STORAGE_KEY, THEME_SKINS.BORDERED);

export const getInitialSemiDark = () =>
  getLocalStorageItem(SEMI_DARK_STORAGE_KEY, SEMI_DARK_MODES.DISABLED);
