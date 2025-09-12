'use client';

import { useThemeSafe } from '@/common/features/theme-customizer/hooks/useThemeSafe';
import { THEME_MODES } from '@/common/features/theme-customizer/constants/themeConstants';
import { useEffect, useState } from 'react';

export default function Loading() {
  const { theme, primaryColor, systemTheme } = useThemeSafe();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine if we're in dark mode
  const isDarkMode =
    theme === THEME_MODES.DARK ||
    (theme === THEME_MODES.SYSTEM && systemTheme === 'dark');

  // Use consistent styles to prevent hydration mismatch
  const loadingStyles = {
    backgroundColor: mounted
      ? isDarkMode
        ? '#1d1f20f0'
        : '#ffffff'
      : '#ffffff',
    pointerEvents: 'none',
  };

  return (
    <div
      className="w-full h-screen flex flex-grow justify-center items-center transition-colors duration-300"
      style={loadingStyles}
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
            mounted && isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          Loading...
        </p>
      </div>
    </div>
  );
}
