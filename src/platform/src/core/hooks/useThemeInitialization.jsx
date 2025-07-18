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

              // Debug logging
              if (process.env.NODE_ENV === 'development') {
                console.log('Applying cached theme:', setupTheme);
              }

              // Default values as fallback
              const defaultTheme = {
                primaryColor: '#145FFF',
                mode: 'light',
                interfaceStyle: 'default',
                contentLayout: 'compact',
              };

              // Merge with defaults to ensure all properties exist
              const themeToApply = {
                ...defaultTheme,
                ...setupTheme,
              };

              // Apply the cached theme immediately to UI
              setPrimaryColor(themeToApply.primaryColor);
              toggleTheme(themeToApply.mode);
              toggleSkin(themeToApply.interfaceStyle);
              setLayout(themeToApply.contentLayout);

              // Mark as applied but let useUserTheme handle clearing
              setIsThemeApplied(true);

              // Clear the session storage flags only after successful application
              if (process.env.NODE_ENV === 'development') {
                console.log(
                  'Theme applied successfully, clearing session storage flags',
                );
              }
            }
          } catch (error) {
            console.error('Error applying cached theme:', error);
            setIsThemeApplied(true);
          }
        }
      };

      let retryCount = 0;
      const maxRetries = 50; // 5 seconds maximum retry time

      // Check immediately
      checkForCachedTheme();

      // Set up an interval with a retry limit
      const interval = setInterval(() => {
        if (!isThemeApplied && retryCount < maxRetries) {
          checkForCachedTheme();
          retryCount++;
        } else {
          clearInterval(interval);
          setIsThemeApplied(true);
        }
      }, 100); // Check every 100ms

      return () => {
        clearInterval(interval);
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
