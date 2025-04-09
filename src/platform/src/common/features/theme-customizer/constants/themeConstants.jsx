// No need for 'use client' here as this is just constants

export const THEME_MODES = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
});

export const THEME_SKINS = Object.freeze({
  DEFAULT: 'default',
  BORDERED: 'bordered',
});

export const THEME_LAYOUTS = Object.freeze({
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal',
  COLLAPSED: 'collapsed',
});

// Local storage key for theme
export const THEME_STORAGE_KEY = 'app-theme';
