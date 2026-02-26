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

    const gridTemplate = homepage
      ? 'flex md:grid md:grid-cols-7 gap-2 md:gap-3 overflow-x-auto md:overflow-visible pb-1 md:pb-0 pr-1 md:pr-0'
      : 'grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2 sm:gap-3 lg:gap-4';

    return (
      <div className="w-full">
        <div className={gridTemplate}>
          {validForecasts.slice(0, 7).map((forecast: any, index: number) => {
            const dayIndex = (today + index) % 7;
            const isToday = index === 0;
            const cardBg = isToday
              ? 'bg-blue-700/80 text-white'
              : 'bg-blue-600/25 text-white';

            const cardPadding = homepage
              ? 'p-2 sm:p-3'
              : 'p-2.5 sm:p-3 lg:p-3.5';
            const minH = homepage
              ? 'min-h-[104px] sm:min-h-[116px] md:min-h-[126px]'
              : 'min-h-[112px] sm:min-h-[124px] lg:min-h-[132px]';
            const cardMinW = homepage
              ? 'min-w-[92px] sm:min-w-[102px] md:min-w-0'
              : '';
            const dayClass = 'font-semibold';
            const valueClass = 'font-extrabold mb-1';

            const iconWrapperStyle = homepage
              ? undefined
              : {
                  width: 'clamp(40px, 3.4vw, 72px)',
                  height: 'clamp(40px, 3.4vw, 72px)',
                };

            const dayFontSize = homepage
              ? 'clamp(0.75rem, 1.2vw, 0.95rem)'
              : 'clamp(0.8rem, 1.4vw, 1.05rem)';
            const valueFontSize = homepage
              ? 'clamp(0.95rem, 1.4vw, 1.2rem)'
              : 'clamp(1rem, 1.6vw, 1.3rem)';

            return (
              <div
                key={index}
                role="group"
                aria-label={`Forecast ${index + 1}`}
                className={`${cardBg} rounded-lg ${cardPadding} ${cardMinW} flex flex-col items-center justify-between ${minH}`}
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
                      ? forecast.pm2_5.toFixed(1)
                      : '--'}
                  </span>
                  <div
                    className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12"
                    style={iconWrapperStyle}
                  >
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
              ? 'flex-1 grid grid-cols-[minmax(0,1fr)_minmax(130px,180px)] sm:grid-cols-[minmax(0,1fr)_minmax(160px,230px)] lg:grid-cols-[minmax(0,1fr)_minmax(200px,280px)] gap-[clamp(0.75rem,2vw,1.5rem)] min-h-0'
              : 'flex-1 grid grid-cols-1 xl:grid-cols-[1.2fr_minmax(220px,320px)] gap-[clamp(0.5rem,1.2vw,1.5rem)] min-h-0'
          }
        >
          {/* Left Section */}
          <div className="flex flex-col justify-center space-y-[clamp(0.5rem,1vw,1rem)] min-h-0">
            {/* Air Quality Title */}
            <div
              className="font-bold leading-tight tracking-tight"
              style={{
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: 'clamp(1.25rem, 2.8vw, 2.5rem)',
              }}
            >
              Air Quality
            </div>

            {/* PM2.5 Header */}
            <div className="flex items-center gap-[clamp(0.375rem,0.8vw,0.625rem)]">
              <div className="bg-blue-800/50 rounded-full p-[clamp(0.25rem,0.6vw,0.375rem)] backdrop-blur-sm">
                <div
                  style={{
                    width: 'clamp(1rem, 1.5vw, 1.5rem)',
                    height: 'clamp(1rem, 1.5vw, 1.5rem)',
                  }}
                >
                  <AqWind01 className="text-white w-full h-full" />
                </div>
              </div>
              <span
                className="font-bold tracking-wide"
                style={{
                  fontFamily: '"Times New Roman", Times, serif',
                  fontSize: 'clamp(0.875rem, 1.8vw, 1.25rem)',
                }}
              >
                PM2.5
              </span>
            </div>

            {/* Large PM2.5 Value */}
            <div className="flex items-baseline gap-[clamp(0.375rem,0.8vw,0.625rem)] flex-wrap">
              <span
                className="font-bold leading-none drop-shadow-lg"
                style={{
                  color:
                    pm25Value !== null && pm25Value !== undefined
                      ? getColorFromPM25(pm25Value)
                      : '#808080',
                  fontFamily: '"Times New Roman", Times, serif',
                  fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
                }}
              >
                {pm25Value !== null && pm25Value !== undefined
                  ? pm25Value.toFixed(1)
                  : '--'}
              </span>
              <span
                className="opacity-90 self-end pb-1 font-medium"
                style={{
                  fontFamily: '"Times New Roman", Times, serif',
                  fontSize: 'clamp(1rem, 1.8vw, 1.75rem)',
                }}
              >
                μg/m³
              </span>
            </div>

            {/* 7-Day Forecast */}
            {forecastData && (
              <div className="mt-[clamp(0.375rem,0.8vw,0.625rem)]">
                {renderForecast()}
              </div>
            )}
          </div>

          {/* Right Section */}
          <div
            className={
              homepage
                ? 'flex flex-col items-end justify-start gap-[clamp(0.75rem,1.5vw,1.25rem)] min-h-[180px] md:min-h-[220px] w-full'
                : 'flex flex-col items-center xl:items-end justify-between min-h-0 gap-[clamp(0.75rem,1.5vw,1.25rem)]'
            }
          >
            {/* Air Quality Icon - Single responsive implementation */}
            {homepage ? (
              // Homepage: Responsive icon visible on all screen sizes
              <div className="flex items-center justify-end w-full">
                <div className="transform transition-transform duration-300">
                  {getAirQualityIcon(
                    pm25Value !== null && pm25Value !== undefined
                      ? pm25Value
                      : null,
                    'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32',
                  )}
                </div>
              </div>
            ) : (
              // Non-homepage (Billboard): Larger responsive icon
              <div className="flex items-center justify-center xl:justify-end w-full">
                <div
                  className="transform hover:scale-105 transition-transform duration-300"
                  style={{
                    width: 'clamp(6.5rem, 11vw, 11rem)',
                    height: 'clamp(6.5rem, 11vw, 11rem)',
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

            {/* QR Code */}
            <div className="flex flex-col items-center gap-[clamp(0.25rem,0.6vw,0.5rem)] mt-auto">
              <span
                className="font-semibold tracking-wider text-white/90"
                style={{ fontSize: 'clamp(0.65rem, 1vw, 0.95rem)' }}
              >
                SCAN ME
              </span>
              <div
                className="relative bg-white rounded-lg p-[clamp(0.25rem,0.45vw,0.4rem)] shadow-xl ring-2 ring-white/50"
                style={{
                  width: 'clamp(4.75rem, 8vw, 8rem)',
                  height: 'clamp(4.75rem, 8vw, 8rem)',
                }}
              >
                <Image
                  src="/QR/analytics_qrcode.png"
                  alt="QR Code"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 96px, (max-width: 1280px) 120px, 140px"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="space-y-[clamp(0.5rem,1vw,0.625rem)] pt-[clamp(0.5rem,1vw,1rem)] border-t border-white/20 mt-[clamp(0.5rem,1vw,1rem)]">
          {/* Air Quality Status */}
          <div className="flex flex-wrap items-center gap-[clamp(0.375rem,0.8vw,0.625rem)]">
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
                      'clamp(0.375rem, 0.8vw, 0.625rem) clamp(1.25rem, 2.5vw, 2rem)',
                    fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
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
                fontSize: 'clamp(0.75rem, 1.4vw, 1rem)',
              }}
            >
              Air Quality is {category.toLowerCase()}
            </span>
          </div>

          {/* Location - BIGGER AND MORE VISIBLE */}
          <div
            className="flex items-center gap-[clamp(0.375rem,0.8vw,0.625rem)] bg-white/5 backdrop-blur-sm rounded-lg"
            style={{
              padding:
                'clamp(0.375rem, 0.8vw, 0.625rem) clamp(0.625rem, 1.2vw, 0.875rem)',
            }}
          >
            <div
              className="flex-shrink-0"
              style={{
                width: 'clamp(1rem, 1.5vw, 1.5rem)',
                height: 'clamp(1rem, 1.5vw, 1.5rem)',
              }}
            >
              <FiMapPin className="text-white w-full h-full" />
            </div>
            <span
              className="font-bold tracking-wide truncate"
              style={{
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: 'clamp(1.25rem, 2.8vw, 2.5rem)',
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
