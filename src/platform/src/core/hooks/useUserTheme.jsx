import { useState, useCallback, useEffect } from 'react';
import { getUserThemeApi, updateUserThemeApi } from '@/core/apis/Account';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import { useSession } from 'next-auth/react';
import CustomToast from '@/components/Toast/CustomToast';

/**
 * Validates MongoDB ObjectId format
 * @param {string} id - The id to validate
 * @returns {boolean} - Whether the id is valid
 */
const isValidObjectId = (id) => {
  return id && /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Default theme settings
 */
const DEFAULT_THEME = {
  primaryColor: '#145FFF',
  mode: 'light',
  interfaceStyle: 'default',
  contentLayout: 'compact',
};

/**
 * Custom hook to manage user theme preferences
 * Handles fetching and updating theme settings with proper error handling and validation
 *
 * IMPORTANT FIX: This hook now correctly synchronizes with the theme context to ensure
 * that API payloads reflect the current UI state. Previously, when users changed theme
 * settings through the UI (e.g., switching from dark to light mode), the changes were
 * applied to the theme context but this hook's local state wasn't updated. This caused
 * API calls to send outdated values instead of the current UI values.
 *
 * The fix ensures that:
 * 1. Current theme context values are always retrieved when making API calls
 * 2. The payload includes the actual current mode, primaryColor, interfaceStyle, and contentLayout
 * 3. Debug logging helps troubleshoot any future theme synchronization issues
 */
const useUserTheme = () => {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { userID, id: activeGroupId, activeGroup } = useGetActiveGroup();

  // Get current theme context values to ensure API payload reflects current UI state
  const {
    theme: currentThemeMode,
    primaryColor: currentPrimaryColor,
    skin: currentSkin,
    layout: currentLayout,
  } = useTheme();
  const { status } = useSession();

  /**
   * Helper function to map theme context values to API format
   */
  const mapThemeContextToApiFormat = useCallback(() => {
    const apiFormat = {
      primaryColor: currentPrimaryColor || DEFAULT_THEME.primaryColor,
      mode: currentThemeMode || DEFAULT_THEME.mode,
      interfaceStyle: currentSkin || DEFAULT_THEME.interfaceStyle,
      contentLayout: currentLayout || DEFAULT_THEME.contentLayout,
    };

    return apiFormat;
  }, [currentPrimaryColor, currentThemeMode, currentSkin, currentLayout]);

  /**
   * Fetch user theme preferences from the API
   */
  const fetchUserTheme = useCallback(async () => {
    if (!userID || !isValidObjectId(userID)) {
      // eslint-disable-next-line no-console
      console.warn('Invalid or missing user ID for fetching theme');
      setError('Invalid or missing user ID for fetching theme');
      setIsInitialized(true);
      return;
    }

    if (!activeGroupId || !isValidObjectId(activeGroupId)) {
      // eslint-disable-next-line no-console
      console.warn('Invalid or missing group ID for fetching theme');
      setError('Invalid or missing group ID for fetching theme');
      setIsInitialized(true);
      return;
    }

    if (!activeGroup) {
      // eslint-disable-next-line no-console
      console.warn('Active group data is not available');
      setError('Active group data is not available');
      setIsInitialized(true);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // First check if theme was already loaded during login setup
      let setupTheme = null;
      if (typeof window !== 'undefined') {
        try {
          const storedTheme = window.sessionStorage.getItem('userTheme');
          const isLoaded = window.sessionStorage.getItem('userThemeLoaded');
          if (storedTheme && isLoaded === 'true') {
            setupTheme = JSON.parse(storedTheme);
            // Clear the setup flag so normal fetching can happen on subsequent loads
            window.sessionStorage.removeItem('userThemeLoaded');
          }
        } catch {
          // Ignore storage errors
        }
      }

      if (setupTheme) {
        // Use the theme that was loaded during setup
        const userTheme = {
          ...DEFAULT_THEME,
          ...setupTheme,
        };
        setTheme(userTheme);
      } else {
        // Fallback to normal API fetch
        const response = await getUserThemeApi(userID, activeGroupId);

        if (response?.success && response?.data) {
          // Merge with default theme to ensure all properties are present
          const userTheme = {
            ...DEFAULT_THEME,
            ...response.data,
          };
          setTheme(userTheme);
        } else {
          // Use default theme if no user theme is found
          setTheme(DEFAULT_THEME);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch user theme');
      // Use default theme on error
      setTheme(DEFAULT_THEME);
      // eslint-disable-next-line no-console
      console.warn('Failed to fetch user theme:', err.message);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [userID, activeGroupId, activeGroup]);

  /**
   * Update user theme preferences
   * @param {Object} themeSettings - New theme settings
   * @param {Object} options - Update options
   * @param {boolean} options.showToast - Whether to show success/error toast
   * @param {string} options.successMessage - Custom success message
   */
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
          CustomToast({
            message: errorMessage,
            type: 'error',
          });
        }
        return false;
      }

      if (!activeGroup || !activeGroupId || !isValidObjectId(activeGroupId)) {
        const errorMessage = 'Invalid group ID for updating theme';
        setError(errorMessage);
        if (showToast) {
          CustomToast({
            message: errorMessage,
            type: 'error',
          });
        }
        return false;
      }

      if (!themeSettings || typeof themeSettings !== 'object') {
        const errorMessage = 'Invalid theme settings provided';
        setError(errorMessage);
        if (showToast) {
          CustomToast({
            message: errorMessage,
            type: 'error',
          });
        }
        return false;
      }

      try {
        setLoading(true);
        setError(null); // Get current theme values from theme context to ensure API payload reflects current UI state
        const currentThemeData = mapThemeContextToApiFormat();

        // Merge current context values with the saved theme state and new theme settings
        // Priority: themeSettings > currentThemeData > theme (saved state)
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
          // Update local state
          setTheme(updatedTheme);

          if (showToast) {
            CustomToast({
              message: successMessage,
              type: 'success',
            });
          }

          return true;
        } else {
          throw new Error(response?.message || 'Failed to update theme');
        }
      } catch (err) {
        const errorMessage = err.message || 'Failed to update user theme';
        setError(errorMessage);

        if (showToast) {
          CustomToast({
            message: errorMessage,
            type: 'error',
          });
        }

        // eslint-disable-next-line no-console
        console.error('Failed to update user theme:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [userID, activeGroupId, activeGroup, theme, mapThemeContextToApiFormat],
  );

  /**
   * Reset theme to default values
   */
  const resetToDefault = useCallback(() => {
    return updateUserTheme(DEFAULT_THEME, {
      successMessage: 'Theme reset to default successfully',
    });
  }, [updateUserTheme]);

  /**
   * Update only the primary color
   * @param {string} primaryColor - New primary color in hex format
   */
  const updatePrimaryColor = useCallback(
    (primaryColor) => {
      return updateUserTheme(
        { primaryColor },
        {
          successMessage: 'Primary color updated successfully',
        },
      );
    },
    [updateUserTheme],
  );

  /**
   * Update only the theme mode
   * @param {string} mode - New theme mode ('light', 'dark', 'system')
   */
  const updateThemeMode = useCallback(
    (mode) => {
      return updateUserTheme(
        { mode },
        {
          successMessage: `Theme mode changed to ${mode}`,
        },
      );
    },
    [updateUserTheme],
  );

  /**
   * Update only the interface style
   * @param {string} interfaceStyle - New interface style ('default', 'bordered')
   */
  const updateInterfaceStyle = useCallback(
    (interfaceStyle) => {
      return updateUserTheme(
        { interfaceStyle },
        {
          successMessage: `Interface style changed to ${interfaceStyle}`,
        },
      );
    },
    [updateUserTheme],
  );

  /**
   * Update only the content layout
   * @param {string} contentLayout - New content layout ('compact', 'wide')
   */
  const updateContentLayout = useCallback(
    (contentLayout) => {
      return updateUserTheme(
        { contentLayout },
        {
          successMessage: `Content layout changed to ${contentLayout}`,
        },
      );
    },
    [updateUserTheme],
  );
  // Effect for theme fetching: handles initial load and group changes
  useEffect(() => {
    // Reset state when group changes
    if (activeGroupId) {
      setIsInitialized(false);
    }
  }, [activeGroupId]);

  // Effect for theme fetching
  useEffect(() => {
    const shouldFetchTheme =
      status === 'authenticated' &&
      userID &&
      activeGroupId &&
      isValidObjectId(userID) &&
      isValidObjectId(activeGroupId) &&
      !isInitialized;

    if (shouldFetchTheme) {
      // eslint-disable-next-line no-console
      console.debug('Fetching theme for group:', activeGroupId);
      fetchUserTheme();
    }
  }, [status, userID, activeGroupId, isInitialized, fetchUserTheme]);

  return {
    // Theme state
    theme,
    loading,
    error,
    isInitialized,

    // Actions
    fetchUserTheme,
    updateUserTheme,
    resetToDefault,

    // Convenience methods for specific updates
    updatePrimaryColor,
    updateThemeMode,
    updateInterfaceStyle,
    updateContentLayout,

    // Helper properties
    isLight: theme.mode === 'light',
    isDark: theme.mode === 'dark',
    isSystem: theme.mode === 'system',
    isDefault: theme.interfaceStyle === 'default',
    isBordered: theme.interfaceStyle === 'bordered',
    isCompact: theme.contentLayout === 'compact',
    isWide: theme.contentLayout === 'wide',
  };
};

export default useUserTheme;
