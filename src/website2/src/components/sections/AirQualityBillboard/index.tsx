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
  centered = false,
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
        setDataLoaded(true);
        return;
      } else {
        // Leave selection empty when requested item not found
        // This allows the "Not Found" UI to render
        setDataLoaded(true);
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
    <div
      className={cn(
        centered
          ? 'min-h-screen flex items-center justify-center p-4'
          : 'py-4 sm:py-6 lg:py-8 px-4',
        className,
      )}
    >
      <div className={cn(centered ? 'max-w-7xl w-full' : 'max-w-7xl mx-auto')}>
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
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-2xl p-6 sm:p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
            </div>
            <div className="relative z-10 flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    {dataType === 'cohort' ? 'Cohort' : 'Grid'} Not Found
                  </h2>
                  <p className="text-lg sm:text-xl opacity-90 mb-2">
                    {`The requested ${dataType} "${propItemName}" could not be found.`}
                  </p>
                  <p className="text-base opacity-75">
                    Please check the URL or select a different {dataType} from
                    the main billboard page.
                  </p>
                </div>
                <div className="flex justify-center">
                  <a
                    href="/billboard"
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg inline-block"
                  >
                    Back to Billboard
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : !selectedItem ? (
          <BillboardSkeleton />
        ) : !currentMeasurement ? (
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-2xl p-6 sm:p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
            </div>
            <div className="relative z-10 flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    No Data Available
                  </h2>
                  <p className="text-lg sm:text-xl opacity-90 mb-2">
                    {propItemName
                      ? `We're currently unable to retrieve air quality data for "${selectedItem?.name || selectedItem?.long_name || propItemName}".`
                      : `No air quality data is currently available for this ${dataType}.`}
                  </p>
                  <p className="text-base opacity-75">
                    {propItemName
                      ? 'This may be due to temporary connectivity issues or the monitoring station being offline. Please try again later.'
                      : 'Please check back later or try refreshing the page.'}
                  </p>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-2xl p-6 sm:p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
            </div>

            <BillboardHeader hideControls={hideControls} />

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
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AirQualityBillboard;
