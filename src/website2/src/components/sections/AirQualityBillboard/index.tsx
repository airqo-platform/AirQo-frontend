'use client';

import { useEffect } from 'react';

import { useDailyForecast } from '@/hooks/useApiHooks';
import { cn } from '@/lib/utils';

import AirQualityDisplay from './components/AirQualityDisplay';
import BillboardHeader from './components/BillboardHeader';
import ErrorDisplay from './components/ErrorDisplay';
import { useAirQualityData } from './hooks/useAirQualityData';
import { useBillboardControls } from './hooks/useBillboardControls';
import { useMeasurements } from './hooks/useMeasurements';
import BillboardSkeleton from './skeletons/BillboardSkeleton';
import type { AirQualityBillboardProps } from './types';

const AirQualityBillboard = ({
  className,
  hideControls = false,
  autoRotate = false,
  itemName: propItemName,
  centered = false,
  hideDropdown = false,
}: AirQualityBillboardProps) => {
  // Custom hooks for state management
  const controls = useBillboardControls('grid', propItemName, autoRotate);
  const {
    dataType,
    selectedItem,
    dataLoaded,
    searchQuery,
    isDropdownOpen,
    hoveredItemId,
    copiedItemId,
    setDataLoaded,
    setHoveredItemId,
    setSearchQuery,
    setIsDropdownOpen,
    handleItemSelect,
    handleCopyUrl,
    dropdownRef,
  } = controls;

  // Data fetching hooks
  const airQualityData = useAirQualityData(dataType, propItemName);
  const { gridsData, allGrids, gridsLoading, gridsError, gridsParams } =
    airQualityData;

  // Measurements hook
  const measurements = useMeasurements(dataType, selectedItem);
  const {
    currentMeasurement,
    measurementsLoading,
    measurementsError,
    forceMeasurementsRefresh,
    resetIndices,
  } = measurements;

  // Forecast data
  const { data: forecastData } = useDailyForecast(
    currentMeasurement?.site_id || null,
  );

  // Get current items for selector
  const currentItems = allGrids;
  const isLoading = gridsLoading;
  const hasError = gridsError;

  // Set first item as default when data loads
  useEffect(() => {
    if (isLoading) {
      setDataLoaded(false);
      return;
    }

    const items = gridsData?.grids;

    if (!items?.length) {
      setDataLoaded(true);
      handleItemSelect(null); // Reset selection
      return;
    }

    // If a specific item name is provided via props, find and select it
    if (propItemName) {
      const normalizedPropName = propItemName
        .toLowerCase()
        .replace(/[-_\s]/g, '');
      const normalizedSelectedName = selectedItem
        ? (selectedItem.long_name || selectedItem.name || '')
            .toLowerCase()
            .replace(/[-_\s]/g, '')
        : '';

      if (!selectedItem || normalizedPropName !== normalizedSelectedName) {
        const matchedItem = items.find((item: any) => {
          const itemName = (item.long_name || item.name || '')
            .toLowerCase()
            .replace(/[-_\s]/g, '');
          return itemName === normalizedPropName;
        });

        if (matchedItem) {
          handleItemSelect(matchedItem);
          resetIndices();
          forceMeasurementsRefresh();
          setDataLoaded(true);
          return;
        } else {
          // Leave selection empty when requested item not found
          // This allows the "Not Found" UI to render
          handleItemSelect(null);
          setDataLoaded(true);
          return;
        }
      }
    }

    // Otherwise, select the first item if none is selected
    if (!selectedItem) {
      handleItemSelect(items[0]);
      resetIndices();
      forceMeasurementsRefresh();
    }

    setDataLoaded(true);
  }, [
    gridsData,
    gridsLoading,
    selectedItem,
    propItemName,
    setDataLoaded,
    handleItemSelect,
    resetIndices,
    forceMeasurementsRefresh,
    isLoading,
  ]);

  // Handle item selection with measurements refresh
  const onItemSelect = (item: any) => {
    handleItemSelect(item);
    resetIndices();
    forceMeasurementsRefresh();
  };

  return (
    <div
      className={cn(
        centered
          ? 'h-screen w-full flex items-center justify-center overflow-hidden p-1 sm:p-2'
          : 'py-6 sm:py-8 lg:py-12 px-4',
        className,
      )}
      style={
        centered
          ? {
              height: '100dvh', // Dynamic viewport height for mobile browsers
            }
          : undefined
      }
    >
      <div
        className={cn(
          'w-full flex items-center justify-center',
          centered ? 'h-full max-w-full' : 'max-w-7xl mx-auto',
        )}
      >
        {/* Error States */}
        {hasError ? (
          <ErrorDisplay
            type="summary"
            dataType={dataType}
            gridsParams={gridsParams}
          />
        ) : selectedItem && measurementsError ? (
          <ErrorDisplay
            type="measurements"
            dataType={dataType}
            selectedItem={selectedItem}
          />
        ) : !dataLoaded || (selectedItem && measurementsLoading) ? (
          <BillboardSkeleton />
        ) : propItemName && !selectedItem ? (
          <BillboardSkeleton centered={centered} />
        ) : !selectedItem ? (
          <BillboardSkeleton centered={centered} />
        ) : (
          <div
            className={cn(
              'w-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-2xl text-white shadow-2xl relative overflow-hidden',
              centered ? 'h-full' : 'min-h-[500px]',
            )}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
            </div>

            <div className="relative z-10 h-full flex flex-col p-3 sm:p-4 lg:p-6 gap-3 sm:gap-4 lg:gap-5">
              <BillboardHeader
                hideControls={hideControls}
                selectedItem={selectedItem}
                items={currentItems}
                searchQuery={searchQuery}
                isDropdownOpen={isDropdownOpen}
                hoveredItemId={hoveredItemId}
                copiedItemId={copiedItemId}
                onItemSelect={onItemSelect}
                onCopyUrl={handleCopyUrl}
                onSearchChange={setSearchQuery}
                onDropdownToggle={() => setIsDropdownOpen(!isDropdownOpen)}
                onHover={setHoveredItemId}
                dropdownRef={dropdownRef}
                currentMeasurement={currentMeasurement}
                centered={centered}
                hideDropdown={hideDropdown}
              />

              <AirQualityDisplay
                dataType={dataType}
                currentMeasurement={currentMeasurement}
                forecastData={forecastData}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AirQualityBillboard;
