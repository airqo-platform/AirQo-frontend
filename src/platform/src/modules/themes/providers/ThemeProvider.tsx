'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/shared/store';
import { useTheme } from '@/modules/themes/hooks/useTheme';
import { useThemePreferences } from '@/modules/themes/hooks/useThemePreferences';
import { initializeTheme } from '@/modules/themes/utils/themeUtils';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const activeGroup = useSelector((state: RootState) => state.user.activeGroup);

  // Initialize theme hooks to sync state and preferences
  useTheme();
  useThemePreferences();

  // Ensure theme is initialized on client-side mount with group context
  useEffect(() => {
    initializeTheme(activeGroup?.id);
  }, [activeGroup?.id]);

  return <>{children}</>;
}
