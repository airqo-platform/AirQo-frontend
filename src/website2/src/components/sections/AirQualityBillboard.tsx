'use client';

import {
  AqAirQo,
  AqCopy06,
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
import { useCallback, useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiMapPin } from 'react-icons/fi';
import { mutate } from 'swr';

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
  AIR_QUALITY_INFO,
  categoryToLevel,
  getAirQualityCategory,
  getAirQualityColor,
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

const AirQualityBillboard = ({
  className,
  hideControls = false,
  autoRotate = false,
  dataType: propDataType,
  itemName: propItemName,
}: AirQualityBillboardProps) => {
  const [dataType, setDataType] = useState<DataType>(propDataType || 'grid');
  const [selectedItem, setSelectedItem] = useState<Cohort | Grid | null>(null);
  const [currentMeasurement, setCurrentMeasurement] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Refs for cleanup
  const measurementRotationRef = useRef<NodeJS.Timeout | null>(null);
  const itemRotationRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [currentSiteIndex, setCurrentSiteIndex] = useState(0);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [_allCohorts, setAllCohorts] = useState<any[]>([]);
  const [_allGrids, setAllGrids] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  // Helper function to get display name
  const getDisplayName = (item: Cohort | Grid | null): string => {
    if (!item) return '';
    return item.name || (item as Grid).long_name || '';
  };

  // Fetch data based on type
  const cohortsParams =
    propItemName && dataType === 'cohort'
      ? { limit: 80, search: propItemName }
      : { limit: 80 };
  const gridsParams =
    propItemName && dataType === 'grid'
      ? { limit: 80, search: propItemName }
      : { limit: 80 };

  const {
    data: cohortsData,
    isLoading: cohortsLoading,
    error: cohortsError,
  } = useCohortsSummary(dataType === 'cohort' ? cohortsParams : undefined);

  const {
    data: gridsData,
    isLoading: gridsLoading,
    error: gridsError,
  } = useGridsSummary(dataType === 'grid' ? gridsParams : undefined);

  // Get measurements for selected item using the recent endpoints
  const {
    data: cohortMeasurements,
    isLoading: cohortMeasurementsLoading,
    error: cohortMeasurementsError,
  } = useCohortMeasurements(
    selectedItem && dataType === 'cohort' ? selectedItem._id : null,
    { limit: 80 },
  );

  const {
    data: gridMeasurements,
    isLoading: gridMeasurementsLoading,
    error: gridMeasurementsError,
  } = useGridMeasurements(
    selectedItem && dataType === 'grid' ? selectedItem._id : null,
    { limit: 80 },
  );

  // Get forecast for current site - site_id comes from the measurement
  const { data: forecastData } = useDailyForecast(
    currentMeasurement?.site_id || null,
  );

  // Get current items list
  const currentItems = dataType === 'cohort' ? _allCohorts : _allGrids;

  // Accumulate all data from pages
  useEffect(() => {
    if (cohortsData?.cohorts) {
      setAllCohorts((prev) => {
        const existingIds = new Set(prev.map((c) => c._id));
        const newCohorts = cohortsData.cohorts.filter(
          (c) => !existingIds.has(c._id),
        );
        return [...prev, ...newCohorts];
      });
    }
  }, [cohortsData]);

  useEffect(() => {
    if (gridsData?.grids) {
      setAllGrids((prev) => {
        const existingIds = new Set(prev.map((g) => g._id));
        const newGrids = gridsData.grids.filter((g) => !existingIds.has(g._id));
        return [...prev, ...newGrids];
      });
    }
  }, [gridsData]);

  // Load more pages if available
  useEffect(() => {
    if (!isMountedRef.current || loadingMore) return;

    const meta = dataType === 'cohort' ? cohortsData?.meta : gridsData?.meta;
    if (meta?.nextPage && !loadingMore) {
      setLoadingMore(true);
      // Parse nextPage URL to get params
      const url = new URL(meta.nextPage);
      const params: any = {};
      url.searchParams.forEach((value, key) => {
        if (key === 'limit' || key === 'skip') {
          params[key] = parseInt(value);
        }
      });

      // Load next page
      if (dataType === 'cohort') {
        // Note: This is a simplified approach. In a real app, you'd call the service directly
        // For now, we'll assume the hook handles pagination, but since SWR doesn't, we'll skip
      } else {
        // Same for grids
      }
      setLoadingMore(false);
    }
  }, [cohortsData, gridsData, dataType, loadingMore]);

  // Filter items based on search query
  const filteredItems = currentItems?.filter((item: any) => {
    if (!searchQuery) return true;
    const itemName = (item.name || item.long_name || '').toLowerCase();
    return itemName.includes(searchQuery.toLowerCase());
  });

  // Handle copy URL functionality
  const handleCopyUrl = async (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const itemName = (item.name || item.long_name || '')
      .toLowerCase()
      .replace(/\s+/g, '-');
    const url = `${window.location.origin}/billboard/${dataType}/${encodeURIComponent(itemName)}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopiedItemId(item._id);
      setTimeout(() => setCopiedItemId(null), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set first item as default when data loads or handle prop-based item selection
  useEffect(() => {
    if (!isMountedRef.current) return;

    const items =
      dataType === 'cohort' ? cohortsData?.cohorts : gridsData?.grids;
    const isLoading = dataType === 'cohort' ? cohortsLoading : gridsLoading;

    if (isLoading) {
      setDataLoaded(false);
      return;
    }

    // Data is loaded
    if (!items?.length) {
      setDataLoaded(true);
      setSelectedItem(null);
      return;
    }

    // If a specific item name is provided via props, find and select it
    if (propItemName && !selectedItem) {
      const normalizedPropName = propItemName
        .toLowerCase()
        .replace(/[-_\s]/g, '');
      const matchedItem = items.find((item: any) => {
        const itemName = (item.long_name || item.name || '')
          .toLowerCase()
          .replace(/[-_\s]/g, '');
        return itemName === normalizedPropName;
      });

      if (matchedItem) {
        setSelectedItem(matchedItem);
        // Reset indices when selecting a specific item
        setCurrentSiteIndex(0);
        setCurrentDeviceIndex(0);
      } else {
        // Fallback to first item if requested item not found
        setSelectedItem(items[0]);
        setCurrentSiteIndex(0);
        setCurrentDeviceIndex(0);
      }
    }

    // Otherwise, select the first item if none is selected
    if (!selectedItem) {
      setSelectedItem(items[0]);
      setCurrentSiteIndex(0);
      setCurrentDeviceIndex(0);
    }

    setDataLoaded(true);
  }, [
    cohortsData,
    gridsData,
    cohortsLoading,
    gridsLoading,
    dataType,
    selectedItem,
    propItemName,
  ]);

  // Clear data when dataType changes
  useEffect(() => {
    // Clear old cache entries when switching data types
    if (dataType === 'grid') {
      // Clear cohort-related cache
      mutate(
        (key) => typeof key === 'string' && key.startsWith('cohortsSummary'),
      );
      mutate(
        (key) =>
          typeof key === 'string' && key.startsWith('cohortMeasurements'),
      );
    } else {
      // Clear grid-related cache
      mutate(
        (key) => typeof key === 'string' && key.startsWith('gridsSummary'),
      );
      mutate(
        (key) => typeof key === 'string' && key.startsWith('gridMeasurements'),
      );
    }

    setSelectedItem(null);
    setCurrentMeasurement(null);
    setCurrentSiteIndex(0);
    setCurrentDeviceIndex(0);
    setAllCohorts([]);
    setAllGrids([]);
  }, [dataType]);

  // Update current measurement based on current index - does NOT increment index
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
        if (dataType === 'grid') {
          // For grids: display measurement at current site index
          const index = currentSiteIndex % validMeasurements.length;
          setCurrentMeasurement(validMeasurements[index]);
        } else {
          // For cohorts: display measurement at current device index
          const index = currentDeviceIndex % validMeasurements.length;
          setCurrentMeasurement(validMeasurements[index]);
        }
      } else {
        // If no valid measurements, set to first measurement if available
        if (!currentMeasurement && measurements.length > 0) {
          setCurrentMeasurement(measurements[0]);
        }
      }
    }
  }, [
    cohortMeasurements,
    gridMeasurements,
    dataType,
    currentSiteIndex,
    currentDeviceIndex,
    currentMeasurement,
  ]);

  // Set initial measurement when measurements data loads
  useEffect(() => {
    if (!isMountedRef.current || !selectedItem) return;

    const measurements =
      dataType === 'cohort'
        ? cohortMeasurements?.measurements
        : gridMeasurements?.measurements;

    // Only update if we have measurements and no current measurement
    if (measurements && measurements.length > 0 && !currentMeasurement) {
      updateMeasurement();
    }
  }, [
    cohortMeasurements?.measurements,
    gridMeasurements?.measurements,
    dataType,
    currentMeasurement,
    updateMeasurement,
    selectedItem,
  ]);

  // For general pages, if selected item has no measurements, try to find another item with measurements
  useEffect(() => {
    if (!isMountedRef.current || propItemName || !selectedItem || !dataLoaded)
      return;

    const measurements =
      dataType === 'cohort'
        ? cohortMeasurements?.measurements
        : gridMeasurements?.measurements;

    // If current item has no measurements, try to find another item
    if (measurements && measurements.length === 0) {
      const items = dataType === 'cohort' ? _allCohorts : _allGrids;
      if (items.length > 1) {
        // Find items that are not the current selected item
        const otherItems = items.filter(
          (item) => item._id !== selectedItem._id,
        );
        if (otherItems.length > 0) {
          // Select a random other item
          const randomIndex = Math.floor(Math.random() * otherItems.length);
          setSelectedItem(otherItems[randomIndex]);
          setCurrentSiteIndex(0);
          setCurrentDeviceIndex(0);
        }
      }
    }
  }, [
    cohortMeasurements?.measurements,
    gridMeasurements?.measurements,
    dataType,
    selectedItem,
    propItemName,
    dataLoaded,
    _allCohorts,
    _allGrids,
  ]);

  // Auto-refresh measurement every 30 seconds - increment index and update
  useEffect(() => {
    if (!isMountedRef.current) return;

    if (measurementRotationRef.current) {
      clearInterval(measurementRotationRef.current);
    }

    measurementRotationRef.current = setInterval(() => {
      if (!isMountedRef.current) return;

      const measurements =
        dataType === 'cohort'
          ? cohortMeasurements?.measurements
          : gridMeasurements?.measurements;

      const validMeasurements = measurements?.filter(
        (m: any) => m.pm2_5 && typeof m.pm2_5.value === 'number',
      );

      if (validMeasurements && validMeasurements.length > 0) {
        if (dataType === 'grid') {
          // Increment site index
          setCurrentSiteIndex((prev) => (prev + 1) % validMeasurements.length);
        } else {
          // Increment device index
          setCurrentDeviceIndex(
            (prev) => (prev + 1) % validMeasurements.length,
          );
        }
      }
    }, 30000);

    return () => {
      if (measurementRotationRef.current) {
        clearInterval(measurementRotationRef.current);
        measurementRotationRef.current = null;
      }
    };
  }, [dataType, cohortMeasurements, gridMeasurements]);

  // Update measurement display when index changes
  useEffect(() => {
    updateMeasurement();
  }, [currentSiteIndex, currentDeviceIndex, updateMeasurement]);

  // Auto-rotate between items (only when no specific item is provided)
  // For grids: cycle through all grids and their sites
  // For cohorts: cycle through all cohorts and their devices
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
        const measurements =
          dataType === 'cohort'
            ? cohortMeasurements?.measurements
            : gridMeasurements?.measurements;

        // Check if we've cycled through all sites/devices in the current item
        const validMeasurements = measurements?.filter(
          (m: any) => m.pm2_5 && typeof m.pm2_5.value === 'number',
        );

        if (dataType === 'grid') {
          // For grids: check if we've shown all sites, then move to random grid
          if (
            !validMeasurements?.length ||
            currentSiteIndex >= validMeasurements.length - 1
          ) {
            // Move to random grid and reset site index
            setCurrentSiteIndex(0);
            const randomIndex = Math.floor(Math.random() * items.length);
            return items[randomIndex] || prevItem;
          }
        } else {
          // For cohorts: check if we've shown all devices, then move to random cohort
          if (
            !validMeasurements?.length ||
            currentDeviceIndex >= validMeasurements.length - 1
          ) {
            // Move to random cohort and reset device index
            setCurrentDeviceIndex(0);
            const randomIndex = Math.floor(Math.random() * items.length);
            return items[randomIndex] || prevItem;
          }
        }

        // Stay on current item, will cycle to next site/device
        return prevItem;
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
    currentSiteIndex,
    currentDeviceIndex,
    cohortMeasurements,
    gridMeasurements,
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

    if (pm25 >= 0 && pm25 <= 9.1) {
      return <AqGood {...iconProps} />;
    } else if (pm25 > 9.1 && pm25 <= 35.5) {
      return <AqModerate {...iconProps} />;
    } else if (pm25 > 35.5 && pm25 <= 55.5) {
      return <AqUnhealthyForSensitiveGroups {...iconProps} />;
    } else if (pm25 > 55.5 && pm25 <= 125.5) {
      return <AqUnhealthy {...iconProps} />;
    } else if (pm25 > 125.5 && pm25 <= 225.5) {
      return <AqVeryUnhealthy {...iconProps} />;
    } else if (pm25 > 225.5 && pm25 <= 500.5) {
      return <AqHazardous {...iconProps} />;
    } else {
      return <AqNoValue {...iconProps} />;
    }
  };

  // Get color directly from PM2.5 value
  const getColorFromPM25 = (pm25: number): string => {
    return getAirQualityColor(getAirQualityCategory(pm25, 'pm2_5'));
  };

  // Get text color for better readability on colored backgrounds
  const getTextColor = (pm25: number): string => {
    const level = categoryToLevel(getAirQualityCategory(pm25, 'pm2_5'));
    // Use black text for light backgrounds (good, moderate)
    // Use white text for dark backgrounds
    return level === 'good' || level === 'moderate' ? '#000000' : '#FFFFFF';
  };

  // Get location name
  const getLocationName = () => {
    if (dataType === 'cohort' && currentMeasurement?.deviceDetails) {
      // For cohort, show device name as-is (no formatting)
      return currentMeasurement.deviceDetails.name || 'Unknown Device';
    }
    if (dataType === 'grid' && currentMeasurement?.siteDetails) {
      // For grid, show site name or search_name
      return (
        currentMeasurement.siteDetails.name ||
        formatDisplayName(currentMeasurement.siteDetails.search_name) ||
        'Unknown Location'
      );
    }
    return 'Unknown Location';
  };

  // Render forecast
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
              className={cn(
                'flex flex-col items-center rounded-lg p-3 min-w-[60px] sm:min-w-[70px]',
                isToday
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-500/30 text-white backdrop-blur-sm',
              )}
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              <span className="font-bold text-sm sm:text-base mb-1">
                {days[dayIndex]}
              </span>
              <span className="text-xs sm:text-sm font-medium mb-2">
                {forecast.pm2_5?.toFixed(2) || '--'}
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
  const categoryObj = pm25Value
    ? getAirQualityCategory(pm25Value, 'pm2_5')
    : 'Invalid';
  const level = categoryToLevel(categoryObj);
  let category = 'Unknown';
  if (categoryObj !== 'Invalid') {
    const info = AIR_QUALITY_INFO[level as keyof typeof AIR_QUALITY_INFO];
    category = info?.label || 'Unknown';
  }

  return (
    <div className={cn('py-8 sm:py-12 lg:py-16 px-4', className)}>
      <div className="max-w-7xl mx-auto">
        {(dataType === 'cohort' && cohortsError) ||
        (dataType === 'grid' && gridsError) ? (
          <div className="flex items-center justify-center min-h-[400px] text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
              <p className="text-lg opacity-90 mb-4">
                Unable to load air quality data. Please check your connection
                and try again.
              </p>
              <button
                onClick={() => {
                  if (dataType === 'cohort') {
                    mutate(`cohortsSummary-${JSON.stringify(cohortsParams)}`);
                  } else {
                    mutate(`gridsSummary-${JSON.stringify(gridsParams)}`);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : selectedItem &&
          (dataType === 'cohort'
            ? cohortMeasurementsError
            : gridMeasurementsError) ? (
          <div className="flex items-center justify-center min-h-[400px] text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Data Unavailable</h2>
              <p className="text-lg opacity-90 mb-4">
                Unable to load air quality measurements for this {dataType}.
                Please try again.
              </p>
              <button
                onClick={() => {
                  if (dataType === 'cohort') {
                    mutate(
                      `cohortMeasurements-${selectedItem._id}-${JSON.stringify({ limit: 80 })}`,
                    );
                  } else {
                    mutate(
                      `gridMeasurements-${selectedItem._id}-${JSON.stringify({ limit: 80 })}`,
                    );
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : !dataLoaded ||
          (selectedItem &&
            (dataType === 'cohort'
              ? cohortMeasurementsLoading
              : gridMeasurementsLoading)) ? (
          <BillboardSkeleton />
        ) : propItemName && !selectedItem ? (
          <div className="flex items-center justify-center min-h-[400px] text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">
                {dataType === 'cohort' ? 'Cohort' : 'Grid'} Not Found
              </h2>
              <p className="text-lg opacity-90">{`The requested ${dataType} "${propItemName}" could not be found.`}</p>
            </div>
          </div>
        ) : !selectedItem ? (
          <BillboardSkeleton />
        ) : !currentMeasurement ? (
          <div className="flex items-center justify-center min-h-[400px] text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
              <p className="text-lg opacity-90 mb-4">
                {`No air quality data is currently available for this ${dataType}.`}
              </p>
              {!propItemName && (
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Reload Page
                </button>
              )}
            </div>
          </div>
        ) : (
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
                      setCurrentMeasurement(null);
                      setCurrentDeviceIndex(0);
                      setCurrentSiteIndex(0);
                      setDataLoaded(false);
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
                      setCurrentMeasurement(null);
                      setCurrentDeviceIndex(0);
                      setCurrentSiteIndex(0);
                      setDataLoaded(false);
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
              <div className="relative z-[100] mb-6 sm:mb-8" ref={dropdownRef}>
                <div className="relative max-w-md">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white/50 backdrop-blur-sm text-sm sm:text-base flex items-center justify-between"
                  >
                    <span>
                      {selectedItem
                        ? formatDisplayName(getDisplayName(selectedItem))
                        : 'Select...'}
                    </span>
                    <FiChevronDown
                      className={cn(
                        'w-5 h-5 transition-transform',
                        isDropdownOpen && 'rotate-180',
                      )}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && currentItems && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl z-[9999] border border-gray-200">
                      {/* Search Bar */}
                      <div className="sticky top-0 bg-white p-3 border-b border-gray-200">
                        <div className="relative">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                            autoFocus
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                              aria-label="Clear search"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="max-h-60 overflow-y-auto">
                        {filteredItems && filteredItems.length > 0 ? (
                          filteredItems.map((item: any) => (
                            <div
                              key={item._id}
                              className="relative group"
                              onMouseEnter={() => setHoveredItemId(item._id)}
                              onMouseLeave={() => setHoveredItemId(null)}
                            >
                              <div className="flex items-center justify-between w-full">
                                <button
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setCurrentMeasurement(null);
                                    setCurrentDeviceIndex(0);
                                    setCurrentSiteIndex(0);
                                    setSearchQuery('');
                                    setIsDropdownOpen(false);
                                  }}
                                  className={cn(
                                    'flex-1 px-4 py-3 text-left text-gray-800 hover:bg-blue-50 transition-colors',
                                    selectedItem?._id === item._id &&
                                      'bg-blue-100 font-semibold',
                                  )}
                                >
                                  {formatDisplayName(
                                    item.name || item.long_name,
                                  )}
                                </button>

                                {/* Copy Icon - Shows on hover */}
                                <button
                                  onClick={(e) => handleCopyUrl(item, e)}
                                  className={cn(
                                    'px-3 py-3 hover:bg-blue-200 transition-all flex items-center justify-center',
                                    hoveredItemId === item._id
                                      ? 'opacity-100 visible'
                                      : 'opacity-0 invisible',
                                  )}
                                  title="Copy URL"
                                >
                                  {copiedItemId === item._id ? (
                                    <span className="text-xs text-green-600 font-semibold whitespace-nowrap">
                                      Copied!
                                    </span>
                                  ) : (
                                    <AqCopy06 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-gray-500 text-sm">
                            No results found for &quot;{searchQuery}&quot;
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                          color: pm25Value
                            ? getColorFromPM25(pm25Value)
                            : '#808080',
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
                          ? getColorFromPM25(pm25Value)
                          : '#808080',
                        color: pm25Value ? getTextColor(pm25Value) : '#FFFFFF',
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
                      {getLocationName()}
                    </span>
                  </div>

                  {/* Last Updated */}
                  <div
                    className="text-xs sm:text-sm text-white/70"
                    style={{ fontFamily: '"Times New Roman", Times, serif' }}
                  >
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

                {/* AirQo Watermark Logo - Bottom Right */}
                {hideControls && (
                  <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-20 opacity-30 hover:opacity-60 transition-opacity">
                    <AqAirQo className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default AirQualityBillboard;
