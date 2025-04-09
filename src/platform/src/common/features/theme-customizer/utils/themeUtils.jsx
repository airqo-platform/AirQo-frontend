'use client';

import {
  THEME_STORAGE_KEY,
  SKIN_STORAGE_KEY,
  SEMI_DARK_STORAGE_KEY,
  THEME_SKINS,
  SEMI_DARK_MODES,
} from '../constants/themeConstants';

export const applyTheme = (mode, systemTheme, semiDarkMode) => {
  document.documentElement.classList.remove('light', 'dark', 'semi-dark');

  let effectiveTheme = mode;

  if (mode === 'system' && systemTheme) {
    effectiveTheme = systemTheme;
  }

  document.documentElement.classList.add(effectiveTheme);

  // Apply semi-dark mode if enabled
  if (semiDarkMode === SEMI_DARK_MODES.ENABLED) {
    document.documentElement.classList.add('semi-dark');
  }

  document.documentElement.setAttribute('data-theme', effectiveTheme);
};

export const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) return savedTheme;
  } catch (error) {
    console.warn('Could not access localStorage for theme preference:', error);
  }

  if (window.matchMedia) {
    return 'system';
  }

  return 'light';
};

export const getInitialSkin = () => {
  if (typeof window === 'undefined') {
    return THEME_SKINS.BORDERED;
  }

  try {
    const savedSkin = localStorage.getItem(SKIN_STORAGE_KEY);
    if (savedSkin) return savedSkin;
  } catch (error) {
    console.warn('Could not access localStorage for skin preference:', error);
  }

  return THEME_SKINS.BORDERED;
};

export const getInitialSemiDark = () => {
  if (typeof window === 'undefined') {
    return SEMI_DARK_MODES.DISABLED;
  }

  try {
    const savedSemiDark = localStorage.getItem(SEMI_DARK_STORAGE_KEY);
    if (savedSemiDark) return savedSemiDark;
  } catch (error) {
    console.warn(
      'Could not access localStorage for semi-dark preference:',
      error,
    );
  }

  return SEMI_DARK_MODES.DISABLED;
};
