'use client';

import { useThemeSafe } from '@/common/features/theme-customizer/hooks/useThemeSafe';
import { THEME_MODES } from '@/common/features/theme-customizer/constants/themeConstants';

export default function OrganizationLoading() {
  const { theme, primaryColor, systemTheme } = useThemeSafe();

  // Determine if we're in dark mode
  const isDarkMode =
    theme === THEME_MODES.DARK ||
    (theme === THEME_MODES.SYSTEM && systemTheme === 'dark');

  return (
    <div
      className={`w-full h-screen flex flex-grow justify-center items-center transition-colors duration-300`}
      style={{
        backgroundColor: isDarkMode ? '#1d1f20f0' : '#ffffff',
      }}
    >
      <div className="flex flex-col items-center space-y-4">
        <div
          className="SecondaryMainloader"
          aria-label="Loading"
          style={{
            '--color-primary': primaryColor,
          }}
        ></div>
        <p
          className={`text-sm animate-pulse transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          Loading organization content...
        </p>
      </div>
    </div>
  );
}
