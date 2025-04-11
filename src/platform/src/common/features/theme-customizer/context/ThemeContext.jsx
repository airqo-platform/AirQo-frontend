'use client';

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  applyTheme,
  getInitialTheme,
  getInitialSkin,
  getInitialSemiDark,
} from '../utils/themeUtils';
import {
  THEME_STORAGE_KEY,
  SKIN_STORAGE_KEY,
  SEMI_DARK_STORAGE_KEY,
  SEMI_DARK_MODES,
} from '../constants/themeConstants';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Initialize states with getter functions
  const [theme, setTheme] = useState(getInitialTheme);
  const [skin, setSkin] = useState(getInitialSkin);
  const [semiDarkMode, setSemiDarkMode] = useState(getInitialSemiDark);
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);
  const [systemTheme, setSystemTheme] = useState(null);

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Set initial value
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    // Event handler for system theme changes
    const handleChange = (e) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);

      // Apply new theme if in system mode
      if (theme === 'system') {
        applyTheme('system', newSystemTheme, semiDarkMode);
      }
    };

    // Use the appropriate event listener method
    const addListener = mediaQuery.addEventListener
      ? mediaQuery.addEventListener.bind(mediaQuery)
      : mediaQuery.addListener?.bind(mediaQuery);

    const removeListener = mediaQuery.removeEventListener
      ? mediaQuery.removeEventListener.bind(mediaQuery)
      : mediaQuery.removeListener?.bind(mediaQuery);

    if (addListener) addListener('change', handleChange);

    // Cleanup
    return () => {
      if (removeListener) removeListener('change', handleChange);
    };
  }, [theme, semiDarkMode]);

  // Apply theme effect
  useEffect(() => {
    applyTheme(theme, systemTheme, semiDarkMode);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Could not save theme preference to localStorage:', error);
    }
  }, [theme, systemTheme, semiDarkMode]);

  // Apply skin effect
  useEffect(() => {
    document.documentElement.setAttribute('data-skin', skin);

    try {
      localStorage.setItem(SKIN_STORAGE_KEY, skin);
    } catch (error) {
      console.warn('Could not save skin preference to localStorage:', error);
    }
  }, [skin]);

  // Save semi-dark mode preference
  useEffect(() => {
    try {
      localStorage.setItem(SEMI_DARK_STORAGE_KEY, semiDarkMode);
    } catch (error) {
      console.warn(
        'Could not save semi-dark preference to localStorage:',
        error,
      );
    }
  }, [semiDarkMode]);

  // Memoized callbacks
  const toggleTheme = useCallback((newTheme) => setTheme(newTheme), []);
  const toggleSkin = useCallback((newSkin) => setSkin(newSkin), []);
  const toggleSemiDarkMode = useCallback(
    (enabled) =>
      setSemiDarkMode(
        enabled ? SEMI_DARK_MODES.ENABLED : SEMI_DARK_MODES.DISABLED,
      ),
    [],
  );

  const openThemeSheet = useCallback(() => {
    setIsThemeSheetOpen(true);

    // Handle escape key
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsThemeSheetOpen(false);
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const closeThemeSheet = useCallback(() => setIsThemeSheetOpen(false), []);

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      theme,
      toggleTheme,
      skin,
      toggleSkin,
      semiDarkMode,
      toggleSemiDarkMode,
      isThemeSheetOpen,
      openThemeSheet,
      closeThemeSheet,
      systemTheme,
      isSemiDarkEnabled: semiDarkMode === SEMI_DARK_MODES.ENABLED,
    }),
    [
      theme,
      toggleTheme,
      skin,
      toggleSkin,
      semiDarkMode,
      toggleSemiDarkMode,
      isThemeSheetOpen,
      openThemeSheet,
      closeThemeSheet,
      systemTheme,
    ],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
