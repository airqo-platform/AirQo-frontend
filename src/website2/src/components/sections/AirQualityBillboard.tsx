'use client';

import {
  AqGood,
  AqHazardous,
  AqModerate,
  AqNoValue,
  AqUnhealthy,
  AqUnhealthyForSensitiveGroups,
  AqVeryUnhealthy,
} from '@airqo/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { FiChevronDown, FiMapPin, FiWind } from 'react-icons/fi';

import {
  useCohortMeasurements,
  useCohortsSummary,
  useDailyForecast,
  useGridMeasurements,
  useGridsSummary,
} from '@/hooks/useApiHooks';
import { cn } from '@/lib/utils';
import type { Cohort, Grid } from '@/types';

type DataType = 'cohort' | 'grid';

interface AirQualityBillboardProps {
  className?: string;
}

const AirQualityBillboard: React.FC<AirQualityBillboardProps> = ({
  className,
}) => {
  const [dataType, setDataType] = useState<DataType>('cohort');
  const [selectedItem, setSelectedItem] = useState<Cohort | Grid | null>(null);
  const [currentMeasurement, setCurrentMeasurement] = useState<any>(null);

  // Fetch data based on type
  const { data: cohortsData } = useCohortsSummary({
    limit: 100, // Get more options
  });

  const { data: gridsData } = useGridsSummary({
    limit: 100, // Get more options
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

  // Set first item as default when data loads
  useEffect(() => {
    if (
      dataType === 'cohort' &&
      cohortsData?.cohorts?.length &&
      !selectedItem
    ) {
      setSelectedItem(cohortsData.cohorts[0]);
    } else if (
      dataType === 'grid' &&
      gridsData?.grids?.length &&
      !selectedItem
    ) {
      setSelectedItem(gridsData.grids[0]);
    }
  }, [cohortsData, gridsData, dataType, selectedItem]);

  // Update current measurement when measurements change
  useEffect(() => {
    const measurements =
      dataType === 'cohort'
        ? cohortMeasurements?.measurements
        : gridMeasurements?.measurements;

    if (measurements && measurements.length > 0) {
      // Filter for sites with valid PM2.5 readings
      const validMeasurements = measurements.filter(
        (m: any) => m.pm2_5 && typeof m.pm2_5.value === 'number',
      );

      if (validMeasurements.length > 0) {
        // Randomly select a measurement for billboard effect
        const randomIndex = Math.floor(
          Math.random() * validMeasurements.length,
        );
        setCurrentMeasurement(validMeasurements[randomIndex]);
      }
    }
  }, [cohortMeasurements, gridMeasurements, dataType]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
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
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [cohortMeasurements, gridMeasurements, dataType]);

  // Get air quality icon based on PM2.5 value
  const getAirQualityIcon = (pm25: number) => {
    const iconProps = {
      className: 'w-16 h-16',
      style: { color: getAirQualityColor(pm25) },
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

  // Get air quality color
  const getAirQualityColor = (pm25: number): string => {
    if (pm25 >= 0 && pm25 <= 12) return '#00E400'; // Good - Green
    if (pm25 > 12 && pm25 <= 35.4) return '#FFFF00'; // Moderate - Yellow
    if (pm25 > 35.4 && pm25 <= 55.4) return '#FF7E00'; // Unhealthy for Sensitive Groups - Orange
    if (pm25 > 55.4 && pm25 <= 150.4) return '#FF0000'; // Unhealthy - Red
    if (pm25 > 150.4 && pm25 <= 250.4) return '#8F3F97'; // Very Unhealthy - Purple
    if (pm25 > 250.4) return '#7E0023'; // Hazardous - Maroon
    return '#808080'; // Unknown - Gray
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

  // Get location name
  const getLocationName = () => {
    if (dataType === 'cohort' && currentMeasurement?.deviceDetails) {
      return currentMeasurement.deviceDetails.name || 'Unknown Location';
    }
    if (dataType === 'grid' && currentMeasurement?.siteDetails) {
      return currentMeasurement.siteDetails.search_name || 'Unknown Location';
    }
    return 'Unknown Location';
  };

  // Render forecast
  const renderForecast = () => {
    if (!forecastData?.forecasts) return null;

    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date().getDay();

    return (
      <div className="flex items-center justify-center gap-2 mt-4">
        {forecastData.forecasts
          .slice(0, 7)
          .map((forecast: any, index: number) => {
            const dayIndex = (today + index) % 7;
            const isToday = index === 0;

            return (
              <div
                key={index}
                className={cn(
                  'flex flex-col items-center rounded-lg p-2 min-w-[40px]',
                  isToday
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-800',
                )}
              >
                <span className="font-bold text-xs">{days[dayIndex]}</span>
                <span className="text-xs font-medium">
                  {forecast.pm2_5?.toFixed(1) || '--'}
                </span>
                <div className="mt-1">
                  {forecast.pm2_5 ? (
                    getAirQualityIcon(forecast.pm2_5)
                  ) : (
                    <AqNoValue className="w-4 h-4" />
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
    <div
      className={cn(
        'bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="font-bold text-lg">Air Quality Monitor</div>
          <div className="text-sm opacity-90">
            {new Date().toLocaleDateString([], {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
          <div className="text-sm opacity-90">
            {new Date().toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })}
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
              'px-4 py-2 rounded-lg font-medium transition-all text-sm',
              dataType === 'cohort'
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-blue-500 text-white hover:bg-blue-400',
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
              'px-4 py-2 rounded-lg font-medium transition-all text-sm',
              dataType === 'grid'
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-blue-500 text-white hover:bg-blue-400',
            )}
          >
            Grid
          </button>
        </div>
      </div>

      {/* Selection Dropdown */}
      <div className="mb-6">
        <div className="relative max-w-xs">
          <select
            value={selectedItem?._id || ''}
            onChange={(e) => {
              const items =
                dataType === 'cohort' ? cohortsData?.cohorts : gridsData?.grids;
              const item = items?.find((i: any) => i._id === e.target.value);
              setSelectedItem(item || null);
            }}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white/40 appearance-none backdrop-blur-sm"
          >
            {(dataType === 'cohort'
              ? cohortsData?.cohorts
              : gridsData?.grids
            )?.map((item: any) => (
              <option key={item._id} value={item._id} className="text-black">
                {item.name || item.long_name}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!currentMeasurement ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent mb-4"></div>
            <p className="text-white/80">Loading air quality data...</p>
          </motion.div>
        ) : (
          <motion.div
            key="data"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Main Reading */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <FiWind className="w-6 h-6 text-white/80" />
                  <span className="text-lg font-medium">PM2.5</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold">
                    {pm25Value?.toFixed(1) ?? '--'}
                  </span>
                  <span className="text-xl opacity-80">μg/m³</span>
                </div>
              </div>

              {/* Air Quality Icon */}
              <div className="flex-shrink-0">
                {pm25Value ? (
                  getAirQualityIcon(pm25Value)
                ) : (
                  <AqNoValue className="w-16 h-16 text-white/60" />
                )}
              </div>
            </div>

            {/* Air Quality Category */}
            <div className="flex items-center gap-4">
              <div
                className="px-4 py-2 rounded-full font-semibold text-sm"
                style={{
                  backgroundColor: pm25Value
                    ? getAirQualityColor(pm25Value)
                    : '#808080',
                }}
              >
                {category}
              </div>
              <span className="text-white/80">
                Air Quality is {category.toLowerCase()}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/20">
              <FiMapPin className="w-5 h-5 text-white/80" />
              <span className="font-medium">{getLocationName()}</span>
            </div>

            {/* 7-Day Forecast */}
            {forecastData && (
              <div className="pt-4 border-t border-white/20">
                <h4 className="text-sm font-medium mb-3 text-center">
                  7-Day Forecast
                </h4>
                {renderForecast()}
              </div>
            )}

            {/* Last Updated */}
            <div className="text-xs text-white/60 text-center pt-4 border-t border-white/20">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AirQualityBillboard;
