'use client';

import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { THEME_MODES } from '../constants/themeConstants';

/**
 * Safe version of useTheme that doesn't throw an error if used outside ThemeProvider
 * Returns default values when theme context is not available
 */
export const useThemeSafe = () => {
  const ctx = useContext(ThemeContext);

  // Return default values if context is not available
  if (!ctx) {
    return {
      theme: THEME_MODES.LIGHT,
      primaryColor: '#145FFF',
      systemTheme: 'light',
      skin: 'default',
      layout: 'compact',
      semiDark: false,
      isThemeSheetOpen: false,
      // Provide no-op functions for actions
      toggleTheme: () => {},
      toggleSkin: () => {},
      setPrimaryColor: () => {},
      setLayout: () => {},
      toggleSemiDark: () => {},
      openThemeSheet: () => {},
      closeThemeSheet: () => {},
    };
  }

  return ctx;
};
