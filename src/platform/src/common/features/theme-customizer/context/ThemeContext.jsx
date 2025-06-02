'use client';
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  THEME_MODES,
  THEME_SKINS,
  THEME_LAYOUT,
  STORAGE_KEYS,
} from '../constants/themeConstants';
import { getStoredValue, applyStyles } from '../utils/themeUtils';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Initialize states with stored values or defaults
  const [theme, setTheme] = useState(() =>
    getStoredValue(STORAGE_KEYS.THEME, THEME_MODES.LIGHT),
  );
  const [skin, setSkin] = useState(() =>
    getStoredValue(STORAGE_KEYS.SKIN, THEME_SKINS.BORDERED),
  );
  const [primaryColor, setPrimaryColor] = useState(() =>
    getStoredValue(STORAGE_KEYS.PRIMARY_COLOR, '#145FFF'),
  );
  const [layout, setLayout] = useState(() =>
    getStoredValue(STORAGE_KEYS.LAYOUT, THEME_LAYOUT.COMPACT),
  ); // Changed default to COMPACT
  const [semiDark, setSemiDark] = useState(
    () => getStoredValue(STORAGE_KEYS.SEMI_DARK, 'false') === 'true',
  );
  const [systemTheme, setSystemTheme] = useState(null);
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);

  // System theme detection
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setSystemTheme(e.matches ? 'dark' : 'light');

    handleChange(mq);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // Apply theme changes
  useEffect(() => {
    applyStyles({
      theme: { value: theme, system: systemTheme },
      skin,
      primaryColor,
      layout,
      semiDark,
    });

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      localStorage.setItem(STORAGE_KEYS.SKIN, skin);
      localStorage.setItem(STORAGE_KEYS.PRIMARY_COLOR, primaryColor);
      localStorage.setItem(STORAGE_KEYS.LAYOUT, layout);
      localStorage.setItem(STORAGE_KEYS.SEMI_DARK, String(semiDark));
    } catch {
      // Silent fail for localStorage errors
    }
  }, [theme, skin, primaryColor, layout, semiDark, systemTheme]);

  // Action handlers
  const toggleTheme = useCallback((t) => setTheme(t), []);
  const toggleSkin = useCallback((s) => setSkin(s), []);
  const toggleSemiDark = useCallback(() => setSemiDark((prev) => !prev), []);
  const themeSheetActions = useMemo(
    () => ({
      open: () => setIsThemeSheetOpen(true),
      close: () => setIsThemeSheetOpen(false),
    }),
    [],
  );

  const contextValue = useMemo(
    () => ({
      theme,
      toggleTheme,
      skin,
      toggleSkin,
      primaryColor,
      setPrimaryColor,
      layout,
      setLayout,
      semiDark,
      toggleSemiDark,
      isThemeSheetOpen,
      openThemeSheet: themeSheetActions.open,
      closeThemeSheet: themeSheetActions.close,
      systemTheme,
    }),
    [
      theme,
      toggleTheme,
      skin,
      toggleSkin,
      primaryColor,
      setPrimaryColor,
      layout,
      setLayout,
      semiDark,
      toggleSemiDark,
      isThemeSheetOpen,
      themeSheetActions,
      systemTheme,
    ],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
