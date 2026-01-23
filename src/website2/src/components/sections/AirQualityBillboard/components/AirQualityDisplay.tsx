import {
  AqGood,
  AqHazardous,
  AqModem02,
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

// Circular Progress Loader Component
const CircularProgressLoader = () => {
  return (
    <div className="relative w-12 h-12">
      {/* Background circle */}
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
        />
        {/* Progress circle */}
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#00D4FF"
          strokeWidth="2"
          strokeDasharray="100, 100"
          className="animate-circular-progress"
          style={{
            strokeDashoffset: '100',
          }}
        />
      </svg>
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
      </div>
    </div>
  );
};

const AirQualityDisplay = ({
  dataType,
  currentMeasurement,
  forecastData,
}: AirQualityDisplayProps) => {
  const pm25Value = currentMeasurement?.pm2_5?.value;
  const categoryObj = pm25Value
    ? getAirQualityCategory(pm25Value, 'pm2_5')
    : 'Invalid';
  const level = categoryToLevel(categoryObj);
  let category = 'Unknown';
  if (categoryObj !== 'Invalid') {
    const info = AIR_QUALITY_INFO[level as keyof typeof AIR_QUALITY_INFO];
    category = info?.label || 'Unknown';
  }

  const getAirQualityIcon = (pm25: number, size: string = 'w-32 h-32') => {
    const iconProps = {
      className: size,
    };

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
              className={`flex flex-col items-center rounded-lg p-3 min-w-[60px] sm:min-w-[70px] ${
                isToday
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-500/30 text-white backdrop-blur-sm'
              }`}
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              <span className="font-bold text-sm sm:text-base mb-1">
                {days[dayIndex]}
              </span>
              <span className="text-xs sm:text-sm font-medium mb-2">
                {forecast.pm2_5?.toFixed(2) || '--'}
              </span>
              <div className="flex-shrink-0">
                {Number.isFinite(forecast.pm2_5) ? (
                  getAirQualityIcon(forecast.pm2_5, 'w-8 h-8 sm:w-10 sm:h-10')
                ) : (
                  <AqNoValue className="w-8 h-8 sm:w-10 sm:h-10" />
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
        className="relative z-10"
      >
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-8">
          {/* Left Section */}
          <div className="space-y-6">
            {/* PM2.5 Header */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-800/50 rounded-full p-2 sm:p-3">
                <AqWind01 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <span
                className="text-2xl sm:text-3xl font-bold"
                style={{
                  fontFamily: '"Times New Roman", Times, serif',
                }}
              >
                PM2.5
              </span>
            </div>

            {/* Large PM2.5 Value */}
            <div className="flex items-baseline gap-3">
              <span
                className="text-7xl sm:text-8xl md:text-9xl font-bold leading-none"
                style={{
                  color: pm25Value ? getColorFromPM25(pm25Value) : '#808080',
                  fontFamily: '"Times New Roman", Times, serif',
                }}
              >
                {pm25Value?.toFixed(2) ?? '--'}
              </span>
              <span
                className="text-2xl sm:text-3xl opacity-90 mb-2"
                style={{
                  fontFamily: '"Times New Roman", Times, serif',
                }}
              >
                μg/m³
              </span>
            </div>

            {/* 7-Day Forecast */}
            {forecastData && <div className="mt-8">{renderForecast()}</div>}
          </div>

          {/* Right Section */}
          <div className="flex flex-col items-start lg:items-end justify-between space-y-6 lg:space-y-8">
            {/* Large Air Quality Icon */}
            <div className="w-full flex justify-center lg:justify-end">
              <div className="transform hover:scale-105 transition-transform duration-300">
                {Number.isFinite(pm25Value) && pm25Value !== null ? (
                  getAirQualityIcon(
                    pm25Value as number,
                    'w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56',
                  )
                ) : (
                  <AqNoValue className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 opacity-50" />
                )}
              </div>
            </div>

            {/* QR Code */}
            <div className="w-full flex flex-col items-center lg:items-end gap-2">
              <span className="text-sm sm:text-base font-semibold tracking-wider">
                SCAN ME
              </span>
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-lg p-2">
                <Image
                  src="/QR/analytics_qrcode.png"
                  alt="QR Code"
                  fill
                  className="object-contain"
                  sizes="160px"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="space-y-4 pt-6 border-t border-white/20">
          {/* Air Quality Status */}
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`px-5 py-2 rounded-full font-bold text-sm sm:text-base shadow-lg`}
              style={{
                backgroundColor:
                  Number.isFinite(pm25Value) && pm25Value !== null
                    ? getColorFromPM25(pm25Value as number)
                    : '#808080',
                color:
                  Number.isFinite(pm25Value) && pm25Value !== null
                    ? getTextColor(pm25Value as number)
                    : '#FFFFFF',
                fontFamily: '"Times New Roman", Times, serif',
              }}
            >
              {category}
            </div>
            <span
              className="text-lg sm:text-xl font-medium"
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              Air Quality is {category.toLowerCase()}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            {dataType === 'cohort' ? (
              <AqModem02 className="w-5 h-5 sm:w-6 sm:h-6 text-white/90 flex-shrink-0" />
            ) : (
              <FiMapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white/90 flex-shrink-0" />
            )}
            <span
              className="font-medium text-sm sm:text-base"
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              {getLocationName(dataType, currentMeasurement)}
            </span>
          </div>

          {/* Last Updated */}
          <div
            className="text-xs sm:text-sm text-white/70"
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            Last updated:{' '}
            {currentMeasurement?.time
              ? new Date(currentMeasurement.time).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Unknown'}
          </div>
        </div>

        {/* Circular Progress Loader - Bottom Right */}
        <div className="absolute bottom-4 right-4 z-20">
          <CircularProgressLoader />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AirQualityDisplay;
