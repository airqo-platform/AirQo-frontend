import React, { useMemo, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import PageHeading from '@/shared/components/ui/page-heading';
import { DataExportSidebar } from './components/DataExportSidebar';
import { SiteSelectionDialog } from './components/SiteSelectionDialog';
import { SelectedGridsSummary } from './components/SelectedGridsSummary';
import { DataExportPreview } from './components/DataExportPreview';
import { DataExportHeader } from './components/DataExportHeader';
import { DataExportTable } from './components/DataExportTable';
import { DataExportBanner } from './components/DataExportBanner';
import {
  CohortSitesResponse,
  CohortDevicesResponse,
  Grid,
} from '@/shared/types/api';
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
    selectedGridSites,
    selectedGridSiteIds,
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
    setSelectedGridSites,
    setSelectedGridSiteIds,
    setDeviceCategory,
    setDateRange,
    updateTabState,
    handleTabChange,
    handleClearSelections,
  } = useDataExportState();

  // Local state for dialogs
  const [siteSelectionDialogOpen, setSiteSelectionDialogOpen] =
    React.useState(false);
  const [siteSelectionDownloading, setSiteSelectionDownloading] =
    React.useState(false);
  const [selectedGridForSites, setSelectedGridForSites] = React.useState<{
    grid: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    gridType: 'countries' | 'cities';
  } | null>(null);

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
      selectedGridSites,
      selectedGridSiteIds,
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

  // Set device category to lowcost when not on devices tab
  useEffect(() => {
    if (activeTab !== 'devices') {
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
          : Object.keys(selectedGridSiteIds).length > 0 ||
            Object.keys(selectedGridSites).length > 0; // countries and cities use custom or default site selections
    const hasPollutants = selectedPollutants.length > 0;

    return Boolean(hasDateRange && hasSelections && hasPollutants);
  }, [
    dateRange,
    activeTab,
    selectedSiteIds,
    selectedDeviceIds,
    selectedGridSiteIds,
    selectedGridSites,
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
      // For countries/cities, select all sites by default
      setSelectedGridIds(stringIds);
      const newSelectedGridSites: Record<string, string[]> = {};
      if (stringIds.length > 0) {
        const gridData =
          activeTab === 'countries'
            ? processedCountriesData
            : processedCitiesData;
        stringIds.forEach(id => {
          const grid = gridData.find(item => String(item.id) === id);
          if (grid?.sites) {
            const sites = grid.sites as Array<{ _id: string }>;
            const siteIds = sites.map(site => site._id);
            newSelectedGridSites[id] = siteIds;
          } else {
            newSelectedGridSites[id] = [];
          }
        });
      }
      setSelectedGridSites(newSelectedGridSites);
      setSelectedGridSiteIds({}); // Reset custom selection
    }
  };

  // Handle site selection dialog
  const handleSiteSelectionConfirm = async (selectedSiteIds: string[]) => {
    setSiteSelectionDownloading(true);
    try {
      // Set the selected sites for the current grid
      setSelectedGridSiteIds(prev => ({
        ...prev,
        [selectedGridForSites!.grid.id]: selectedSiteIds,
      }));

      // Trigger download
      await handleDownload();

      // Close dialog only on successful download
      setSiteSelectionDialogOpen(false);
      setSelectedGridForSites(null);
    } catch (error) {
      // Error is already handled in handleDownload
      console.error('Download failed:', error);
    } finally {
      setSiteSelectionDownloading(false);
    }
  };

  const handleSiteSelectionCancel = () => {
    setSiteSelectionDialogOpen(false);
    setSiteSelectionDownloading(false);
    setSelectedGridForSites(null);
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

            {/* Selected Grids Summary */}
            {(activeTab === 'countries' || activeTab === 'cities') &&
              selectedGridIds.length > 0 && (
                <SelectedGridsSummary
                  activeTab={activeTab}
                  selectedGridIds={selectedGridIds}
                  processedGridsData={
                    activeTab === 'countries'
                      ? (processedCountriesData as unknown as Grid[])
                      : (processedCitiesData as unknown as Grid[])
                  }
                  selectedGridSiteIds={selectedGridSiteIds}
                  onCustomizeSites={(grid: Grid) => {
                    setSelectedGridForSites({ grid, gridType: activeTab });
                    setSiteSelectionDialogOpen(true);
                  }}
                />
              )}

            <DataExportHeader
              activeTab={activeTab}
              selectedSiteIds={selectedSiteIds}
              selectedDeviceIds={selectedDeviceIds}
              selectedGridIds={selectedGridIds}
              selectedGridSiteIds={selectedGridSiteIds}
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
        selectedGridIds={selectedGridIds}
        selectedGridSiteIds={selectedGridSiteIds}
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

      {/* Site Selection Dialog */}
      {selectedGridForSites && (
        <SiteSelectionDialog
          isOpen={siteSelectionDialogOpen}
          onClose={handleSiteSelectionCancel}
          onConfirm={handleSiteSelectionConfirm}
          sites={selectedGridForSites.grid.sites}
          initialSelectedSiteIds={
            selectedGridSiteIds[selectedGridForSites.grid.id] || []
          }
          gridName={selectedGridForSites.grid.name}
          gridType={
            selectedGridForSites.gridType === 'countries' ? 'country' : 'city'
          }
          isDownloading={siteSelectionDownloading}
        />
      )}
    </div>
  );
};

export default DataExportPage;
