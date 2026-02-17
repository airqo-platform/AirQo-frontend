'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/shared/store';
import { useTheme } from '@/modules/themes/hooks/useTheme';
import { useThemePreferences } from '@/modules/themes/hooks/useThemePreferences';
import { initializeTheme } from '@/modules/themes/utils/themeUtils';
import { useSWRConfig } from 'swr';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const activeGroup = useSelector((state: RootState) => state.user.activeGroup);
  const { mutate } = useSWRConfig();

  // Initialize theme hooks to sync state and preferences
  useTheme();
  useThemePreferences();

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

  return <>{children}</>;
}
