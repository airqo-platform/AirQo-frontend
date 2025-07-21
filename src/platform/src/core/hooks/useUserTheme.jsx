'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { getUserThemeApi, updateUserThemeApi } from '@/core/apis/Account';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import { useSession } from 'next-auth/react';
import CustomToast from '@/components/Toast/CustomToast';

// Utility functions and constants
const isValidObjectId = (id) => id && /^[0-9a-fA-F]{24}$/.test(id);

const DEFAULT_THEME = {
  primaryColor: '#145FFF',
  mode: 'light',
  interfaceStyle: 'default',
  contentLayout: 'compact',
};

// Session storage keys
const SESSION_STORAGE_KEYS = {
  THEME: 'userTheme',
  THEME_LOADED: 'userThemeLoaded',
};

/**
 * Custom hook to manage user theme preferences
 * Handles theme fetching and updating with proper error handling
 */
const useUserTheme = () => {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs for cleanup and avoiding stale closures
  const abortControllerRef = useRef(null);
  const isUnmountedRef = useRef(false);
  const lastFetchedGroupIdRef = useRef(null);

  // External hooks
  const { userID, id: activeGroupId, activeGroup } = useGetActiveGroup();
  const { status } = useSession();
  const {
    theme: currentThemeMode,
    primaryColor: currentPrimaryColor,
    skin: currentSkin,
    layout: currentLayout,
    setPrimaryColor,
    toggleTheme,
    toggleSkin,
    setLayout,
  } = useTheme();

  // Memoized validation checks
  const isValidUser = useMemo(
    () => userID && isValidObjectId(userID),
    [userID],
  );

  const isValidGroup = useMemo(
    () => activeGroupId && isValidObjectId(activeGroupId),
    [activeGroupId],
  );

  const isAuthenticated = useMemo(() => status === 'authenticated', [status]);

  // Memoized current theme data mapper
  const mapThemeContextToApiFormat = useCallback(
    () => ({
      primaryColor:
        currentPrimaryColor || theme.primaryColor || DEFAULT_THEME.primaryColor,
      mode: currentThemeMode || theme.mode || DEFAULT_THEME.mode,
      interfaceStyle:
        currentSkin || theme.interfaceStyle || DEFAULT_THEME.interfaceStyle,
      contentLayout:
        currentLayout || theme.contentLayout || DEFAULT_THEME.contentLayout,
    }),
    [currentPrimaryColor, currentThemeMode, currentSkin, currentLayout, theme],
  );

  // Helper to safely update state if component is still mounted
  const safeSetState = useCallback((stateSetter, value) => {
    if (!isUnmountedRef.current) {
      stateSetter(value);
    }
  }, []);

  // Helper to apply theme to context
  const applyThemeToContext = useCallback(
    (themeData) => {
      if (isUnmountedRef.current) return;

      setPrimaryColor(themeData.primaryColor);
      toggleTheme(themeData.mode);
      toggleSkin(themeData.interfaceStyle);
      setLayout(themeData.contentLayout);
    },
    [setPrimaryColor, toggleTheme, toggleSkin, setLayout],
  );

  // Helper to get theme from session storage
  const getSessionTheme = useCallback(() => {
    if (typeof window === 'undefined') return null;

    try {
      const storedTheme = window.sessionStorage.getItem(
        SESSION_STORAGE_KEYS.THEME,
      );
      const isLoaded = window.sessionStorage.getItem(
        SESSION_STORAGE_KEYS.THEME_LOADED,
      );

      if (storedTheme && isLoaded === 'true') {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEYS.THEME_LOADED);
        return JSON.parse(storedTheme);
      }
    } catch (error) {
      console.warn('Failed to parse session storage theme:', error);
    }

    return null;
  }, []);

  // Fetch user theme with proper error handling and cancellation
  const fetchUserTheme = useCallback(async () => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    // Validation checks
    if (!isValidUser) {
      safeSetState(setError, 'Invalid or missing user ID for fetching theme');
      safeSetState(setIsInitialized, true);
      safeSetState(setLoading, false);
      return;
    }

    if (!isValidGroup) {
      safeSetState(setError, 'Invalid or missing group ID for fetching theme');
      safeSetState(setIsInitialized, true);
      safeSetState(setLoading, false);
      return;
    }

    if (!activeGroup) {
      safeSetState(setError, 'Active group data is not available');
      safeSetState(setIsInitialized, true);
      safeSetState(setLoading, false);
      return;
    }

    try {
      safeSetState(setLoading, true);
      safeSetState(setError, null);

      // Check if request was cancelled
      if (signal.aborted) return;

      // Try to get theme from session storage first
      const sessionTheme = getSessionTheme();

      let newTheme;
      if (sessionTheme) {
        newTheme = { ...DEFAULT_THEME, ...sessionTheme };
      } else {
        // Check if request was cancelled before API call
        if (signal.aborted) return;

        const response = await getUserThemeApi(userID, activeGroupId);

        // Check if request was cancelled after API call
        if (signal.aborted) return;

        newTheme =
          response?.success && response?.data
            ? { ...DEFAULT_THEME, ...response.data }
            : DEFAULT_THEME;
      }

      // Update state and context if not cancelled
      if (!signal.aborted) {
        safeSetState(setTheme, newTheme);
        applyThemeToContext(newTheme);
        lastFetchedGroupIdRef.current = activeGroupId;
      }
    } catch (err) {
      // Don't set error if request was cancelled
      if (!signal.aborted) {
        const errorMessage = err.message || 'Failed to fetch user theme';
        safeSetState(setError, errorMessage);
        safeSetState(setTheme, DEFAULT_THEME);
      }
    } finally {
      if (!signal.aborted) {
        safeSetState(setLoading, false);
        safeSetState(setIsInitialized, true);
      }
    }
  }, [
    isValidUser,
    isValidGroup,
    activeGroup,
    userID,
    activeGroupId,
    getSessionTheme,
    applyThemeToContext,
    safeSetState,
  ]);

  // Update user theme with proper error handling
  const updateUserTheme = useCallback(
    async (themeSettings, options = {}) => {
      const {
        showToast = true,
        successMessage = 'Theme updated successfully',
      } = options;

      // Validation checks
      if (!isValidUser) {
        const errorMessage = 'Invalid user ID for updating theme';
        safeSetState(setError, errorMessage);
        if (showToast) {
          CustomToast({ message: errorMessage, type: 'error' });
        }
        return false;
      }

      if (!activeGroup || !isValidGroup) {
        const errorMessage = 'Invalid group ID for updating theme';
        safeSetState(setError, errorMessage);
        if (showToast) {
          CustomToast({ message: errorMessage, type: 'error' });
        }
        return false;
      }

      if (!themeSettings || typeof themeSettings !== 'object') {
        const errorMessage = 'Invalid theme settings provided';
        safeSetState(setError, errorMessage);
        if (showToast) {
          CustomToast({ message: errorMessage, type: 'error' });
        }
        return false;
      }

      try {
        safeSetState(setLoading, true);
        safeSetState(setError, null);

        const currentThemeData = mapThemeContextToApiFormat();
        const updatedTheme = {
          ...theme,
          ...currentThemeData,
          ...themeSettings,
        };

        const response = await updateUserThemeApi(
          userID,
          activeGroupId,
          theme,
          updatedTheme,
        );

        if (response?.success) {
          safeSetState(setTheme, updatedTheme);
          applyThemeToContext(updatedTheme);

          if (showToast) {
            CustomToast({ message: successMessage, type: 'success' });
          }
          return true;
        }

        throw new Error(response?.message || 'Failed to update theme');
      } catch (err) {
        const errorMessage = err.message || 'Failed to update user theme';
        safeSetState(setError, errorMessage);
        if (showToast) {
          CustomToast({ message: errorMessage, type: 'error' });
        }
        return false;
      } finally {
        safeSetState(setLoading, false);
      }
    },
    [
      isValidUser,
      isValidGroup,
      activeGroup,
      userID,
      activeGroupId,
      theme,
      mapThemeContextToApiFormat,
      applyThemeToContext,
      safeSetState,
    ],
  );

  // Memoized update functions to prevent unnecessary re-renders
  const resetToDefault = useCallback(
    () =>
      updateUserTheme(DEFAULT_THEME, {
        successMessage: 'Theme reset to default successfully',
      }),
    [updateUserTheme],
  );

  const updatePrimaryColor = useCallback(
    (primaryColor) =>
      updateUserTheme(
        { primaryColor },
        { successMessage: 'Primary color updated successfully' },
      ),
    [updateUserTheme],
  );

  const updateThemeMode = useCallback(
    (mode) =>
      updateUserTheme(
        { mode },
        { successMessage: `Theme mode changed to ${mode}` },
      ),
    [updateUserTheme],
  );

  const updateInterfaceStyle = useCallback(
    (interfaceStyle) =>
      updateUserTheme(
        { interfaceStyle },
        { successMessage: `Interface style changed to ${interfaceStyle}` },
      ),
    [updateUserTheme],
  );

  const updateContentLayout = useCallback(
    (contentLayout) =>
      updateUserTheme(
        { contentLayout },
        { successMessage: `Content layout changed to ${contentLayout}` },
      ),
    [updateUserTheme],
  );

  // Effect: Handle theme initialization and group changes
  useEffect(() => {
    const shouldFetchTheme =
      isAuthenticated &&
      isValidUser &&
      isValidGroup &&
      activeGroup &&
      // Only fetch if group has changed or not initialized
      (lastFetchedGroupIdRef.current !== activeGroupId || !isInitialized);

    if (shouldFetchTheme) {
      fetchUserTheme();
    } else if (!isAuthenticated || !isValidUser || !isValidGroup) {
      // Reset to default if user/group is invalid
      safeSetState(setTheme, DEFAULT_THEME);
      safeSetState(setLoading, false);
      safeSetState(setIsInitialized, true);
    }
  }, [
    isAuthenticated,
    isValidUser,
    isValidGroup,
    activeGroup,
    activeGroupId,
    isInitialized,
    fetchUserTheme,
    safeSetState,
  ]);

  // Effect: Listen for force theme refresh events
  useEffect(() => {
    const handleForceThemeRefresh = (event) => {
      if (event.detail?.groupId === activeGroupId) {
        safeSetState(setIsInitialized, false);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('force-theme-refresh', handleForceThemeRefresh);
      return () => {
        window.removeEventListener(
          'force-theme-refresh',
          handleForceThemeRefresh,
        );
      };
    }
  }, [activeGroupId, safeSetState]);

  // Effect: Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Memoized theme-based boolean values
  const themeFlags = useMemo(() => {
    const safeTheme = theme || DEFAULT_THEME;
    return {
      isLight: safeTheme.mode === 'light',
      isDark: safeTheme.mode === 'dark',
      isSystem: safeTheme.mode === 'system',
      isDefault: safeTheme.interfaceStyle === 'default',
      isBordered: safeTheme.interfaceStyle === 'bordered',
      isCompact: safeTheme.contentLayout === 'compact',
      isWide: safeTheme.contentLayout === 'wide',
    };
  }, [theme]);

  // Memoized return object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      theme: theme || DEFAULT_THEME,
      loading,
      error,
      isInitialized,
      fetchUserTheme,
      updateUserTheme,
      resetToDefault,
      updatePrimaryColor,
      updateThemeMode,
      updateInterfaceStyle,
      updateContentLayout,
      ...themeFlags,
    }),
    [
      theme,
      loading,
      error,
      isInitialized,
      fetchUserTheme,
      updateUserTheme,
      resetToDefault,
      updatePrimaryColor,
      updateThemeMode,
      updateInterfaceStyle,
      updateContentLayout,
      themeFlags,
    ],
  );
};

export default useUserTheme;
