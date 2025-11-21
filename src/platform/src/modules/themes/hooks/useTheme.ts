'use client';

import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/shared/store';
import { useThemePreferences } from './useThemePreferences';
import { getStoredTheme, applyThemeImmediately } from '../utils/themeUtils';

export const useTheme = () => {
  const theme = useSelector((state: RootState) => state.theme);
  const activeGroup = useSelector((state: RootState) => state.user.activeGroup);
  const themePreferences = useThemePreferences();

  // Sync Redux state with localStorage on mount (fallback)
  useEffect(() => {
    const syncThemeFromStorage = () => {
      const storedTheme = getStoredTheme(activeGroup?.id);
      if (storedTheme && !themePreferences.isInitialized) {
        // Only apply stored theme if preferences haven't been initialized yet
        applyThemeImmediately(storedTheme);
      }
    };

    syncThemeFromStorage();
  }, [themePreferences.isInitialized, activeGroup?.id]);

  // Delegate theme updates to the preferences system
  const updateTheme = useCallback(
    async (
      updates: Partial<{
        primaryColor: string;
        mode: 'light' | 'dark' | 'system';
        interfaceStyle: 'default' | 'bordered';
        contentLayout: 'compact' | 'wide';
      }>
    ) => {
      // Use the theme preferences hook for updates
      await themePreferences.updateThemePreference(updates);
    },
    [themePreferences]
  );

  return {
    theme,
    updateTheme,
    isLoading: themePreferences.isLoading,
    error: themePreferences.error,
    // Expose individual update methods
    updatePrimaryColor: themePreferences.updatePrimaryColor,
    updateThemeMode: themePreferences.updateThemeMode,
    updateInterfaceStyle: themePreferences.updateInterfaceStyle,
    updateContentLayout: themePreferences.updateContentLayout,
  };
};
