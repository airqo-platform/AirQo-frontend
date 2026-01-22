'use client';

import {
  AqGood,
  AqHazardous,
  AqModem02,
  AqModerate,
  AqNoValue,
  AqUnhealthy,
  AqUnhealthyForSensitiveGroups,
  AqVeryUnhealthy,
} from '@airqo/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiMapPin } from 'react-icons/fi';

import BillboardSkeleton from '@/components/skeletons/BillboardSkeleton';
import {
  useCohortMeasurements,
  useCohortsSummary,
  useDailyForecast,
  useGridMeasurements,
  useGridsSummary,
} from '@/hooks/useApiHooks';
import { cn } from '@/lib/utils';
import type { Cohort, Grid } from '@/types';
import {
  categoryToLevel,
  getAirQualityColor as getAirQualityColorUtil,
} from '@/utils/airQuality';

type DataType = 'cohort' | 'grid';

interface AirQualityBillboardProps {
  className?: string;
  hideControls?: boolean;
  autoRotate?: boolean;
  dataType?: DataType;
  itemName?: string;
}

// Utility to format display names
const formatDisplayName = (name: string): string => {
  if (!name) return '';
  return name
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const AirQualityBillboard: React.FC<AirQualityBillboardProps> = ({
  className,
  hideControls = false,
  autoRotate = false,
  dataType: propDataType,
  itemName: propItemName,
}) => {
  const [dataType, setDataType] = useState<DataType>(propDataType || 'cohort');
  const [selectedItem, setSelectedItem] = useState<Cohort | Grid | null>(null);
  const [currentMeasurement, setCurrentMeasurement] = useState<any>(null);

  // Refs for cleanup
  const measurementRotationRef = useRef<NodeJS.Timeout | null>(null);
  const itemRotationRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Fetch data based on type
  const { data: cohortsData } = useCohortsSummary({
    limit: 100,
  });

  const { data: gridsData } = useGridsSummary({
    limit: 100,
  });

  // Get measurements for selected item
  const { data: cohortMeasurements } = useCohortMeasurements(
    selectedItem && dataType === 'cohort' ? selectedItem._id : null,
    { limit: 100 },
  );

  const { data: gridMeasurements } = useGridMeasurements(
    selectedItem && dataType === 'grid' ? selectedItem._id : null,
    { limit: 100 },
  );

  // Get forecast for current site
  const { data: forecastData } = useDailyForecast(
    currentMeasurement?.site_id || null,
  );

  // Get current items list
  const currentItems =
    dataType === 'cohort' ? cohortsData?.cohorts : gridsData?.grids;

  // Set first item as default when data loads or handle prop-based item selection
  useEffect(() => {
    if (!isMountedRef.current) return;

    const items =
      dataType === 'cohort' ? cohortsData?.cohorts : gridsData?.grids;

    if (!items?.length) return;

    // If a specific item name is provided via props, find and select it
    if (propItemName && !selectedItem) {
      const normalizedPropName = propItemName
        .toLowerCase()
        .replace(/[-_\s]/g, '');
      const matchedItem = items.find((item: any) => {
        const itemName = (item.name || item.long_name || '')
          .toLowerCase()
          .replace(/[-_\s]/g, '');
        return itemName === normalizedPropName;
      });

      if (matchedItem) {
        setSelectedItem(matchedItem);
        return;
      }
    }

    // Otherwise, select the first item if none is selected
    if (!selectedItem) {
      setSelectedItem(items[0]);
    }
  }, [cohortsData, gridsData, dataType, selectedItem, propItemName]);

  // Update current measurement when measurements change
  const updateMeasurement = useCallback(() => {
    if (!isMountedRef.current) return;

    const measurements =
      dataType === 'cohort'
        ? cohortMeasurements?.measurements
        : gridMeasurements?.measurements;

    if (measurements && measurements.length > 0) {
      const validMeasurements = measurements.filter(
        (m: any) => m.pm2_5 && typeof m.pm2_5.value === 'number',
      );

      if (validMeasurements.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * validMeasurements.length,
        );
        setCurrentMeasurement(validMeasurements[randomIndex]);
      }
    }
  }, [cohortMeasurements, gridMeasurements, dataType]);

  useEffect(() => {
    updateMeasurement();
  }, [updateMeasurement]);

  // Auto-refresh measurement every 30 seconds
  useEffect(() => {
    if (!isMountedRef.current) return;

    if (measurementRotationRef.current) {
      clearInterval(measurementRotationRef.current);
    }

    measurementRotationRef.current = setInterval(() => {
      if (isMountedRef.current) {
        updateMeasurement();
      }
    }, 30000);

    return () => {
      if (measurementRotationRef.current) {
        clearInterval(measurementRotationRef.current);
        measurementRotationRef.current = null;
      }
    };
  }, [updateMeasurement]);

  // Auto-rotate between items every 20 seconds if enabled (only when no specific item is provided)
  useEffect(() => {
    if (
      !autoRotate ||
      !currentItems?.length ||
      !isMountedRef.current ||
      propItemName
    )
      return;

    if (itemRotationRef.current) {
      clearInterval(itemRotationRef.current);
    }

    itemRotationRef.current = setInterval(() => {
      if (!isMountedRef.current) return;

      const items =
        dataType === 'cohort' ? cohortsData?.cohorts : gridsData?.grids;
      if (!items || items.length === 0) return;

      setSelectedItem((prevItem) => {
        const currentIndex = items.findIndex(
          (item: any) => item._id === prevItem?._id,
        );
        const nextIndex = (currentIndex + 1) % items.length;
        return items[nextIndex] || prevItem;
      });
    }, 20000);

    return () => {
      if (itemRotationRef.current) {
        clearInterval(itemRotationRef.current);
        itemRotationRef.current = null;
      }
    };
  }, [
    autoRotate,
    currentItems,
    dataType,
    cohortsData,
    gridsData,
    propItemName,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (measurementRotationRef.current) {
        clearInterval(measurementRotationRef.current);
      }
      if (itemRotationRef.current) {
        clearInterval(itemRotationRef.current);
      }
    };
  }, []);

  // Get air quality icon based on PM2.5 value
  const getAirQualityIcon = (pm25: number, size: string = 'w-32 h-32') => {
    const iconProps = {
      className: size,
    };

    if (pm25 >= 0 && pm25 <= 12) {
      return <AqGood {...iconProps} />;
    } else if (pm25 > 12 && pm25 <= 35.4) {
      return <AqModerate {...iconProps} />;
    } else if (pm25 > 35.4 && pm25 <= 55.4) {
      return <AqUnhealthyForSensitiveGroups {...iconProps} />;
    } else if (pm25 > 55.4 && pm25 <= 150.4) {
      return <AqUnhealthy {...iconProps} />;
    } else if (pm25 > 150.4 && pm25 <= 250.4) {
      return <AqVeryUnhealthy {...iconProps} />;
    } else if (pm25 > 250.4) {
      return <AqHazardous {...iconProps} />;
    } else {
      return <AqNoValue {...iconProps} />;
    }
  };

  // Get air quality category
  const getAirQualityCategory = (pm25: number): string => {
    if (pm25 >= 0 && pm25 <= 12) return 'Good';
    if (pm25 > 12 && pm25 <= 35.4) return 'Moderate';
    if (pm25 > 35.4 && pm25 <= 55.4) return 'Unhealthy for Sensitive Groups';
    if (pm25 > 55.4 && pm25 <= 150.4) return 'Unhealthy';
    if (pm25 > 150.4 && pm25 <= 250.4) return 'Very Unhealthy';
    if (pm25 > 250.4) return 'Hazardous';
    return 'Unknown';
  };

  // Get text color for better readability on colored backgrounds
  const getTextColor = (category: string): string => {
    const level = categoryToLevel(category);
    // Use black text for light backgrounds (good, moderate)
    // Use white text for dark backgrounds
    if (level === 'good' || level === 'moderate') {
      return '#000000';
    }
    return '#FFFFFF';
  };

  // Get location name
  const getLocationName = () => {
    if (dataType === 'cohort' && currentMeasurement?.deviceDetails) {
      // For cohort, show device name as-is (no formatting)
      return currentMeasurement.deviceDetails.name || 'Unknown Device';
    }
    if (dataType === 'grid' && currentMeasurement?.siteDetails) {
      return (
        formatDisplayName(currentMeasurement.siteDetails.search_name) ||
        'Unknown Location'
      );
    }
    return 'Unknown Location';
  };

  // Render forecast
  const renderForecast = () => {
    if (!forecastData?.forecasts) return null;

    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date().getDay();

    return (
      <div className="flex items-center gap-2 flex-wrap">
        {forecastData.forecasts
          .slice(0, 7)
          .map((forecast: any, index: number) => {
            const dayIndex = (today + index) % 7;
            const isToday = index === 0;

            return (
              <div
                key={index}
                className={cn(
                  'flex flex-col items-center rounded-lg p-3 min-w-[60px] sm:min-w-[70px]',
                  isToday
                    ? 'bg-blue-700 text-white'
                    : 'bg-blue-500/30 text-white backdrop-blur-sm',
                )}
              >
                <span className="font-bold text-sm sm:text-base mb-1">
                  {days[dayIndex]}
                </span>
                <span className="text-xs sm:text-sm font-medium mb-2">
                  {forecast.pm2_5?.toFixed(1) || '--'}
                </span>
                <div className="flex-shrink-0">
                  {forecast.pm2_5 ? (
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

  const pm25Value = currentMeasurement?.pm2_5?.value;
  const category = pm25Value ? getAirQualityCategory(pm25Value) : 'Unknown';

  return (
    <section className={cn('py-8 sm:py-12 lg:py-16 px-4', className)}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-2xl p-6 sm:p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          </div>

          {/* Header */}
          {!hideControls && (
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="font-bold text-lg sm:text-xl">
                  Air Quality Monitor
                </div>
                <div className="text-xs sm:text-sm opacity-90 flex items-center gap-2 flex-wrap">
                  <span>
                    {new Date().toLocaleDateString([], {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span>
                    {new Date().toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Data Type Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setDataType('cohort');
                    setSelectedItem(null);
                  }}
                  className={cn(
                    'px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm',
                    dataType === 'cohort'
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-blue-500/50 text-white hover:bg-blue-500/70',
                  )}
                >
                  Cohort
                </button>
                <button
                  onClick={() => {
                    setDataType('grid');
                    setSelectedItem(null);
                  }}
                  className={cn(
                    'px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm',
                    dataType === 'grid'
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-blue-500/50 text-white hover:bg-blue-500/70',
                  )}
                >
                  Grid
                </button>
              </div>
            </div>
          )}

          {/* Selection Dropdown */}
          {!hideControls && (
            <div className="relative z-10 mb-6 sm:mb-8">
              <div className="relative max-w-md">
                <select
                  value={selectedItem?._id || ''}
                  onChange={(e) => {
                    const items =
                      dataType === 'cohort'
                        ? cohortsData?.cohorts
                        : gridsData?.grids;
                    const item = items?.find(
                      (i: any) => i._id === e.target.value,
                    );
                    setSelectedItem(item || null);
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white/50 appearance-none backdrop-blur-sm text-sm sm:text-base"
                >
                  {currentItems?.map((item: any) => (
                    <option
                      key={item._id}
                      value={item._id}
                      className="text-black bg-white"
                    >
                      {formatDisplayName(item.name || item.long_name)}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none" />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!currentMeasurement ? (
              <BillboardSkeleton />
            ) : (
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
                    <div className="text-2xl sm:text-3xl font-bold">PM2.5</div>

                    {/* Large PM2.5 Value */}
                    <div className="flex items-baseline gap-3">
                      <span
                        className="text-7xl sm:text-8xl md:text-9xl font-bold leading-none"
                        style={{
                          color: pm25Value
                            ? getAirQualityColorUtil(category)
                            : '#808080',
                        }}
                      >
                        {pm25Value?.toFixed(1) ?? '--'}
                      </span>
                      <span className="text-2xl sm:text-3xl opacity-90 mb-2">
                        μg/m³
                      </span>
                    </div>

                    {/* 7-Day Forecast */}
                    {forecastData && (
                      <div className="mt-8">{renderForecast()}</div>
                    )}
                  </div>

                  {/* Right Section */}
                  <div className="flex flex-col items-start lg:items-end justify-between space-y-6 lg:space-y-8">
                    {/* Large Air Quality Icon */}
                    <div className="w-full flex justify-center lg:justify-end">
                      <div className="transform hover:scale-105 transition-transform duration-300">
                        {pm25Value ? (
                          getAirQualityIcon(
                            pm25Value,
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
                      className="px-5 py-2 rounded-full font-bold text-sm sm:text-base shadow-lg"
                      style={{
                        backgroundColor: pm25Value
                          ? getAirQualityColorUtil(category)
                          : '#808080',
                        color: pm25Value ? getTextColor(category) : '#FFFFFF',
                      }}
                    >
                      {category}
                    </div>
                    <span className="text-lg sm:text-xl font-medium">
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
                    <span className="font-medium text-sm sm:text-base">
                      {getLocationName()}
                    </span>
                  </div>

                  {/* Last Updated */}
                  <div className="text-xs sm:text-sm text-white/70">
                    Last updated:{' '}
                    {currentMeasurement?.time
                      ? new Date(currentMeasurement.time).toLocaleString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )
                      : 'Unknown'}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default AirQualityBillboard;
