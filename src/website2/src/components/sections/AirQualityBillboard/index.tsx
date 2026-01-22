'use client';

import { useEffect } from 'react';

import BillboardSkeleton from '@/components/skeletons/BillboardSkeleton';
import { useDailyForecast } from '@/hooks/useApiHooks';
import { cn } from '@/lib/utils';

import AirQualityDisplay from './components/AirQualityDisplay';
import BillboardHeader from './components/BillboardHeader';
import ErrorDisplay from './components/ErrorDisplay';
import ItemSelector from './components/ItemSelector';
import { useAirQualityData } from './hooks/useAirQualityData';
import { useBillboardControls } from './hooks/useBillboardControls';
import { useMeasurements } from './hooks/useMeasurements';
import type { AirQualityBillboardProps } from './types';

const AirQualityBillboard = ({
  className,
  hideControls = false,
  autoRotate = false,
  dataType: propDataType,
  itemName: propItemName,
}: AirQualityBillboardProps) => {
  // Custom hooks for state management
  const controls = useBillboardControls(propDataType, propItemName, autoRotate);
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
    handleDataTypeChange,
    handleItemSelect,
    handleCopyUrl,
    dropdownRef,
  } = controls;

  // Data fetching hooks
  const airQualityData = useAirQualityData(dataType, propItemName);
  const {
    cohortsData,
    gridsData,
    allCohorts,
    allGrids,
    cohortsLoading,
    gridsLoading,
    cohortsError,
    gridsError,
    cohortsParams,
    gridsParams,
    clearDataTypeCache,
  } = airQualityData;

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
  const currentItems = dataType === 'cohort' ? allCohorts : allGrids;
  const isLoading = dataType === 'cohort' ? cohortsLoading : gridsLoading;
  const hasError = dataType === 'cohort' ? cohortsError : gridsError;

  // Handle data type change with cache clearing
  const onDataTypeChange = (newDataType: 'cohort' | 'grid') => {
    clearDataTypeCache(newDataType);
    handleDataTypeChange(newDataType);
    resetIndices();
  };

  // Set first item as default when data loads
  useEffect(() => {
    if (isLoading) {
      setDataLoaded(false);
      return;
    }

    const items =
      dataType === 'cohort' ? cohortsData?.cohorts : gridsData?.grids;

    if (!items?.length) {
      setDataLoaded(true);
      handleItemSelect(null); // Reset selection
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
        handleItemSelect(matchedItem);
        resetIndices();
        forceMeasurementsRefresh();
        return;
      } else {
        // Fallback to first item if requested item not found
        handleItemSelect(items[0]);
        resetIndices();
        forceMeasurementsRefresh();
        return;
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
    cohortsData,
    gridsData,
    cohortsLoading,
    gridsLoading,
    dataType,
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
    <div className={cn('py-8 sm:py-12 lg:py-16 px-4', className)}>
      <div className="max-w-7xl mx-auto">
        {/* Error States */}
        {hasError ? (
          <ErrorDisplay
            type="summary"
            dataType={dataType}
            cohortsParams={cohortsParams}
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

            <BillboardHeader
              hideControls={hideControls}
              dataType={dataType}
              onDataTypeChange={onDataTypeChange}
            />

            <ItemSelector
              hideControls={hideControls}
              dataType={dataType}
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
            />

            <AirQualityDisplay
              dataType={dataType}
              currentMeasurement={currentMeasurement}
              forecastData={forecastData}
              hideControls={hideControls}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AirQualityBillboard;
