import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';

// Constants
const DEFAULT_THEME = {
  primaryColor: '#145FFF',
  mode: 'light',
  interfaceStyle: 'default',
  contentLayout: 'compact',
};

const SESSION_STORAGE_KEYS = {
  THEME: 'userTheme',
  THEME_LOADED: 'userThemeLoaded',
};

const RETRY_CONFIG = {
  maxRetries: 50, // 5 seconds maximum retry time
  retryInterval: 100, // Check every 100ms
  timeoutMs: 5000, // 5 second timeout
};

/**
 * Hook to initialize theme from cached preferences during login setup
 * This monitors for themes cached during the login setup process and applies them
 * No API calls are made here - all theme fetching happens in loginSetup.js
 */
const useThemeInitialization = () => {
  const { data: session, status } = useSession();
  const { setPrimaryColor, toggleTheme, toggleSkin, setLayout } = useTheme();
  const [isThemeApplied, setIsThemeApplied] = useState(false);

  // Refs to prevent memory leaks and stale closures
  const retryCountRef = useRef(0);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const isUnmountedRef = useRef(false);

  // Memoized authentication check
  const isAuthenticated = useMemo(
    () => status === 'authenticated' && session?.user?.id,
    [status, session?.user?.id],
  );

  // Safe state setter to prevent updates after unmount
  const safeSetState = useCallback((setter, value) => {
    if (!isUnmountedRef.current) {
      setter(value);
    }
  }, []);

  // Helper function to safely access session storage
  const getSessionStorageTheme = useCallback(() => {
    if (typeof window === 'undefined') return null;

    try {
      const storedTheme = window.sessionStorage.getItem(
        SESSION_STORAGE_KEYS.THEME,
      );
      const isLoaded = window.sessionStorage.getItem(
        SESSION_STORAGE_KEYS.THEME_LOADED,
      );

      if (storedTheme && isLoaded === 'true') {
        return JSON.parse(storedTheme);
      }
    } catch (error) {
      console.error('Error parsing cached theme:', error);
    }

    return null;
  }, []);

  // Helper function to apply theme to UI
  const applyThemeToUI = useCallback(
    (themeData) => {
      try {
        // Merge with defaults to ensure all properties exist
        const themeToApply = {
          ...DEFAULT_THEME,
          ...themeData,
        };

        // Apply the theme to UI
        setPrimaryColor(themeToApply.primaryColor);
        toggleTheme(themeToApply.mode);
        toggleSkin(themeToApply.interfaceStyle);
        setLayout(themeToApply.contentLayout);

        // Debug logging in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Theme applied successfully:', themeToApply);
        }

        return true;
      } catch (error) {
        console.error('Error applying theme to UI:', error);
        return false;
      }
    },
    [setPrimaryColor, toggleTheme, toggleSkin, setLayout],
  );

  // Main function to check and apply cached theme
  const checkAndApplyCachedTheme = useCallback(() => {
    if (isThemeApplied || isUnmountedRef.current) return false;

    const cachedTheme = getSessionStorageTheme();

    if (cachedTheme) {
      const success = applyThemeToUI(cachedTheme);
      if (success) {
        safeSetState(setIsThemeApplied, true);
        return true;
      }
    }

    return false;
  }, [isThemeApplied, getSessionStorageTheme, applyThemeToUI, safeSetState]);

  // Clear all timers and intervals
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start theme monitoring with proper cleanup
  const startThemeMonitoring = useCallback(() => {
    if (isUnmountedRef.current) return;

    // Clear any existing timers
    clearTimers();

    // Reset retry count
    retryCountRef.current = 0;

    // Check immediately
    if (checkAndApplyCachedTheme()) {
      return; // Theme applied successfully
    }

    // Set up retry mechanism with interval
    intervalRef.current = setInterval(() => {
      if (isUnmountedRef.current) {
        clearTimers();
        return;
      }

      if (retryCountRef.current >= RETRY_CONFIG.maxRetries) {
        clearTimers();
        safeSetState(setIsThemeApplied, true);
        return;
      }

      if (checkAndApplyCachedTheme()) {
        clearTimers();
        return;
      }

      retryCountRef.current++;
    }, RETRY_CONFIG.retryInterval);

    // Set up timeout as backup
    timeoutRef.current = setTimeout(() => {
      clearTimers();
      safeSetState(setIsThemeApplied, true);

      if (process.env.NODE_ENV === 'development') {
        console.warn('Theme initialization timed out');
      }
    }, RETRY_CONFIG.timeoutMs);
  }, [checkAndApplyCachedTheme, clearTimers, safeSetState]);

  // Effect: Monitor for authenticated session and initialize theme
  useEffect(() => {
    if (isAuthenticated && !isThemeApplied) {
      startThemeMonitoring();
    }

    // Cleanup function
    return () => {
      clearTimers();
    };
  }, [isAuthenticated, isThemeApplied, startThemeMonitoring, clearTimers]);

  // Effect: Reset state when user changes (logout/login)
  useEffect(() => {
    if (status === 'loading') return;

    if (!isAuthenticated && isThemeApplied) {
      // Reset state when user logs out
      safeSetState(setIsThemeApplied, false);
      retryCountRef.current = 0;
    }
  }, [isAuthenticated, status, isThemeApplied, safeSetState]);

  // Effect: Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      clearTimers();
    };
  }, [clearTimers]);

  // Memoized return object
  return useMemo(
    () => ({
      isThemeApplied,
      isAuthenticated,
      retryCount: retryCountRef.current,
    }),
    [isThemeApplied, isAuthenticated],
  );
};

export default useThemeInitialization;
