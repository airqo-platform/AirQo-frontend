'use client';

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { applyTheme, getInitialTheme } from '../utils/themeUtils';
import { THEME_STORAGE_KEY } from '../constants/themeConstants';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Initialize theme state with a callback to avoid unnecessary re-renders
  const [theme, setTheme] = useState(getInitialTheme);
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
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newSystemTheme);
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
  }, [theme]);

  // Apply theme effect
  useEffect(() => {
    // Apply the chosen theme
    applyTheme(theme, systemTheme);

    // Save to localStorage if not incognito mode
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Could not save theme preference to localStorage:', error);
    }
  }, [theme, systemTheme]);

  // Memoized callbacks for better performance
  const toggleTheme = useCallback((newTheme) => {
    setTheme(newTheme);
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

    // Return cleanup function
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
      isThemeSheetOpen,
      openThemeSheet,
      closeThemeSheet,
      systemTheme,
    }),
    [
      theme,
      toggleTheme,
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
