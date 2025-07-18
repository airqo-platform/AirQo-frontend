'use client';

import { useState, useCallback, useEffect } from 'react';
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

/**
 * Custom hook to manage user theme preferences
 * Handles theme fetching and updating with proper error handling
 */
const useUserTheme = () => {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { userID, id: activeGroupId, activeGroup } = useGetActiveGroup();

  // Get current theme context values and methods
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
  const { status } = useSession();

  const mapThemeContextToApiFormat = useCallback(() => {
    // Prefer the current theme context values, but fall back to theme state if needed
    const themeData = {
      primaryColor:
        currentPrimaryColor || theme.primaryColor || DEFAULT_THEME.primaryColor,
      mode: currentThemeMode || theme.mode || DEFAULT_THEME.mode,
      interfaceStyle:
        currentSkin || theme.interfaceStyle || DEFAULT_THEME.interfaceStyle,
      contentLayout:
        currentLayout || theme.contentLayout || DEFAULT_THEME.contentLayout,
    };
    return themeData;
  }, [
    currentPrimaryColor,
    currentThemeMode,
    currentSkin,
    currentLayout,
    theme,
  ]);

  const fetchUserTheme = useCallback(async () => {
    if (!userID || !isValidObjectId(userID)) {
      setError('Invalid or missing user ID for fetching theme');
      setIsInitialized(true);
      setLoading(false);
      return;
    }

    if (!activeGroupId || !isValidObjectId(activeGroupId)) {
      setError('Invalid or missing group ID for fetching theme');
      setIsInitialized(true);
      setLoading(false);
      return;
    }

    if (!activeGroup) {
      setError('Active group data is not available');
      setIsInitialized(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let setupTheme = null;
      if (typeof window !== 'undefined') {
        const storedTheme = window.sessionStorage.getItem('userTheme');
        const isLoaded = window.sessionStorage.getItem('userThemeLoaded');
        if (storedTheme && isLoaded === 'true') {
          setupTheme = JSON.parse(storedTheme);
          window.sessionStorage.removeItem('userThemeLoaded');
        }
      }

      if (setupTheme) {
        const newTheme = { ...DEFAULT_THEME, ...setupTheme };
        setTheme(newTheme);
        // Update theme context
        setPrimaryColor(newTheme.primaryColor);
        toggleTheme(newTheme.mode);
        toggleSkin(newTheme.interfaceStyle);
        setLayout(newTheme.contentLayout);
      } else {
        const response = await getUserThemeApi(userID, activeGroupId);
        const newTheme =
          response?.success && response?.data
            ? { ...DEFAULT_THEME, ...response.data }
            : DEFAULT_THEME;
        setTheme(newTheme);
        // Update theme context
        setPrimaryColor(newTheme.primaryColor);
        toggleTheme(newTheme.mode);
        toggleSkin(newTheme.interfaceStyle);
        setLayout(newTheme.contentLayout);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch user theme');
      setTheme(DEFAULT_THEME);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [
    userID,
    activeGroupId,
    activeGroup,
    setPrimaryColor,
    toggleTheme,
    toggleSkin,
    setLayout,
  ]);

  const updateUserTheme = useCallback(
    async (themeSettings, options = {}) => {
      const {
        showToast = true,
        successMessage = 'Theme updated successfully',
      } = options;

      if (!userID || !isValidObjectId(userID)) {
        const errorMessage = 'Invalid user ID for updating theme';
        setError(errorMessage);
        if (showToast) {
          CustomToast({ message: errorMessage, type: 'error' });
        }
        return false;
      }

      if (!activeGroup || !activeGroupId || !isValidObjectId(activeGroupId)) {
        const errorMessage = 'Invalid group ID for updating theme';
        setError(errorMessage);
        if (showToast) {
          CustomToast({ message: errorMessage, type: 'error' });
        }
        return false;
      }

      if (!themeSettings || typeof themeSettings !== 'object') {
        const errorMessage = 'Invalid theme settings provided';
        setError(errorMessage);
        if (showToast) {
          CustomToast({ message: errorMessage, type: 'error' });
        }
        return false;
      }

      try {
        setLoading(true);
        setError(null);

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
          setTheme(updatedTheme);
          // Also update theme context
          setPrimaryColor(updatedTheme.primaryColor);
          toggleTheme(updatedTheme.mode);
          toggleSkin(updatedTheme.interfaceStyle);
          setLayout(updatedTheme.contentLayout);

          if (showToast) {
            CustomToast({ message: successMessage, type: 'success' });
          }
          return true;
        }

        throw new Error(response?.message || 'Failed to update theme');
      } catch (err) {
        const errorMessage = err.message || 'Failed to update user theme';
        setError(errorMessage);
        if (showToast) {
          CustomToast({ message: errorMessage, type: 'error' });
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      userID,
      activeGroupId,
      activeGroup,
      theme,
      mapThemeContextToApiFormat,
      setPrimaryColor,
      toggleTheme,
      toggleSkin,
      setLayout,
    ],
  );

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
        {
          successMessage: 'Primary color updated successfully',
        },
      ),
    [updateUserTheme],
  );

  const updateThemeMode = useCallback(
    (mode) =>
      updateUserTheme(
        { mode },
        {
          successMessage: `Theme mode changed to ${mode}`,
        },
      ),
    [updateUserTheme],
  );

  const updateInterfaceStyle = useCallback(
    (interfaceStyle) =>
      updateUserTheme(
        { interfaceStyle },
        {
          successMessage: `Interface style changed to ${interfaceStyle}`,
        },
      ),
    [updateUserTheme],
  );

  const updateContentLayout = useCallback(
    (contentLayout) =>
      updateUserTheme(
        { contentLayout },
        {
          successMessage: `Content layout changed to ${contentLayout}`,
        },
      ),
    [updateUserTheme],
  );

  // Effect: Handle theme cleanup and reinitialization on group change
  useEffect(() => {
    let isSubscribed = true;

    const handleGroupChange = async () => {
      if (!isSubscribed) return;

      // Set loading state before clearing theme
      setLoading(true);
      setIsInitialized(false);

      // Preserve current theme during transition instead of resetting to default
      // This prevents visual "flash" of default theme

      // Check if we need to fetch new theme
      const shouldFetchTheme =
        status === 'authenticated' &&
        userID &&
        activeGroupId &&
        activeGroup &&
        isValidObjectId(userID) &&
        isValidObjectId(activeGroupId);

      if (shouldFetchTheme) {
        // Force a refetch of theme for new group
        await fetchUserTheme();
      } else {
        // If we shouldn't fetch, reset to default and end loading
        setTheme(DEFAULT_THEME);
        setLoading(false);
      }
    };

    if (activeGroupId && isValidObjectId(activeGroupId)) {
      handleGroupChange();
    }

    return () => {
      isSubscribed = false;
    };
  }, [status, userID, activeGroupId, activeGroup, fetchUserTheme]);

  // Effect: Listen for force theme refresh events
  useEffect(() => {
    const handleForceThemeRefresh = (event) => {
      if (event.detail?.groupId === activeGroupId) {
        setIsInitialized(false);
      }
    };

    window.addEventListener('force-theme-refresh', handleForceThemeRefresh);
    return () => {
      window.removeEventListener(
        'force-theme-refresh',
        handleForceThemeRefresh,
      );
    };
  }, [activeGroupId]);

  // Effect: Apply theme values on initial load or when organization theme changes
  useEffect(() => {
    if (!theme) return;

    // Apply theme values to context
    setPrimaryColor(theme.primaryColor);
    toggleTheme(theme.mode);
    toggleSkin(theme.interfaceStyle);
    setLayout(theme.contentLayout);
  }, [theme, setPrimaryColor, toggleTheme, toggleSkin, setLayout]);

  const safeTheme = theme || DEFAULT_THEME;

  return {
    theme: safeTheme,
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
    isLight: safeTheme.mode === 'light',
    isDark: safeTheme.mode === 'dark',
    isSystem: safeTheme.mode === 'system',
    isDefault: safeTheme.interfaceStyle === 'default',
    isBordered: safeTheme.interfaceStyle === 'bordered',
    isCompact: safeTheme.contentLayout === 'compact',
    isWide: safeTheme.contentLayout === 'wide',
  };
};

export default useUserTheme;
