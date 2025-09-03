'use client';

import { useThemeSafe } from '@/common/features/theme-customizer/hooks/useThemeSafe';
import { THEME_MODES } from '@/common/features/theme-customizer/constants/themeConstants';

/**
 * Logout overlay component that shows while user is being logged out
 */
const LogoutOverlay = ({ isVisible, message = 'Logging out...' }) => {
  const { theme, primaryColor, systemTheme } = useThemeSafe();

  // Determine if we're in dark mode
  const isDarkMode =
    theme === THEME_MODES.DARK ||
    (theme === THEME_MODES.SYSTEM && systemTheme === 'dark');

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black bg-opacity-50 flex items-center justify-center min-h-screen">
      <div
        className={`rounded-lg shadow-2xl p-8 max-w-sm w-full mx-4 transform transition-all duration-300 ease-in-out`}
        style={{
          backgroundColor: isDarkMode ? '#1d1f20f0' : '#ffffff',
        }}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div
            className="SecondaryMainloader"
            aria-label="Logging out"
            style={{
              '--color-primary': primaryColor,
            }}
          ></div>
          <div className="space-y-2">
            <p
              className={`text-lg font-medium leading-relaxed transition-colors duration-300 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-700'
              }`}
            >
              {message}
            </p>
            <p
              className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Please wait...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutOverlay;
