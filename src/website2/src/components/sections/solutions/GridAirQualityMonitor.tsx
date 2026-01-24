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
import React, { useEffect, useMemo, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

import {
  useGridRepresentativeReading,
  useGridsSummary,
} from '@/hooks/useApiHooks';
import { cn } from '@/lib/utils';
import type { Grid } from '@/types/grids';
import {
  AIR_QUALITY_COLORS,
  AIR_QUALITY_INFO,
  categoryToLevel,
  formatName,
  getAirQualityCategory,
  getAirQualityColor,
} from '@/utils/airQuality';

type AdminLevel =
  | 'city'
  | 'county'
  | 'country'
  | 'state'
  | 'district'
  | 'province';

// Get appropriate icon for air quality level
const getAirQualityIcon = (category: string) => {
  const level = categoryToLevel(category);
  const iconProps = {
    className: 'w-16 h-16',
    style: { color: getAirQualityColor(category) },
  };

  switch (level) {
    case 'good':
      return <AqGood {...iconProps} />;
    case 'moderate':
      return <AqModerate {...iconProps} />;
    case 'unhealthy-sensitive-groups':
      return <AqUnhealthyForSensitiveGroups {...iconProps} />;
    case 'unhealthy':
      return <AqUnhealthy {...iconProps} />;
    case 'very-unhealthy':
      return <AqVeryUnhealthy {...iconProps} />;
    case 'hazardous':
      return <AqHazardous {...iconProps} />;
    default:
      return <AqNoValue {...iconProps} />;
  }
};

// Skeleton Components
const SkeletonLoader = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-14 bg-gray-200 rounded-lg"></div>
      <div className="h-14 bg-gray-200 rounded-lg"></div>
      <div className="h-14 bg-gray-200 rounded-lg"></div>
    </div>
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-24 bg-gray-200 rounded w-full"></div>
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  </div>
);

type SupportedPollutant = 'pm2_5' | 'pm10';

