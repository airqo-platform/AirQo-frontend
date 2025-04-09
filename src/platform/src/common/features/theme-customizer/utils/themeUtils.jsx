'use client';

import { THEME_STORAGE_KEY } from '../constants/themeConstants';

export const applyTheme = (mode, systemTheme) => {
  document.documentElement.classList.remove('light', 'dark');

  let effectiveTheme = mode;

  if (mode === 'system' && systemTheme) {
    effectiveTheme = systemTheme;
  }

  document.documentElement.classList.add(effectiveTheme);
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
    // Using the result directly instead of storing in unused variable
    return 'system';
  }

  return 'light';
};
