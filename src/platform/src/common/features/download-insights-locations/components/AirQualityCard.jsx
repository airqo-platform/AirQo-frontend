import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { useTheme } from '@/features/theme-customizer/hooks/useTheme';

const AirQualityCard = ({
  // airQuality,
  // pollutionSource,
  pollutant,
  isLoading = false,
}) => {
  const { theme, systemTheme } = useTheme();
  const isDarkMode = useMemo(() => {
    return theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  }, [theme, systemTheme]);

  return (
    <div
      className={`flex flex-col sm:flex-row border ${isDarkMode ? 'border-gray-700' : 'border-gray-200 bg-gray-50'} rounded-lg p-4 shadow-sm space-y-4 sm:space-y-0`}
    >
      {/* Air Quality Section */}
      {/* Uncomment and adjust these sections if needed in your layout */}
      {/*
      <div className="flex-2 sm:pr-4 w-2/4">
        <h3 className="text-xs border-b font-semibold text-gray-500 dark:text-gray-400 pb-1">
          Air Quality
        </h3>
        {isLoading ? (
          <div className="mt-1 h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 animate-pulse"></div>
        ) : (
          <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{airQuality}</p>
        )}
      </div>
      */}

      {/* Pollution Source Section */}
      {/*
      <div className="flex-1 sm:px-4">
        <h3 className="text-xs border-b font-semibold text-gray-500 dark:text-gray-400 pb-1">
          Pollution Source
        </h3>
        {isLoading ? (
          <div className="mt-1 h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 animate-pulse"></div>
        ) : (
          <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{pollutionSource}</p>
        )}
      </div>
      */}

      {/* Pollutant Section */}
      <div className="flex-1 sm:pl-4">
        <h3 className="text-xs border-b font-semibold text-gray-500 dark:text-gray-400 pb-1">
          Pollutant
        </h3>
        {isLoading ? (
          <div className="mt-1 h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 animate-pulse"></div>
        ) : (
          <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">
            {pollutant}
          </p>
        )}
      </div>
    </div>
  );
};

AirQualityCard.propTypes = {
  airQuality: PropTypes.string.isRequired,
  pollutionSource: PropTypes.string.isRequired,
  pollutant: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
};

export default AirQualityCard;
