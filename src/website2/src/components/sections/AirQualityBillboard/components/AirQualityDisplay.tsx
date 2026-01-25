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
      ? 'grid grid-cols-[repeat(auto-fit,minmax(70px,1fr))] gap-1 sm:gap-2'
      : 'grid grid-cols-[repeat(auto-fit,minmax(clamp(90px,8vw,140px),1fr))] gap-[clamp(0.5rem,1vw,1.5rem)]';

    return (
      <div className="w-full">
        <div className={gridTemplate}>
          {validForecasts.slice(0, 7).map((forecast: any, index: number) => {
            const dayIndex = (today + index) % 7;
            const isToday = index === 0;
            const cardBg = isToday
              ? 'bg-blue-700/80 text-white'
              : 'bg-blue-600/25 text-white';

            // Zoom-friendly responsive sizing with clamp
            const cardPadding = isCompact
              ? 'p-1 sm:p-2'
              : 'p-[clamp(0.5rem,1.2vw,1.25rem)]';
            const minH = isCompact
              ? 'min-h-[70px] sm:min-h-[80px]'
              : 'min-h-[clamp(90px,9vw,130px)]';
            const dayClass = isCompact ? 'font-semibold' : 'font-semibold';
            const valueClass = isCompact
              ? 'font-bold mb-1'
              : 'font-extrabold mb-[clamp(0.25rem,0.5vw,0.75rem)]';

            // Icon sizing that scales with viewport (clamp) for very large billboards
            const iconWrapperStyle = isCompact
              ? undefined
              : {
                  width: 'clamp(40px, 3.5vw, 80px)',
                  height: 'clamp(40px, 3.5vw, 80px)',
                };

            // Dynamic font sizing with clamp for better zoom handling
            const dayFontSize = isCompact
              ? 'clamp(0.75rem, 1.5vw, 0.875rem)'
              : 'clamp(0.875rem, 1.8vw, 1.125rem)';
            const valueFontSize = isCompact
              ? 'clamp(0.75rem, 1.6vw, 1rem)'
              : 'clamp(1rem, 2.2vw, 1.75rem)';

            return (
              <div
                key={index}
                role="group"
                aria-label={`Forecast ${index + 1}`}
                className={`${cardBg} rounded-lg ${cardPadding} flex flex-col items-center justify-between ${minH}`}
                style={{ fontFamily: '"Times New Roman", Times, serif' }}
              >
                <div className="w-full flex items-center justify-center mb-[clamp(0.25rem,0.5vw,0.5rem)]">
                  <span
                    className={`${dayClass} tracking-wider`}
                    style={{ fontSize: dayFontSize }}
                  >
                    {days[dayIndex]}
                  </span>
                </div>

                <div className="w-full flex flex-col items-center gap-[clamp(0.125rem,0.3vw,0.375rem)]">
                  <span
                    className={valueClass}
                    style={{ fontSize: valueFontSize }}
                  >
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
              ? 'flex-1 grid grid-cols-[1fr_110px] sm:grid-cols-[1.3fr_1fr] gap-[clamp(0.75rem,2vw,1.5rem)] min-h-auto'
              : 'flex-1 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-[clamp(1rem,2.5vw,2rem)] min-h-0'
          }
        >
          {/* Left Section */}
          <div className="flex flex-col justify-center space-y-[clamp(0.75rem,1.5vw,1.25rem)] min-h-0">
            {/* Air Quality Title */}
            <div
              className="font-bold leading-tight tracking-tight"
              style={{
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: 'clamp(1.5rem, 3.5vw, 3rem)',
              }}
            >
              Air Quality
            </div>

            {/* PM2.5 Header */}
            <div className="flex items-center gap-[clamp(0.5rem,1vw,0.75rem)]">
              <div className="bg-blue-800/50 rounded-full p-[clamp(0.375rem,0.8vw,0.5rem)] backdrop-blur-sm">
                <div
                  style={{
                    width: 'clamp(1.25rem, 2vw, 1.75rem)',
                    height: 'clamp(1.25rem, 2vw, 1.75rem)',
                  }}
                >
                  <AqWind01 className="text-white w-full h-full" />
                </div>
              </div>
              <span
                className="font-bold tracking-wide"
                style={{
                  fontFamily: '"Times New Roman", Times, serif',
                  fontSize: 'clamp(1.125rem, 2.2vw, 1.5rem)',
                }}
              >
                PM2.5
              </span>
            </div>

            {/* Large PM2.5 Value */}
            <div className="flex items-baseline gap-[clamp(0.5rem,1vw,0.75rem)] flex-wrap">
              <span
                className="font-bold leading-none drop-shadow-lg"
                style={{
                  color:
                    pm25Value !== null && pm25Value !== undefined
                      ? getColorFromPM25(pm25Value)
                      : '#808080',
                  fontFamily: '"Times New Roman", Times, serif',
                  fontSize: 'clamp(3rem, 7vw, 5rem)',
                }}
              >
                {pm25Value !== null && pm25Value !== undefined
                  ? pm25Value.toFixed(2)
                  : '--'}
              </span>
              <span
                className="opacity-90 self-end pb-1 font-medium"
                style={{
                  fontFamily: '"Times New Roman", Times, serif',
                  fontSize: 'clamp(1.25rem, 2vw, 1.875rem)',
                }}
              >
                μg/m³
              </span>
            </div>

            {/* 7-Day Forecast - show on non-homepage everywhere, and on homepage only from md+ */}
            {forecastData &&
              (homepage ? (
                <div className="mt-[clamp(0.5rem,1vw,0.75rem)] hidden md:block">
                  {renderForecast()}
                </div>
              ) : (
                <div className="mt-[clamp(0.5rem,1vw,0.75rem)]">
                  {renderForecast()}
                </div>
              ))}
          </div>

          {/* Right Section */}
          <div
            className={
              homepage
                ? 'flex flex-col items-end justify-between min-h-auto w-full relative'
                : 'flex flex-col items-center lg:items-end justify-between min-h-0 relative'
            }
          >
            {/* Air Quality Icon - Single responsive implementation */}
            {homepage ? (
              // Homepage: Smaller icon, only visible on md+ screens
              <div className="hidden md:flex items-center justify-end pr-2 w-full">
                <div className="transform transition-transform duration-300">
                  {getAirQualityIcon(
                    pm25Value !== null && pm25Value !== undefined
                      ? pm25Value
                      : null,
                    'w-24 h-24 sm:w-28 sm:h-28',
                  )}
                </div>
              </div>
            ) : (
              // Non-homepage (Billboard): Larger responsive icon
              <div className="flex items-center justify-center lg:justify-end w-full">
                <div
                  className="transform hover:scale-105 transition-transform duration-300"
                  style={{
                    width: 'clamp(7rem, 14vw, 13rem)',
                    height: 'clamp(7rem, 14vw, 13rem)',
                  }}
                >
                  {getAirQualityIcon(
                    pm25Value !== null && pm25Value !== undefined
                      ? pm25Value
                      : null,
                    'w-full h-full',
                  )}
                </div>
              </div>
            )}

            {/* QR Code - Positioned at bottom right for both views */}
            <div className="hidden md:flex absolute bottom-0 right-0 flex-col items-center gap-[clamp(0.25rem,0.5vw,0.5rem)]">
              <span
                className="font-semibold tracking-wider text-white/90"
                style={{ fontSize: 'clamp(0.65rem, 1vw, 0.75rem)' }}
              >
                SCAN ME
              </span>
              <div
                className="relative bg-white rounded-lg p-[clamp(0.25rem,0.5vw,0.375rem)]"
                style={{
                  width: 'clamp(4rem, 6vw, 5.5rem)',
                  height: 'clamp(4rem, 6vw, 5.5rem)',
                }}
              >
                <Image
                  src="/QR/analytics_qrcode.png"
                  alt="QR Code"
                  fill
                  className="object-contain"
                  sizes="88px"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="space-y-[clamp(0.625rem,1.2vw,0.75rem)] pt-[clamp(0.75rem,1.5vw,1.25rem)] border-t border-white/20 mt-[clamp(0.75rem,1.5vw,1.25rem)]">
          {/* Air Quality Status */}
          <div className="flex flex-wrap items-center gap-[clamp(0.5rem,1vw,0.75rem)]">
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
                  className="rounded-full font-semibold shadow-lg"
                  style={{
                    backgroundColor: badgeBg,
                    color: badgeText,
                    border: `1px solid ${badgeBorder}`,
                    fontFamily: '"Times New Roman", Times, serif',
                    padding:
                      'clamp(0.5rem, 1vw, 0.75rem) clamp(1.5rem, 3vw, 2.5rem)',
                    fontSize: 'clamp(1rem, 1.8vw, 1.125rem)',
                  }}
                >
                  {category}
                </div>
              );
            })()}
            <span
              className="font-medium"
              style={{
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: 'clamp(0.875rem, 1.6vw, 1.125rem)',
              }}
            >
              Air Quality is {category.toLowerCase()}
            </span>
          </div>

          {/* Location - BIGGER AND MORE VISIBLE */}
          <div
            className="flex items-center gap-[clamp(0.5rem,1vw,0.75rem)] bg-white/5 backdrop-blur-sm rounded-lg"
            style={{
              padding:
                'clamp(0.5rem, 1vw, 0.75rem) clamp(0.75rem, 1.5vw, 1rem)',
            }}
          >
            <div
              className="flex-shrink-0"
              style={{
                width: 'clamp(1.25rem, 2vw, 1.75rem)',
                height: 'clamp(1.25rem, 2vw, 1.75rem)',
              }}
            >
              <FiMapPin className="text-white w-full h-full" />
            </div>
            <span
              className="font-bold tracking-wide truncate"
              style={{
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: 'clamp(1.5rem, 3.5vw, 3rem)',
              }}
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
