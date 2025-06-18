import { useState, useCallback } from 'react';
import { getUserThemeApi, updateUserThemeApi } from '@/core/apis/Account';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
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
 */
const useUserTheme = () => {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const { id: activeGroupId, userID } = useGetActiveGroup();

  /**
   * Get the appropriate tenant based on active group
   * Falls back to 'airqo' if no valid group is found
   */
  const getTenant = useCallback(() => {
    if (activeGroupId && isValidObjectId(activeGroupId)) {
      // You can add logic here to map group IDs to tenant names if needed
      // For now, we'll use the group name or default to 'airqo'
      return 'airqo'; // Can be enhanced to return actual tenant based on group
    }
    return 'airqo';
  }, [activeGroupId]);
  /**
   * Fetch user theme preferences from the API
   */
  const fetchUserTheme = useCallback(async () => {
    if (!userID || !isValidObjectId(userID)) {
      // eslint-disable-next-line no-console
      console.warn('Invalid or missing user ID for fetching theme');
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
        const tenant = getTenant();
        const response = await getUserThemeApi(userID, tenant);

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
  }, [userID, getTenant]);

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
        setError(null);

        // Merge with current theme to ensure all required fields are present
        const updatedTheme = {
          ...theme,
          ...themeSettings,
        };

        const tenant = getTenant();
        const response = await updateUserThemeApi(
          userID,
          theme,
          updatedTheme,
          tenant,
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
    [userID, theme, getTenant],
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
  // NOTE: Automatic theme fetching is disabled since theme is loaded during login setup
  // If you need to manually fetch theme, call fetchUserTheme() explicitly
  // useEffect(() => {
  //   if (
  //     status === 'authenticated' &&
  //     session?.user?.id &&
  //     userID &&
  //     !isInitialized
  //   ) {
  //     fetchUserTheme();
  //   }
  // }, [userID, isInitialized, fetchUserTheme, status, session?.user?.id]);

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
