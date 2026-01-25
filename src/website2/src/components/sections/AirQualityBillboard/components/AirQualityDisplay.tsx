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
import { getColorFromPM25, getLocationName, hexToRgba } from '../utils';

interface AirQualityDisplayProps {
  dataType: DataType;
  currentMeasurement: Measurement | null;
  forecastData?: { forecasts?: Forecast[] };
  homepage?: boolean;
}

const AirQualityDisplay = ({
  dataType,
  currentMeasurement,
  forecastData,
  homepage = false,
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

    // Use a larger, more flexible layout for the standalone billboard (non-homepage)
    const isCompact = homepage === true;
    const gridTemplate = isCompact
      ? 'grid grid-cols-[repeat(auto-fit,minmax(90px,1fr))] gap-1 sm:gap-2 md:gap-3'
      : 'grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2 sm:gap-3 md:gap-4 lg:gap-6';

    return (
      <div className="w-full">
        <div className={gridTemplate}>
          {validForecasts.slice(0, 7).map((forecast: any, index: number) => {
            const dayIndex = (today + index) % 7;
            const isToday = index === 0;
            const cardBg = isToday
              ? 'bg-blue-700/80 text-white'
              : 'bg-blue-600/25 text-white';

            // Larger sizes for standalone billboard
            const cardPadding = isCompact ? 'p-1 sm:p-2' : 'p-3 sm:p-4 lg:p-5';
            const minH = isCompact
              ? 'min-h-[80px] sm:min-h-[88px]'
              : 'min-h-[110px] sm:min-h-[120px] lg:min-h-[140px]';
            const dayClass = isCompact
              ? 'font-semibold text-sm sm:text-base'
              : 'font-semibold text-base sm:text-lg';
            const valueClass = isCompact
              ? 'text-sm sm:text-base font-bold mb-1'
              : 'text-lg sm:text-2xl font-extrabold mb-2';

            // Icon sizing that scales with viewport (clamp) for very large billboards
            const iconWrapperStyle = isCompact
              ? undefined
              : {
                  width: 'clamp(48px, 4.5vw, 96px)',
                  height: 'clamp(48px, 4.5vw, 96px)',
                };

            return (
              <div
                key={index}
                role="group"
                aria-label={`Forecast ${index + 1}`}
                className={`${cardBg} rounded-lg ${cardPadding} flex flex-col items-center justify-between ${minH}`}
                style={{ fontFamily: '"Times New Roman", Times, serif' }}
              >
                <div className="w-full flex items-center justify-center">
                  <span className={`${dayClass} tracking-wider`}>
                    {days[dayIndex]}
                  </span>
                </div>

                <div className="w-full flex flex-col items-center">
                  <span className={valueClass}>
                    {Number.isFinite(forecast.pm2_5)
                      ? forecast.pm2_5.toFixed(2)
                      : '--'}
                  </span>
                  <div className="flex-shrink-0" style={iconWrapperStyle}>
                    {Number.isFinite(forecast.pm2_5) ? (
                      <div style={{ width: '100%', height: '100%' }}>
                        {getAirQualityIcon(forecast.pm2_5, 'w-full h-full')}
                      </div>
                    ) : (
                      <div style={{ width: '100%', height: '100%' }}>
                        <AqNoValue className="w-full h-full" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
        className="relative flex-1 flex flex-col min-h-0"
      >
        {/* Main Content - Using CSS Grid for responsive layout */}
        <div
          className={
            homepage
              ? 'flex-1 grid grid-cols-[1fr_110px] sm:grid-cols-[1.3fr_1fr] gap-3 sm:gap-6 min-h-auto'
              : 'flex-1 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 sm:gap-6 lg:gap-8 min-h-0'
          }
        >
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

            {/* 7-Day Forecast - show on non-homepage everywhere, and on homepage only from md+ */}
            {forecastData &&
              (homepage ? (
                <div className="mt-2 sm:mt-3 hidden md:block">
                  {renderForecast()}
                </div>
              ) : (
                <div className="mt-2 sm:mt-3">{renderForecast()}</div>
              ))}
          </div>

          {/* Right Section */}
          <div
            className={
              homepage
                ? 'flex flex-col items-end justify-between space-y-2 min-h-auto w-full'
                : 'flex flex-col items-center lg:items-end justify-between space-y-3 sm:space-y-4 lg:space-y-6 min-h-0'
            }
            aria-hidden={homepage ? 'false' : 'false'}
          >
            {/* Large Air Quality Icon */}
            <div className="w-full flex flex-col">
              {/* On md+ screens show AQI icon aligned to the right; QR will be absolutely positioned above the divider */}
              <div
                className={
                  homepage
                    ? 'w-full hidden md:flex items-center justify-end pr-2'
                    : 'w-full flex items-center justify-end gap-4 pr-2'
                }
              >
                {/* AQI Icon */}
                <div
                  className={
                    homepage
                      ? 'transform transition-transform duration-300'
                      : 'transform hover:scale-105 transition-transform duration-300'
                  }
                >
                  {getAirQualityIcon(
                    pm25Value !== null && pm25Value !== undefined
                      ? pm25Value
                      : null,
                    homepage
                      ? 'w-12 h-12 sm:w-28 sm:h-28'
                      : 'w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 xl:w-52 xl:h-52',
                  )}
                </div>
              </div>

              {/* For small screens show icon then QR stacked (or hide QR on small homepage) */}
              <div className="w-full flex md:hidden flex-col items-end">
                <div
                  className={
                    homepage
                      ? 'transform transition-transform duration-300'
                      : 'transform hover:scale-105 transition-transform duration-300'
                  }
                >
                  {getAirQualityIcon(
                    pm25Value !== null && pm25Value !== undefined
                      ? pm25Value
                      : null,
                    homepage
                      ? 'w-12 h-12 sm:w-28 sm:h-28'
                      : 'w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 xl:w-52 xl:h-52',
                  )}
                </div>
                {homepage ? null : (
                  <div className="flex flex-col items-end gap-1 sm:gap-2 mt-3">
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
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Absolute QR - positioned so it sits just above the bottom divider/separator on the right */}
        <div className="hidden md:flex absolute right-6 bottom-20 lg:bottom-24 items-center flex-col gap-1 sm:gap-2 pointer-events-auto">
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

        {/* Bottom Section */}
        <div className="space-y-2.5 sm:space-y-3 pt-3 sm:pt-4 lg:pt-5 border-t border-white/20 mt-3 sm:mt-4 lg:mt-5">
          {/* Air Quality Status */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {(() => {
              const baseColor =
                pm25Value !== null && pm25Value !== undefined
                  ? getColorFromPM25(pm25Value)
                  : '#808080';
              // Use a very light tint of the base color for background so
              // the badge appears like the color with reduced opacity.
              const badgeBg = hexToRgba(baseColor, 0.14);
              // Subtle border to define the pill on light backgrounds
              const badgeBorder = hexToRgba(baseColor, 0.16);
              // Text should use the same hue (base color) so it stands out
              const badgeText = baseColor;

              return (
                <div
                  className="px-6 py-2 sm:px-8 sm:py-2.5 lg:px-10 lg:py-3 rounded-full font-semibold text-base sm:text-lg shadow-lg"
                  style={{
                    backgroundColor: badgeBg,
                    color: badgeText,
                    border: `1px solid ${badgeBorder}`,
                    fontFamily: '"Times New Roman", Times, serif',
                  }}
                >
                  {category}
                </div>
              );
            })()}
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
              className="font-bold text-2xl sm:text-3xl lg:text-4xl xl:text-5xl tracking-wide"
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
