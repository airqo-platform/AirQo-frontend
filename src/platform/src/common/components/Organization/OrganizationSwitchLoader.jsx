'use client';

import React from 'react';
import { useThemeSafe } from '@/common/features/theme-customizer/hooks/useThemeSafe';
import { THEME_MODES } from '@/common/features/theme-customizer/constants/themeConstants';

/**
 * Organization Switch Loader Component
 * Shows a loading overlay when switching between organizations
 * Provides immediate feedback to users during organization transitions
 */
const OrganizationSwitchLoader = ({
  organizationName,
  primaryColor = '#135DFF',
}) => {
  const { theme, systemTheme } = useThemeSafe();

  // Determine if we're in dark mode
  const isDarkMode =
    theme === THEME_MODES.DARK ||
    (theme === THEME_MODES.SYSTEM && systemTheme === 'dark');

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col justify-center items-center transition-colors duration-300`}
      style={{
        backgroundColor: isDarkMode
          ? 'rgba(29, 31, 32, 0.95)'
          : 'rgba(255, 255, 255, 0.95)',
      }}
    >
      <div className="flex flex-col items-center space-y-6 max-w-md mx-auto px-6">
        {/* Animated Logo/Spinner */}
        <div
          className="SecondaryMainloader"
          aria-label="Switching organization"
          style={{
            '--color-primary': primaryColor,
          }}
        ></div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h3
            className={`text-lg uppercase font-semibold transition-colors duration-300 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}
          >
            {organizationName}
          </h3>
          <p
            className={`text-sm animate-pulse transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Loading organization content...
          </p>
        </div>

        {/* Progress Dots */}
        {/* <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                backgroundColor: primaryColor,
                animationDelay: `${i * 0.3}s`,
                animationDuration: '1.5s',
              }}
            />
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default OrganizationSwitchLoader;
