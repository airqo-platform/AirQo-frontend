import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';

/**
 * Hook to initialize theme from cached preferences during login setup
 * This monitors for themes cached during the login setup process and applies them
 * No API calls are made here - all theme fetching happens in loginSetup.js
 */
const useThemeInitialization = () => {
  const { data: session, status } = useSession();
  const { setPrimaryColor, toggleTheme, toggleSkin, setLayout } = useTheme();
  const [isThemeApplied, setIsThemeApplied] = useState(false);

  // Monitor for cached theme and apply it when available
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      const checkForCachedTheme = () => {
        if (typeof window !== 'undefined') {
          try {
            const storedTheme = window.sessionStorage.getItem('userTheme');
            const isLoaded = window.sessionStorage.getItem('userThemeLoaded');

            if (storedTheme && isLoaded === 'true' && !isThemeApplied) {
              const setupTheme = JSON.parse(storedTheme);

              // Debug logging - remove in production
              if (process.env.NODE_ENV === 'development') {
                // Theme application debugging
              }

              // Apply the cached theme immediately to UI
              setPrimaryColor(setupTheme.primaryColor || '#145FFF');
              toggleTheme(setupTheme.mode || 'light');
              toggleSkin(setupTheme.interfaceStyle || 'default');
              setLayout(setupTheme.contentLayout || 'compact');

              // Mark as applied but don't clear the flag yet
              // Let useUserTheme handle the clearing to avoid race conditions
              setIsThemeApplied(true);
            }
          } catch {
            // Error applying cached theme, mark as applied to avoid retrying
            setIsThemeApplied(true);
          }
        }
      };

      // Check immediately
      checkForCachedTheme();

      // Also set up an interval to check for the theme (in case login setup is still running)
      const interval = setInterval(() => {
        if (!isThemeApplied) {
          checkForCachedTheme();
        } else {
          clearInterval(interval);
        }
      }, 100); // Check every 100ms

      // Clean up interval after 10 seconds max
      const timeout = setTimeout(() => {
        clearInterval(interval);
        if (!isThemeApplied) {
          setIsThemeApplied(true); // Give up after 10 seconds
        }
      }, 10000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [
    status,
    session?.user?.id,
    isThemeApplied,
    setPrimaryColor,
    toggleTheme,
    toggleSkin,
    setLayout,
  ]);

  return {
    isThemeApplied,
  };
};

export default useThemeInitialization;
