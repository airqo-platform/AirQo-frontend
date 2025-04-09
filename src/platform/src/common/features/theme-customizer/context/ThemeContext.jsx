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
  // Initialize theme states with callbacks to avoid unnecessary re-renders
  const [theme, setTheme] = useState(getInitialTheme);
  const [skin, setSkin] = useState(getInitialSkin);
  const [semiDarkMode, setSemiDarkMode] = useState(getInitialSemiDark);
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);
  const [systemTheme, setSystemTheme] = useState(null);

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Set initial system theme value
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    // Event handler for system theme changes
    const handleChange = (e) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);

      // If current theme is 'system', apply the new system theme
      if (theme === 'system') {
        applyTheme('system', newSystemTheme, semiDarkMode);
      }
    };

    // Use the appropriate event listener method based on browser support
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Clean up event listener on unmount
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [theme, semiDarkMode]);

  // Apply theme effect
  useEffect(() => {
    // Apply the chosen theme and semi-dark mode
    applyTheme(theme, systemTheme, semiDarkMode);

    // Save to localStorage if not incognito mode
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Could not save theme preference to localStorage:', error);
    }
  }, [theme, systemTheme, semiDarkMode]);

  // Apply skin effect
  useEffect(() => {
    // Apply chosen skin
    document.documentElement.setAttribute('data-skin', skin);

    // Save to localStorage if not incognito mode
    try {
      localStorage.setItem(SKIN_STORAGE_KEY, skin);
    } catch (error) {
      console.warn('Could not save skin preference to localStorage:', error);
    }
  }, [skin]);

  // Apply semi-dark mode effect
  useEffect(() => {
    // Save to localStorage if not incognito mode
    try {
      localStorage.setItem(SEMI_DARK_STORAGE_KEY, semiDarkMode);
    } catch (error) {
      console.warn(
        'Could not save semi-dark preference to localStorage:',
        error,
      );
    }
  }, [semiDarkMode]);

  // Memoized callbacks for better performance
  const toggleTheme = useCallback((newTheme) => {
    setTheme(newTheme);
  }, []);

  const toggleSkin = useCallback((newSkin) => {
    setSkin(newSkin);
  }, []);

  const toggleSemiDarkMode = useCallback((enabled) => {
    setSemiDarkMode(
      enabled ? SEMI_DARK_MODES.ENABLED : SEMI_DARK_MODES.DISABLED,
    );
  }, []);

  const openThemeSheet = useCallback(() => {
    setIsThemeSheetOpen(true);

    // Add event listener to handle escape key
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setIsThemeSheetOpen(false);
      }
    };

    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const closeThemeSheet = useCallback(() => {
    setIsThemeSheetOpen(false);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
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