const GridAirQualityMonitor: React.FC = () => {
  const [adminLevel, setAdminLevel] = useState<AdminLevel>('country');
  const [selectedGrid, setSelectedGrid] = useState<Grid | null>(null);
  const [pollutant, setPollutant] = useState<SupportedPollutant>('pm2_5');
  const [page, setPage] = useState(1);

  const { data: gridsData, isLoading: gridsLoading } = useGridsSummary({
    admin_level: adminLevel,
    page,
    limit: 30,
  });

  const { data: readingData, isLoading: readingLoading } =
    useGridRepresentativeReading(selectedGrid?._id || null);

  // Set first grid as default when data loads or when selected grid is not in current page
  useEffect(() => {
    if (gridsData?.grids?.length) {
      const currentGridExists =
        selectedGrid &&
        gridsData.grids.some((grid) => grid._id === selectedGrid._id);
      if (!selectedGrid || !currentGridExists) {
        setSelectedGrid(gridsData.grids[0]);
      }
    }
  }, [gridsData, selectedGrid, page]);

  const currentValue =
    pollutant === 'pm2_5'
      ? readingData?.data?.pm2_5?.value
      : readingData?.data?.pm10?.value;
  const pollutantName = pollutant === 'pm2_5' ? 'PM2.5' : 'PM10';
  const category = getAirQualityCategory(currentValue, pollutant);

  // Memoize health tips to avoid unnecessary re-renders
  const healthTips = useMemo(
    () => readingData?.data?.health_tips?.slice(0, 3) || [],
    [readingData?.data?.health_tips],
  );

  if (gridsLoading && !gridsData) return <SkeletonLoader />;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl lg:text-4xl font-semibold text-gray-900">
          Real-Time Air Quality Monitoring
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Track air quality readings across African cities
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Admin Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Level
          </label>
          <div className="relative">
            <select
              value={adminLevel}
              onChange={(e) => {
                setAdminLevel(e.target.value as AdminLevel);
                setSelectedGrid(null);
                setPage(1);
              }}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="city">City</option>
              <option value="county">County</option>
              <option value="country">Country</option>
              <option value="state">State</option>
              <option value="district">District</option>
              <option value="province">Province</option>
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Grid Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Location
          </label>
          <div className="relative">
            <select
              value={selectedGrid?._id || ''}
              onChange={(e) => {
                const grid = gridsData?.grids?.find(
                  (g: Grid) => g._id === e.target.value,
                );
                setSelectedGrid(grid || null);
              }}
              disabled={!gridsData?.grids?.length}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:border-blue-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {gridsData?.grids?.map((grid: Grid) => (
                <option key={grid._id} value={grid._id}>
                  {formatName(grid.long_name)}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Pollutant Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pollutant Type
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setPollutant('pm2_5')}
              className={cn(
                'flex-1 py-3 px-4 rounded-lg font-medium transition-all',
                pollutant === 'pm2_5'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300',
              )}
            >
              PM2.5
            </button>
            <button
              onClick={() => setPollutant('pm10')}
              className={cn(
                'flex-1 py-3 px-4 rounded-lg font-medium transition-all',
                pollutant === 'pm10'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300',
              )}
            >
              PM10
            </button>
          </div>
        </div>
      </div>

      {/* Data Display */}
      <AnimatePresence mode="wait">
        {readingLoading ? (
          <SkeletonLoader />
        ) : !readingData?.data ? (
          <motion.div
            key="no-data"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center"
          >
            <AqNoValue className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 text-lg">
              No data available for selected location
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Please select a different location or try again later
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="data"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
              {/* Main Reading */}
              <div className="p-8">
                <div className="space-y-6">
                  {/* Location Info */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {formatName(selectedGrid?.long_name || '')}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {readingData.data.siteDetails?.location_name || '--'}
                    </p>
                  </div>

                  {/* Air Quality Icon and Value */}
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      {getAirQualityIcon(category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-gray-900">
                          {currentValue?.toFixed(2) ?? 'N/A'}
                        </span>
                        <span className="text-xl text-gray-600">μg/m³</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {pollutantName}
                      </p>
                    </div>
                  </div>

                  {/* Air Quality Badge */}
                  <div
                    className="inline-flex items-center px-4 py-2 rounded-full font-semibold text-sm text-white"
                    style={{
                      backgroundColor: getAirQualityColor(category),
                    }}
                  >
                    {formatName(category)}
                  </div>

                  {/* Update Time */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Last updated:{' '}
                      {readingData.data.time
                        ? new Date(readingData.data.time).toLocaleString(
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
                    </p>
                  </div>
                </div>
              </div>

              {/* Health Recommendations */}
              <div className="p-8 bg-gray-50">
                <h4 className="font-bold text-gray-900 text-lg mb-4">
                  Health Recommendations
                </h4>
                {healthTips.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {healthTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow"
                      >
                        <p className="font-semibold text-sm text-gray-900 mb-2">
                          {tip.title}
                        </p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {tip.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                    <p className="text-sm text-gray-600">
                      No health recommendations available at this time
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {gridsData?.meta && gridsData.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-400 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {gridsData.meta.totalPages}
          </span>
          <button
            onClick={() =>
              setPage((p) => Math.min(gridsData.meta.totalPages, p + 1))
            }
            disabled={page === gridsData.meta.totalPages}
            className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-400 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* AQI Legend */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-bold text-gray-900 mb-6 text-lg">
          Air Quality Index Guide ({pollutantName})
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(AIR_QUALITY_INFO).map(([level, info]) => (
            <div key={level} className="text-center space-y-2">
              <div
                className="h-12 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                style={{
                  backgroundColor:
                    AIR_QUALITY_COLORS[
                      level as keyof typeof AIR_QUALITY_COLORS
                    ],
                }}
              >
                {info.label}
              </div>
              <p className="text-xs text-gray-600 font-medium">
                {pollutant === 'pm2_5' ? info.range.pm2_5 : info.range.pm10}{' '}
                μg/m³
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default GridAirQualityMonitor;
