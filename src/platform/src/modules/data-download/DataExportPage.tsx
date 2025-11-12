import React, { useMemo, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import PageHeading from '@/shared/components/ui/page-heading';
import { DataExportSidebar } from './components/DataExportSidebar';
import { DataExportPreview } from './components/DataExportPreview';
import { DataExportHeader } from './components/DataExportHeader';
import { DataExportTable } from './components/DataExportTable';
import { DataExportBanner } from './components/DataExportBanner';
import { CohortSitesResponse, CohortDevicesResponse } from '@/shared/types/api';
import {
  DataType,
  Frequency,
  FileType,
  DeviceCategory,
  TabType,
} from './types/dataExportTypes';
import { getTabConfig } from './utils/tableConfig';
import { useDataExportState } from './hooks/useDataExportState';
import { useDataExportActions } from './hooks/useDataExportActions';
import { useDataExportData } from './hooks/useDataExportData';
import MoreInsights from '@/modules/location-insights/more-insights';
import AddLocation from '@/modules/location-insights/add-location';

const DataExportPage = () => {
  const pathname = usePathname();

  // Determine if this is org flow based on pathname
  const isOrgFlow = pathname.includes('/org/');

  // State management
  const {
    activeTab,
    sidebarOpen,
    previewOpen,
    fileTitle,
    dataType,
    frequency,
    fileType,
    selectedPollutants,
    selectedSites,
    selectedDevices,
    selectedSiteIds,
    selectedDeviceIds,
    selectedGridIds,
    deviceCategory,
    dateRange,
    tabStates,
    setSidebarOpen,
    setPreviewOpen,
    setFileTitle,
    setDataType,
    setFrequency,
    setFileType,
    setSelectedPollutants,
    setSelectedSites,
    setSelectedDevices,
    setSelectedSiteIds,
    setSelectedDeviceIds,
    setSelectedGridIds,
    setDeviceCategory,
    setDateRange,
    updateTabState,
    handleTabChange,
    handleClearSelections,
  } = useDataExportState();

  // Handle org flow: switch to sites tab if countries or cities is active
  React.useEffect(() => {
    if (isOrgFlow && (activeTab === 'countries' || activeTab === 'cities')) {
      handleTabChange('sites');
    }
  }, [isOrgFlow, activeTab, handleTabChange]);

  // Wrap handleTabChange to prevent org flow from accessing countries/cities
  const wrappedHandleTabChange = useCallback(
    (tab: TabType) => {
      if (isOrgFlow && (tab === 'countries' || tab === 'cities')) {
        return;
      }
      handleTabChange(tab);
    },
    [isOrgFlow, handleTabChange]
  );

  // Data fetching and processing (initial call with empty array)
  const {
    currentHook,
    tableData,
    processedSitesData,
    processedDevicesData,
    processedCountriesData,
    processedCitiesData,
  } = useDataExportData(
    activeTab,
    tabStates,
    deviceCategory,
    selectedDeviceIds,
    [], // Initial empty array
    setSelectedDevices
  );

  // Actions and event handlers
  const { handleDownload, handleVisualizeData, isDownloading } =
    useDataExportActions(
      dateRange,
      activeTab,
      selectedSites,
      selectedDevices,
      selectedSiteIds,
      selectedDeviceIds,
      selectedGridIds,
      selectedPollutants,
      dataType,
      fileType,
      frequency,
      deviceCategory,
      fileTitle,
      processedSitesData,
      processedDevicesData,
      processedCountriesData,
      processedCitiesData
    );

  const currentState = tabStates[activeTab];
  const config = getTabConfig(activeTab);
  const meta = currentHook.data?.meta || { total: 0, page: 1, totalPages: 1 };

  // Reset device pagination when category changes
  useEffect(() => {
    if (activeTab === 'devices') {
      updateTabState('devices', { page: 1 });
    }
  }, [deviceCategory, activeTab, updateTabState]);

  // Reset frequency when device category changes
  useEffect(() => {
    if (deviceCategory === 'mobile') {
      setFrequency('raw');
    } else if (frequency === 'raw') {
      setFrequency('daily');
    }
  }, [deviceCategory, frequency, setFrequency]);

  // Set device category to lowcost and disable when sites tab is active
  useEffect(() => {
    if (activeTab === 'sites') {
      setDeviceCategory('lowcost');
    }
  }, [activeTab, setDeviceCategory]);

  // Handle sidebar visibility based on screen size
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSidebarOpen(e.matches);
    };
    // Set initial state
    setSidebarOpen(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setSidebarOpen]);

  // Check if download is ready
  const isDownloadReady = useMemo(() => {
    const hasDateRange = dateRange?.from && dateRange?.to;
    const hasSelections =
      activeTab === 'sites'
        ? selectedSiteIds.length > 0
        : activeTab === 'devices'
          ? selectedDeviceIds.length > 0
          : selectedGridIds.length > 0; // countries and cities use grid IDs
    const hasPollutants = selectedPollutants.length > 0;

    return Boolean(hasDateRange && hasSelections && hasPollutants);
  }, [
    dateRange,
    activeTab,
    selectedSiteIds,
    selectedDeviceIds,
    selectedGridIds,
    selectedPollutants,
  ]);

  // Handle table selection changes
  const handleSelectedItemsChange = (selectedIds: (string | number)[]) => {
    const stringIds = selectedIds.map(id => String(id));
    if (activeTab === 'sites') {
      setSelectedSiteIds(stringIds);
      // For sites, IDs are the same as names for the API
      setSelectedSites(stringIds);
    } else if (activeTab === 'devices') {
      setSelectedDeviceIds(stringIds);
      // For devices, names are set by the data hook
    } else if (activeTab === 'countries' || activeTab === 'cities') {
      // For countries/cities, use exact selection (single selection mode)
      setSelectedGridIds(stringIds);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Page Header */}
      <PageHeading
        title="Custom Data Downloads"
        subtitle="Select any number of locations across Africa to download comprehensive air quality datasets with flexible date ranges and formats."
      />

      {/* Main Layout with Sidebar and Content */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
        <DataExportSidebar
          fileTitle={fileTitle}
          setFileTitle={setFileTitle}
          dataType={dataType}
          setDataType={(value: string) => setDataType(value as DataType)}
          frequency={frequency}
          setFrequency={(value: string) => setFrequency(value as Frequency)}
          fileType={fileType}
          setFileType={(value: string) => setFileType(value as FileType)}
          selectedPollutants={selectedPollutants}
          setSelectedPollutants={setSelectedPollutants}
          dateRange={dateRange}
          setDateRange={setDateRange}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          deviceCategory={deviceCategory}
          setDeviceCategory={(value: string) =>
            setDeviceCategory(value as DeviceCategory)
          }
          activeTab={activeTab}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
          <div className="gap-4 px-4 flex-col flex flex-1">
            {/* Dynamic Banner Notification */}
            <DataExportBanner
              dateRange={dateRange}
              activeTab={activeTab}
              selectedSiteIds={selectedSiteIds}
              selectedDeviceIds={selectedDeviceIds}
              selectedGridIds={selectedGridIds}
              selectedPollutants={selectedPollutants}
              deviceCategory={deviceCategory}
              isDownloadReady={isDownloadReady}
              sitesData={(currentHook.data as CohortSitesResponse)?.sites}
              devicesData={(currentHook.data as CohortDevicesResponse)?.devices}
              isLoadingSites={false} // TODO: Get from hooks
              isLoadingDevices={false} // TODO: Get from hooks
              pathname={pathname}
            />

            <DataExportHeader
              activeTab={activeTab}
              selectedSiteIds={selectedSiteIds}
              selectedDeviceIds={selectedDeviceIds}
              selectedGridIds={selectedGridIds}
              isDownloadReady={isDownloadReady}
              isDownloading={isDownloading}
              onTabChange={wrappedHandleTabChange}
              onClearSelections={handleClearSelections}
              onVisualizeData={handleVisualizeData}
              onPreview={() => setPreviewOpen(true)}
              onDownload={handleDownload}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              sidebarOpen={sidebarOpen}
              isOrgFlow={isOrgFlow}
            />

            <DataExportTable
              activeTab={activeTab}
              tableData={tableData}
              columns={config.columns}
              loading={currentHook.isLoading}
              error={currentHook.error?.message || null}
              currentPage={currentState.page}
              totalPages={meta.totalPages}
              pageSize={currentState.pageSize}
              totalItems={meta.total}
              searchTerm={currentState.search}
              selectedItems={
                activeTab === 'sites'
                  ? selectedSiteIds
                  : activeTab === 'devices'
                    ? selectedDeviceIds
                    : selectedGridIds // countries and cities use grid IDs
              }
              onPageChange={page => updateTabState(activeTab, { page })}
              onPageSizeChange={size =>
                updateTabState(activeTab, { pageSize: size })
              }
              onSearchChange={search => updateTabState(activeTab, { search })}
              onSelectedItemsChange={handleSelectedItemsChange}
            />
          </div>
        </main>
      </div>

      {/* Data Export Preview Dialog */}
      <DataExportPreview
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onConfirm={() => {
          setPreviewOpen(false);
          handleDownload();
        }}
        isDownloading={isDownloading}
        dataType={dataType}
        frequency={frequency}
        fileType={fileType}
        selectedPollutants={selectedPollutants}
        dateRange={dateRange}
        activeTab={activeTab}
        selectedSites={selectedSites}
        selectedDevices={selectedDevices}
        deviceCategory={deviceCategory}
      />

      {/* More Insights Dialog */}
      <MoreInsights
        activeTab={
          activeTab === 'sites' || activeTab === 'devices'
            ? activeTab
            : undefined
        }
      />

      {/* Add Location Dialog */}
      <AddLocation />
    </div>
  );
};

export default DataExportPage;
