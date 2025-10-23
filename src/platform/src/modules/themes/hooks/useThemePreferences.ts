'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/shared/store';
import { useUser } from '@/shared/hooks/useUser';
import {
  useUpdateUserTheme,
  useUserTheme,
} from '@/shared/hooks/usePreferences';
import {
  setThemeMode,
  setPrimaryColor,
  setInterfaceStyle,
  setContentLayout,
} from '@/modules/themes/store/themeSlice';
import {
  getStoredTheme,
  saveThemeToStorage,
  applyThemeImmediately,
  ThemeData,
} from '../utils/themeUtils';
import type { Theme } from '@/shared/types/api';

// Extend session user type to include _id
interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  _id?: string;
}

/**
 * Hook for managing theme preferences with API integration
 * Handles fetching, updating, and syncing theme data on login
 */
export const useThemePreferences = () => {
  const { data: session, status } = useSession();
  const { user } = useUser();
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const activeGroup = useSelector((state: RootState) => state.user.activeGroup);

  // Track initialization state to prevent loops and group changes
  const initializationRef = useRef({
    isInitialized: false,
    isInitializing: false,
    lastUserId: null as string | null,
    lastGroupId: null as string | null,
  });

  // Get user ID from session or user store
  const userId = user?.id || (session?.user as SessionUser)?._id;

  // API hooks for theme management
  const {
    data: userThemeData,
    error: userThemeError,
    isValidating: isLoadingUserTheme,
  } = useUserTheme(userId || '', activeGroup?.id || '');

  const { trigger: updateTheme, isMutating: isUpdatingTheme } =
    useUpdateUserTheme();

  /**
   * Convert API theme format to internal ThemeData format
   */
  const convertApiThemeToThemeData = useCallback(
    (apiTheme: Theme): ThemeData => ({
      primaryColor: apiTheme.primaryColor,
      mode: apiTheme.mode,
      interfaceStyle: apiTheme.interfaceStyle,
      contentLayout: apiTheme.contentLayout,
    }),
    []
  );

  /**
   * Convert internal ThemeData to API theme format
   */
  const convertThemeDataToApiTheme = useCallback(
    (themeData: ThemeData): Theme => ({
      primaryColor: themeData.primaryColor,
      mode: themeData.mode === 'system' ? 'light' : themeData.mode, // API doesn't support system mode
      interfaceStyle: themeData.interfaceStyle,
      contentLayout: themeData.contentLayout,
    }),
    []
  );

  /**
   * Apply theme to Redux store and DOM
   */
  const applyThemeToApp = useCallback(
    (themeData: ThemeData) => {
      // Update Redux state
      dispatch(setPrimaryColor(themeData.primaryColor));
      dispatch(setThemeMode(themeData.mode));
      dispatch(setInterfaceStyle(themeData.interfaceStyle));
      dispatch(setContentLayout(themeData.contentLayout));

      // Apply to DOM immediately
      applyThemeImmediately(themeData);

      // Save to localStorage with group context
      saveThemeToStorage(themeData, activeGroup?.id);
    },
    [dispatch, activeGroup?.id]
  );

  /**
   * Initialize theme from API on successful authentication
   */
  const initializeThemeFromApi = useCallback(async () => {
    const { current: initState } = initializationRef;

    // Prevent multiple initializations or initialization loops
    if (
      initState.isInitializing ||
      (initState.isInitialized &&
        initState.lastUserId === userId &&
        initState.lastGroupId === activeGroup?.id) ||
      !userId ||
      !activeGroup?.id ||
      status !== 'authenticated'
    ) {
      return;
    }

    // Mark as initializing
    initState.isInitializing = true;

    try {
      if (userThemeData?.success && userThemeData.data) {
        const apiTheme = userThemeData.data;
        const themeData = convertApiThemeToThemeData(apiTheme);

        // Get current stored theme to compare (group-specific)
        const storedTheme = getStoredTheme(activeGroup?.id);
        const hasChanges =
          !storedTheme ||
          JSON.stringify(themeData) !== JSON.stringify(storedTheme);

        if (hasChanges) {
          // Apply the theme
          applyThemeToApp(themeData);
        }

        // Mark as initialized for this user and group
        initState.isInitialized = true;
        initState.lastUserId = userId;
        initState.lastGroupId = activeGroup?.id;
      } else if (userThemeError) {
        // If API call failed, ensure we have a theme applied
      }
    } catch (error) {
      console.error('Failed to initialize theme from API:', error);

      // Fallback to stored theme (group-specific)
      const storedTheme = getStoredTheme(activeGroup?.id);
      if (storedTheme) {
        applyThemeToApp(storedTheme);
      }
    } finally {
      initState.isInitializing = false;
    }
  }, [
    userId,
    activeGroup?.id,
    status,
    userThemeData,
    userThemeError,
    convertApiThemeToThemeData,
    applyThemeToApp,
  ]);

  /**
   * Update theme preference via API
   */
  const updateThemePreference = useCallback(
    async (updates: Partial<ThemeData>) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Create new theme object with updates
      const newThemeData: ThemeData = {
        primaryColor: updates.primaryColor ?? theme.primaryColor,
        mode: updates.mode ?? theme.mode,
        interfaceStyle: updates.interfaceStyle ?? theme.interfaceStyle,
        contentLayout: updates.contentLayout ?? theme.contentLayout,
      };

      try {
        // Optimistically apply the theme locally first
        applyThemeToApp(newThemeData);

        // Convert to API format and update via API
        const apiTheme = convertThemeDataToApiTheme(newThemeData);

        await updateTheme({
          userId,
          groupId: activeGroup?.id || '',
          theme: { theme: apiTheme },
        });
      } catch (error) {
        console.error('Failed to update theme preference:', error);

        // Revert to previous theme on error (group-specific)
        const storedTheme = getStoredTheme(activeGroup?.id);
        if (storedTheme) {
          applyThemeToApp(storedTheme);
        }

        throw error;
      }
    },
    [
      userId,
      theme,
      updateTheme,
      applyThemeToApp,
      convertThemeDataToApiTheme,
      activeGroup?.id,
    ]
  );

  /**
   * Update primary color
   */
  const updatePrimaryColor = useCallback(
    (primaryColor: string) => updateThemePreference({ primaryColor }),
    [updateThemePreference]
  );

  /**
   * Update theme mode
   */
  const updateThemeMode = useCallback(
    (mode: 'light' | 'dark' | 'system') => updateThemePreference({ mode }),
    [updateThemePreference]
  );

  /**
   * Update interface style
   */
  const updateInterfaceStyle = useCallback(
    (interfaceStyle: 'default' | 'bordered') =>
      updateThemePreference({ interfaceStyle }),
    [updateThemePreference]
  );

  /**
   * Update content layout
   */
  const updateContentLayout = useCallback(
    (contentLayout: 'compact' | 'wide') =>
      updateThemePreference({ contentLayout }),
    [updateThemePreference]
  );

  // Initialize theme when user logs in, changes, or active group changes
  useEffect(() => {
    if (status === 'authenticated' && userId && activeGroup?.id) {
      // Small delay to allow SWR to fetch data
      const timer = setTimeout(() => {
        initializeThemeFromApi();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [status, userId, activeGroup?.id, initializeThemeFromApi]);

  // Reset initialization when user changes, logs out, or group changes
  useEffect(() => {
    const { current: initState } = initializationRef;

    if (
      status === 'unauthenticated' ||
      initState.lastUserId !== userId ||
      initState.lastGroupId !== activeGroup?.id
    ) {
      // Clear initialization flags
      initState.isInitialized = false;
      initState.isInitializing = false;

      // If group changed but user is the same, load group-specific theme
      if (
        userId &&
        activeGroup?.id &&
        initState.lastUserId === userId &&
        initState.lastGroupId !== activeGroup?.id
      ) {
        const groupTheme = getStoredTheme(activeGroup?.id);
        if (groupTheme) {
          applyThemeToApp(groupTheme);
        }
      }

      // Update tracking values
      initState.lastUserId = userId || null;
      initState.lastGroupId = activeGroup?.id || null;
    }
  }, [status, userId, activeGroup?.id, applyThemeToApp]);

  return {
    // State
    theme,
    isLoading: isLoadingUserTheme || isUpdatingTheme,
    error: userThemeError,
    isInitialized: initializationRef.current.isInitialized,

    // Actions
    updateThemePreference,
    updatePrimaryColor,
    updateThemeMode,
    updateInterfaceStyle,
    updateContentLayout,
  };
};
