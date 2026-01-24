import {
  AqGood,
  AqHazardous,
  AqModerate,
  AqNoValue,
  AqUnhealthy,
  AqUnhealthyForSensitiveGroups,
  AqVeryUnhealthy,
  AqWind01,
} from '@airqo/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { FiMapPin } from 'react-icons/fi';

import {
  AIR_QUALITY_INFO,
  categoryToLevel,
  getAirQualityCategory,
} from '@/utils/airQuality';

import type { DataType, Forecast, Measurement } from '../types';
import { getColorFromPM25, getLocationName, getTextColor } from '../utils';

interface AirQualityDisplayProps {
  dataType: DataType;
  currentMeasurement: Measurement | null;
  forecastData?: { forecasts?: Forecast[] };
}

const AirQualityDisplay = ({
  dataType,
  currentMeasurement,
  forecastData,
}: AirQualityDisplayProps) => {
  const pm25Value = currentMeasurement?.pm2_5?.value;
  const categoryObj =
    pm25Value !== null && pm25Value !== undefined
      ? getAirQualityCategory(pm25Value, 'pm2_5')
      : 'Invalid';
  const level = categoryToLevel(categoryObj);
  let category = 'Unknown';
  if (categoryObj !== 'Invalid') {
    const info = AIR_QUALITY_INFO[level as keyof typeof AIR_QUALITY_INFO];
    category = info?.label || 'Unknown';
  }

  // Get valid forecasts
  const getAirQualityIcon = (
    pm25: number | null,
    size: string = 'w-32 h-32',
  ) => {
    const iconProps = {
      className: size,
    };

    if (pm25 === null || pm25 === undefined) {
      return <AqNoValue {...iconProps} />;
    }

    if (pm25 >= 0 && pm25 <= 9) {
      return <AqGood {...iconProps} />;
    } else if (pm25 > 9 && pm25 <= 35) {
      return <AqModerate {...iconProps} />;
    } else if (pm25 > 35 && pm25 <= 55) {
      return <AqUnhealthyForSensitiveGroups {...iconProps} />;
    } else if (pm25 > 55 && pm25 <= 125) {
      return <AqUnhealthy {...iconProps} />;
    } else if (pm25 > 125 && pm25 <= 225) {
      return <AqVeryUnhealthy {...iconProps} />;
    } else if (pm25 > 225 && pm25 <= 500.5) {
      return <AqHazardous {...iconProps} />;
    } else {
      return <AqNoValue {...iconProps} />;
    }
  };

  const renderForecast = () => {
    if (!forecastData?.forecasts || forecastData.forecasts.length === 0) {
      return null;
    }

    // Only show forecast if we have valid data
    const validForecasts = forecastData.forecasts.filter(
      (f: any) => f.pm2_5 != null && typeof f.pm2_5 === 'number',
    );

    if (validForecasts.length === 0) return null;

    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date().getDay();

    return (
      <div className="flex items-center gap-2 flex-wrap">
        {validForecasts.slice(0, 7).map((forecast: any, index: number) => {
          const dayIndex = (today + index) % 7;
          const isToday = index === 0;

          return (
            <div
              key={index}
              className={`flex flex-col items-center rounded-lg p-2 sm:p-3 min-w-[50px] sm:min-w-[60px] ${
                isToday
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-500/30 text-white backdrop-blur-sm'
              }`}
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              <span className="font-bold text-xs sm:text-sm mb-1">
                {days[dayIndex]}
              </span>
              <span className="text-xs font-medium mb-1 sm:mb-2">
                {forecast.pm2_5?.toFixed(1) || '--'}
              </span>
              <div className="flex-shrink-0">
                {Number.isFinite(forecast.pm2_5) ? (
                  getAirQualityIcon(forecast.pm2_5, 'w-6 h-6 sm:w-8 sm:h-8')
                ) : (
                  <AqNoValue className="w-6 h-6 sm:w-8 sm:h-8" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`data-${currentMeasurement?.site_id}-${currentMeasurement?.time}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col min-h-0"
      >
        {/* Main Content - Using CSS Grid for responsive layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 sm:gap-6 lg:gap-8 min-h-0">
          {/* Left Section */}
          <div className="flex flex-col justify-center space-y-3 sm:space-y-4 lg:space-y-5 min-h-0">
            {/* Air Quality Title */}
            <div
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight tracking-tight"
              style={{
                fontFamily: '"Times New Roman", Times, serif',
              }}
            >
              Air Quality
            </div>

            {/* PM2.5 Header */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-blue-800/50 rounded-full p-1.5 sm:p-2 backdrop-blur-sm">
                <AqWind01 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <span
                className="text-lg sm:text-xl lg:text-2xl font-bold tracking-wide"
                style={{
                  fontFamily: '"Times New Roman", Times, serif',
                }}
              >
                PM2.5
              </span>
            </div>

            {/* Large PM2.5 Value */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <span
                className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-none drop-shadow-lg"
                style={{
                  color:
                    pm25Value !== null && pm25Value !== undefined
                      ? getColorFromPM25(pm25Value)
                      : '#808080',
                  fontFamily: '"Times New Roman", Times, serif',
                }}
              >
                {pm25Value !== null && pm25Value !== undefined
                  ? pm25Value.toFixed(2)
                  : '--'}
              </span>
              <span
                className="text-xl sm:text-2xl lg:text-3xl opacity-90 self-end pb-1 font-medium"
                style={{
                  fontFamily: '"Times New Roman", Times, serif',
                }}
              >
                μg/m³
              </span>
            </div>

            {/* 7-Day Forecast */}
            {forecastData && (
              <div className="mt-2 sm:mt-3">{renderForecast()}</div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex flex-col items-center lg:items-end justify-between space-y-3 sm:space-y-4 lg:space-y-6 min-h-0">
            {/* Large Air Quality Icon */}
            <div className="flex justify-center lg:justify-end flex-1 items-center">
              <div className="transform hover:scale-105 transition-transform duration-300">
                {getAirQualityIcon(
                  pm25Value !== null && pm25Value !== undefined
                    ? pm25Value
                    : null,
                  'w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 xl:w-52 xl:h-52',
                )}
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center lg:items-end gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-semibold tracking-wider">
                SCAN ME
              </span>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white rounded-lg p-1.5 sm:p-2">
                <Image
                  src="/QR/analytics_qrcode.png"
                  alt="QR Code"
                  fill
                  className="object-contain"
                  sizes="112px"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="space-y-2.5 sm:space-y-3 pt-3 sm:pt-4 lg:pt-5 border-t border-white/20 mt-3 sm:mt-4 lg:mt-5">
          {/* Air Quality Status */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div
              className="px-3 py-1 sm:px-4 sm:py-1.5 lg:px-5 lg:py-2 rounded-full font-bold text-xs sm:text-sm shadow-lg"
              style={{
                backgroundColor:
                  pm25Value !== null && pm25Value !== undefined
                    ? getColorFromPM25(pm25Value)
                    : '#808080',
                color:
                  pm25Value !== null && pm25Value !== undefined
                    ? getTextColor(pm25Value)
                    : '#FFFFFF',
                fontFamily: '"Times New Roman", Times, serif',
              }}
            >
              {category}
            </div>
            <span
              className="text-sm sm:text-base lg:text-lg font-medium"
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              Air Quality is {category.toLowerCase()}
            </span>
          </div>

          {/* Location - BIGGER AND MORE VISIBLE */}
          <div className="flex items-center gap-2 sm:gap-3 bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 sm:px-4 sm:py-3">
            <FiMapPin className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white flex-shrink-0" />
            <span
              className="font-bold text-lg sm:text-xl lg:text-2xl xl:text-3xl tracking-wide"
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              {getLocationName(dataType, currentMeasurement) || '--'}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AirQualityDisplay;
