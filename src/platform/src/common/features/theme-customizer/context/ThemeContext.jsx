'use client';

import React, { createContext, useState, useEffect } from 'react';
import { applyTheme, getInitialTheme } from '../utils/themeUtils';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => getInitialTheme());
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Toggle theme
  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  // Toggle theme sheet
  const openThemeSheet = () => setIsThemeSheetOpen(true);
  const closeThemeSheet = () => setIsThemeSheetOpen(false);

  // Context value
  const contextValue = {
    theme,
    toggleTheme,
    isThemeSheetOpen,
    openThemeSheet,
    closeThemeSheet,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
