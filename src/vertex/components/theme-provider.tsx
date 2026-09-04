'use client';

import * as React from 'react';
import {
  ThemeData,
  initializeTheme,
  applyThemeImmediately,
  getStoredTheme,
  saveThemeToStorage,
  GROUP_THEME_STORAGE_PREFIX,
  THEME_STORAGE_KEY,
} from '@/lib/theme-utils';
import { themeService } from '@/services/theme-service';
import { useSession } from 'next-auth/react';
import { useAppSelector } from '@/core/redux/hooks';

export interface ThemeContextValue {
  theme: string;
  themeData: ThemeData | null;
  resolvedTheme: 'light' | 'dark';
  setTheme: (mode: 'light' | 'dark' | 'system') => void;
  setPrimaryColor: (color: string) => void;
  updateTheme: (data: Partial<ThemeData>) => Promise<boolean>;
}

const defaultThemeData: ThemeData = {
  mode: 'light',
  primaryColor: '#145FFF',
  interfaceStyle: 'default',
  contentLayout: 'wide',
};

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: 'light',
  themeData: defaultThemeData,
  resolvedTheme: 'light',
  setTheme: () => {},
  setPrimaryColor: () => {},
  updateTheme: async () => false,
});

export interface ThemeProviderProps {
  children: React.ReactNode;
  activeGroupId?: string;
  // Optional next-themes compatibility props
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

interface ExtendedUser {
  id?: string;
  _id?: string;
  accessToken?: string;
}

interface ExtendedSession {
  user?: ExtendedUser;
  accessToken?: string;
}

export function ThemeProvider({
  children,
  activeGroupId: propActiveGroupId,
}: ThemeProviderProps) {
  const { data: session, status } = useSession();
  const extendedSession = session as ExtendedSession | null;
  const userId = extendedSession?.user?.id || extendedSession?.user?._id;
  const token = extendedSession?.accessToken || extendedSession?.user?.accessToken;

  // Read active group from Redux if not explicitly passed as prop
  let reduxGroupId: string | undefined;
  try {
    const activeGroup = useAppSelector((state) => state.user?.activeGroup);
    reduxGroupId = activeGroup?._id;
  } catch {
    reduxGroupId = undefined;
  }

  const activeGroupId = propActiveGroupId || reduxGroupId;

  const [currentTheme, setCurrentTheme] = React.useState<ThemeData>(() => {
    return getStoredTheme(activeGroupId) || defaultThemeData;
  });

  // 1. Ensure theme is initialized immediately on client mount or group change
  React.useEffect(() => {
    initializeTheme(activeGroupId);
    const stored = getStoredTheme(activeGroupId);
    if (stored) {
      setCurrentTheme(stored);
    }
  }, [activeGroupId]);

  // 2. Cross-tab & Cross-app live theme synchronization
  // Listens for localStorage updates made in Nexus, Beacon, or other tabs
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (event: StorageEvent) => {
      if (!event.key || !event.newValue) return;

      const isGroupTheme = event.key.startsWith(GROUP_THEME_STORAGE_PREFIX);
      const isGeneralTheme = event.key === THEME_STORAGE_KEY;

      if (!isGroupTheme && !isGeneralTheme) return;

      const currentGroupKey = activeGroupId
        ? `${GROUP_THEME_STORAGE_PREFIX}${activeGroupId}`
        : null;
      const isCurrentGroupTheme = isGroupTheme && event.key === currentGroupKey;
      const isFallbackTheme = isGeneralTheme && !currentGroupKey;

      if (!isCurrentGroupTheme && !isFallbackTheme) return;

      try {
        const themeData: ThemeData = JSON.parse(event.newValue);
        applyThemeImmediately(themeData);
        setCurrentTheme(themeData);
      } catch (error) {
        console.debug('Failed to parse updated theme from storage event:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [activeGroupId]);

  // 3. Fetch latest theme from backend API when authenticated or group changes
  React.useEffect(() => {
    if (status === 'authenticated') {
      themeService
        .fetchUserTheme(activeGroupId, userId, token)
        .then((fetchedTheme) => {
          if (fetchedTheme) {
            setCurrentTheme(fetchedTheme);
          }
        })
        .catch((err) => {
          console.debug('Could not fetch theme from API:', err);
        });
    }
  }, [activeGroupId, userId, token, status]);

  // Mutator helpers
  const updateTheme = React.useCallback(
    async (partial: Partial<ThemeData>): Promise<boolean> => {
      const merged: ThemeData = {
        ...currentTheme,
        ...partial,
      };

      saveThemeToStorage(merged, activeGroupId);
      applyThemeImmediately(merged);
      setCurrentTheme(merged);

      if (status === 'authenticated') {
        return themeService.updateUserTheme(merged, activeGroupId, token);
      }
      return true;
    },
    [currentTheme, activeGroupId, token, status]
  );

  const setTheme = React.useCallback(
    (mode: 'light' | 'dark' | 'system') => {
      updateTheme({ mode });
    },
    [updateTheme]
  );

  const setPrimaryColor = React.useCallback(
    (color: string) => {
      updateTheme({ primaryColor: color });
    },
    [updateTheme]
  );

  // Determine resolvedTheme
  const resolvedTheme: 'light' | 'dark' = React.useMemo(() => {
    if (currentTheme.mode === 'dark') return 'dark';
    if (currentTheme.mode === 'light') return 'light';
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }, [currentTheme.mode]);

  const contextValue = React.useMemo<ThemeContextValue>(
    () => ({
      theme: currentTheme.mode,
      themeData: currentTheme,
      resolvedTheme,
      setTheme,
      setPrimaryColor,
      updateTheme,
    }),
    [currentTheme, resolvedTheme, setTheme, setPrimaryColor, updateTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'light',
      themeData: defaultThemeData,
      resolvedTheme: 'light',
      setTheme: () => {},
      setPrimaryColor: () => {},
      updateTheme: async () => false,
    };
  }
  return context;
}

export default ThemeProvider;
