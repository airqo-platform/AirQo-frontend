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
  applyPrimaryColor,
  getInitialTheme,
  getInitialSkin,
  getInitialPrimaryColor,
} from '../utils/themeUtils';
import {
  THEME_STORAGE_KEY,
  SKIN_STORAGE_KEY,
  PRIMARY_COLOR_STORAGE_KEY,
} from '../constants/themeConstants';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // default if nothing stored
  const [theme, setTheme] = useState(() => getInitialTheme());
  const [skin, setSkin] = useState(() => getInitialSkin());
  const [primaryColor, setPrimaryColor] = useState(() =>
    getInitialPrimaryColor(),
  );
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);
  const [systemTheme, setSystemTheme] = useState(null);

  // watch system preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
    onChange(mq);
    const add = mq.addEventListener ?? mq.addListener;
    const remove = mq.removeEventListener ?? mq.removeListener;
    add.call(mq, 'change', onChange);
    return () => remove.call(mq, 'change', onChange);
  }, []);

  // apply & persist theme
  useEffect(() => {
    applyTheme(theme, systemTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // empty
    }
  }, [theme, systemTheme]);

  // apply & persist skin
  useEffect(() => {
    document.documentElement.setAttribute('data-skin', skin);
    try {
      localStorage.setItem(SKIN_STORAGE_KEY, skin);
    } catch {
      // empty
    }
  }, [skin]);

  // apply & persist primary color
  useEffect(() => {
    applyPrimaryColor(primaryColor);
    try {
      localStorage.setItem(PRIMARY_COLOR_STORAGE_KEY, primaryColor);
    } catch {
      // empty
    }
  }, [primaryColor]);

  const toggleTheme = useCallback((t) => setTheme(t), []);
  const toggleSkin = useCallback((s) => setSkin(s), []);
  const openThemeSheet = useCallback(() => setIsThemeSheetOpen(true), []);
  const closeThemeSheet = useCallback(() => setIsThemeSheetOpen(false), []);

  const contextValue = useMemo(
    () => ({
      theme,
      toggleTheme,
      skin,
      toggleSkin,
      primaryColor,
      setPrimaryColor,
      isThemeSheetOpen,
      openThemeSheet,
      closeThemeSheet,
      systemTheme,
    }),
    [
      theme,
      toggleTheme,
      skin,
      toggleSkin,
      primaryColor,
      setPrimaryColor,
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
