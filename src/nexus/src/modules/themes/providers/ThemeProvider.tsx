'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/shared/store';
import { useTheme } from '@/modules/themes/hooks/useTheme';
import {
  initializeTheme,
  applyThemeImmediately,
} from '@/modules/themes/utils/themeUtils';
import { useSWRConfig } from 'swr';
import type { ThemeData } from '@/modules/themes/utils/themeUtils';

const GROUP_THEME_STORAGE_PREFIX = 'theme_group_';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const activeGroup = useSelector((state: RootState) => state.user.activeGroup);
  const { mutate } = useSWRConfig();

  // Initialize theme hooks to sync state and preferences
  useTheme();

  // Ensure theme is initialized on client-side mount with group context
  useEffect(() => {
    initializeTheme(activeGroup?.id);
  }, [activeGroup?.id]);

  // Invalidate theme cache when active group changes to force refetch
  useEffect(() => {
    if (activeGroup?.id) {
      // Invalidate all theme-related SWR caches to force fresh data fetch
      mutate(
        key => typeof key === 'string' && key.startsWith('preferences/theme/')
      );
    }
  }, [activeGroup?.id, mutate]);

  // Cross-tab theme sync: listen for localStorage changes from other tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (event: StorageEvent) => {
      if (!event.key || !event.newValue) return;

      // Check if the changed key is a theme-related key
      const isGroupTheme = event.key.startsWith(GROUP_THEME_STORAGE_PREFIX);
      const isGeneralTheme = event.key === 'theme';

      if (!isGroupTheme && !isGeneralTheme) return;

      // Only react to the current group's theme changes
      const currentGroupKey = activeGroup?.id
        ? `${GROUP_THEME_STORAGE_PREFIX}${activeGroup.id}`
        : null;
      const isCurrentGroupTheme =
        isGroupTheme && event.key === currentGroupKey;
      const isFallbackTheme = isGeneralTheme && !currentGroupKey;

      if (!isCurrentGroupTheme && !isFallbackTheme) return;

      try {
        const themeData: ThemeData = JSON.parse(event.newValue);
        applyThemeImmediately(themeData);
      } catch {
        // Ignore parse errors from malformed storage events
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [activeGroup?.id]);

  return <>{children}</>;
}
