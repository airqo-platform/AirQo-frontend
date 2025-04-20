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
  applyLayout,
  applySemiDark,
  getInitialTheme,
  getInitialSkin,
  getInitialPrimaryColor,
  getInitialLayout,
  getInitialSemiDark,
} from '../utils/themeUtils';
import {
  THEME_STORAGE_KEY,
  SKIN_STORAGE_KEY,
  PRIMARY_COLOR_STORAGE_KEY,
  LAYOUT_STORAGE_KEY,
  SEMI_DARK_STORAGE_KEY,
} from '../constants/themeConstants';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => getInitialTheme());
  const [skin, setSkin] = useState(() => getInitialSkin());
  const [primaryColor, setPrimaryColor] = useState(() =>
    getInitialPrimaryColor(),
  );
  const [layout, setLayout] = useState(() => getInitialLayout());
  const [semiDark, setSemiDark] = useState(() => getInitialSemiDark());
  const [systemTheme, setSystemTheme] = useState(null);
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
    onChange(mq);
    const add = mq.addEventListener ?? mq.addListener;
    const remove = mq.removeEventListener ?? mq.removeListener;
    add.call(mq, 'change', onChange);
    return () => remove.call(mq, 'change', onChange);
  }, []);

  useEffect(() => {
    applyTheme(theme, systemTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      //empty
    }
  }, [theme, systemTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-skin', skin);
    try {
      localStorage.setItem(SKIN_STORAGE_KEY, skin);
    } catch {
      //empty
    }
  }, [skin]);

  useEffect(() => {
    applyPrimaryColor(primaryColor);
    try {
      localStorage.setItem(PRIMARY_COLOR_STORAGE_KEY, primaryColor);
    } catch {
      //empty
    }
  }, [primaryColor]);

  useEffect(() => {
    applyLayout(layout);
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, layout);
    } catch {
      //empty
    }
  }, [layout]);

  useEffect(() => {
    applySemiDark(semiDark);
    try {
      localStorage.setItem(SEMI_DARK_STORAGE_KEY, semiDark.toString());
    } catch {
      //empty
    }
  }, [semiDark]);

  const toggleTheme = useCallback((t) => setTheme(t), []);
  const toggleSkin = useCallback((s) => setSkin(s), []);
  const openThemeSheet = useCallback(() => setIsThemeSheetOpen(true), []);
  const closeThemeSheet = useCallback(() => setIsThemeSheetOpen(false), []);
  const setLayoutOption = useCallback((l) => setLayout(l), []);
  const toggleSemiDark = useCallback(() => setSemiDark((sd) => !sd), []);

  const contextValue = useMemo(
    () => ({
      theme,
      toggleTheme,
      skin,
      toggleSkin,
      primaryColor,
      setPrimaryColor,
      layout,
      setLayout: setLayoutOption,
      semiDark,
      toggleSemiDark,
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
      layout,
      setLayoutOption,
      semiDark,
      toggleSemiDark,
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
