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
import { DataExportHelpBanner } from './components/DataExportHelpBanner';
import { VideoTutorialDialog } from './components/VideoTutorialDialog';
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
  TableItem,
} from './types/dataExportTypes';
import { getTabConfig } from './utils/tableConfig';
import { useDataExportState } from './hooks/useDataExportState';
import { useDataExportActions } from './hooks/useDataExportActions';
import { useDataExportData } from './hooks/useDataExportData';
import MoreInsights from '@/modules/location-insights/more-insights';
import AddLocation from '@/modules/location-insights/add-location';

const rebuildSelectionCache = (
  selectedIds: string[],
  currentPageData: TableItem[],
  previousCache: Record<string, TableItem>
): Record<string, TableItem> => {
  const selectedIdSet = new Set(selectedIds);
  const nextCache: Record<string, TableItem> = {};

  // Keep previously captured metadata for still-selected rows.
  selectedIds.forEach(id => {
    const cachedItem = previousCache[id];
    if (cachedItem) {
      nextCache[id] = cachedItem;
    }
  });

  // Refresh/add metadata from the currently loaded page.
  currentPageData.forEach(item => {
    const itemId = String(item.id);
    if (selectedIdSet.has(itemId)) {
      nextCache[itemId] = item;
    }
  });

  return nextCache;
};

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
  const [tutorialOpen, setTutorialOpen] = React.useState(false);
  const [selectedSitesCache, setSelectedSitesCache] = React.useState<
    Record<string, TableItem>
  >({});
  const [selectedDevicesCache, setSelectedDevicesCache] = React.useState<
    Record<string, TableItem>
  >({});
  const [showHelpBanner, setShowHelpBanner] = React.useState(() => {
    // Check if user has dismissed the banner before
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hideDataExportHelpBanner') !== 'true';
    }
    return true;
  });

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
  const selectedDevicesForActions = useMemo(
    () => Object.values(selectedDevicesCache),
    [selectedDevicesCache]
  );
  const selectedSitesForActions = useMemo(
    () => Object.values(selectedSitesCache),
    [selectedSitesCache]
  );

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
    selectedDevicesForActions,
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
      selectedSitesForActions.length > 0
        ? selectedSitesForActions
        : processedSitesData,
      selectedDevicesForActions.length > 0
        ? selectedDevicesForActions
        : processedDevicesData,
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

  // BAM device exports under Devices tab always use raw data type
  useEffect(() => {
    if (activeTab === 'devices' && deviceCategory === 'bam' && dataType !== 'raw') {
      setDataType('raw');
    }
  }, [activeTab, deviceCategory, dataType, setDataType]);

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
      setSelectedSitesCache(prevCache =>
        rebuildSelectionCache(stringIds, processedSitesData, prevCache)
      );
    } else if (activeTab === 'devices') {
      setSelectedDeviceIds(stringIds);
      setSelectedDevicesCache(prevCache =>
        rebuildSelectionCache(stringIds, processedDevicesData, prevCache)
      );
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

  // Keep selected sites cache synchronized as table pages/search results change.
  useEffect(() => {
    if (selectedSiteIds.length === 0) {
      setSelectedSitesCache({});
      return;
    }

    setSelectedSitesCache(prevCache =>
      rebuildSelectionCache(selectedSiteIds, processedSitesData, prevCache)
    );
  }, [selectedSiteIds, processedSitesData]);

  // Keep selected devices cache synchronized as table pages/search results change.
  useEffect(() => {
    if (selectedDeviceIds.length === 0) {
      setSelectedDevicesCache({});
      return;
    }

    setSelectedDevicesCache(prevCache =>
      rebuildSelectionCache(selectedDeviceIds, processedDevicesData, prevCache)
    );
  }, [selectedDeviceIds, processedDevicesData]);

  // Handle site selection dialog
  const handleSiteSelectionConfirm = async (selectedSiteIds: string[]) => {
    setSiteSelectionDownloading(true);
    try {
      const nextSelectedGridSiteIds = {
        ...selectedGridSiteIds,
        [selectedGridForSites!.grid._id]: selectedSiteIds,
      };
      setSelectedGridSiteIds(nextSelectedGridSiteIds);

      // Trigger download with the updated selections
      await handleDownload(nextSelectedGridSiteIds);

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

  const handleDismissHelpBanner = () => {
    setShowHelpBanner(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hideDataExportHelpBanner', 'true');
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
      <div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden relative">
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
        <main className="flex-1 flex flex-col overflow-x-hidden overflow-y-auto lg:overflow-hidden transition-all duration-300 ease-in-out">
          <div className="gap-4 md:px-4 flex-col flex flex-1">
            {/* Help Banner */}
            {showHelpBanner && (
              <DataExportHelpBanner
                onShowTutorial={() => setTutorialOpen(true)}
                onDismiss={handleDismissHelpBanner}
              />
            )}

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
        selectedGridSites={selectedGridSites}
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
            selectedGridSiteIds[selectedGridForSites.grid._id] || []
          }
          gridName={selectedGridForSites.grid.name}
          gridType={
            selectedGridForSites.gridType === 'countries' ? 'country' : 'city'
          }
          isDownloading={siteSelectionDownloading}
        />
      )}

      {/* Video Tutorial Dialog */}
      <VideoTutorialDialog
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
      />
    </div>
  );
};

export default DataExportPage;
