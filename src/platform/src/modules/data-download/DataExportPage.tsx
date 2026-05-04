import React, { useMemo, useEffect, useCallback } from 'react';
import { usePostHog } from 'posthog-js/react';
import { usePathname } from 'next/navigation';
import PageHeading from '@/shared/components/ui/page-heading';
import { DataExportSidebar } from './components/DataExportSidebar';
import { SiteSelectionDialog } from './components/SiteSelectionDialog';
import { DownloadFormatDialog } from './components/DownloadFormatDialog';
import { SelectedGridsSummary } from './components/SelectedGridsSummary';
import { DataExportPreview } from './components/DataExportPreview';
import { DataExportHeader } from './components/DataExportHeader';
import { DataExportTable } from './components/DataExportTable';
import { DataExportBanner } from './components/DataExportBanner';
import { DataExportHelpBanner } from './components/DataExportHelpBanner';
import { VideoTutorialDialog } from './components/VideoTutorialDialog';
import { toast } from '@/shared/components/ui/toast';
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
import {
  type PreparedDownloadResult,
  useDataExportActions,
} from './hooks/useDataExportActions';
import { useDataExportData } from './hooks/useDataExportData';
import {
  buildDownloadFileContent,
  buildDownloadPdfBlob,
} from './utils/dataExportFile';
import MoreInsights from '@/modules/location-insights/more-insights';
import AddLocation from '@/modules/location-insights/add-location';
import { trackEvent } from '@/shared/utils/analytics';
import { trackFeatureUsage } from '@/shared/utils/enhancedAnalytics';
import { useUser } from '@/shared/hooks/useUser';
import { useUserActions } from '@/shared/hooks/useUserActions';
import { AccessDenied } from '@/shared/components/AccessDenied';

type SaveFormat = 'csv' | 'pdf';
type FinalSaveFormat = SaveFormat | 'json';

const saveBlobToDisk = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.style.visibility = 'hidden';

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

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
  const posthog = usePostHog();
  const { activeGroup, groups, isLoading: userLoading } = useUser();
  const { switchGroup } = useUserActions();

  // Determine if this is org flow based on pathname
  const isOrgFlow = pathname.includes('/org/');
  const orgSlugFromPath = useMemo(() => {
    if (!isOrgFlow) {
      return null;
    }

    const segments = pathname.split('/').filter(Boolean);
    return segments[1]?.toLowerCase() ?? null;
  }, [isOrgFlow, pathname]);
  const organizationGroup = useMemo(() => {
    if (!isOrgFlow || !orgSlugFromPath) {
      return null;
    }

    return (
      groups?.find(
        group =>
          (group.organizationSlug || '').trim().toLowerCase() ===
          orgSlugFromPath
      ) || null
    );
  }, [groups, isOrgFlow, orgSlugFromPath]);
  const organizationGroupId = organizationGroup?.id || '';
  const isOrgUnresolved =
    isOrgFlow && !userLoading && !!orgSlugFromPath && !organizationGroup;
  const isOrgContextReady =
    !isOrgFlow ||
    (!!organizationGroupId && activeGroup?.id === organizationGroupId);
  const isGroupSyncing = isOrgFlow && !isOrgContextReady && !isOrgUnresolved;

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
    resetGroupScopedState,
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
  const [selectedCountriesCache, setSelectedCountriesCache] = React.useState<
    Record<string, TableItem>
  >({});
  const [selectedCitiesCache, setSelectedCitiesCache] = React.useState<
    Record<string, TableItem>
  >({});
  const [pendingDownload, setPendingDownload] =
    React.useState<PreparedDownloadResult | null>(null);
  const [saveFormatDialogOpen, setSaveFormatDialogOpen] = React.useState(false);
  const [savingFormat, setSavingFormat] = React.useState<SaveFormat | null>(
    null
  );
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const isMountedRef = React.useRef(true);
  const [showHelpBanner, setShowHelpBanner] = React.useState(() => {
    // Check if user has dismissed the banner before
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hideDataExportHelpBanner') !== 'true';
    }
    return true;
  });
  const previousGroupIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isOrgFlow) {
      return;
    }

    if (userLoading || !organizationGroup || isOrgUnresolved) {
      return;
    }

    if (activeGroup?.id !== organizationGroup.id) {
      switchGroup(organizationGroup);
    }
  }, [
    activeGroup?.id,
    isOrgFlow,
    isOrgUnresolved,
    organizationGroup,
    switchGroup,
    userLoading,
  ]);

  // Handle org flow: switch to sites tab if countries or cities is active
  React.useEffect(() => {
    if (isOrgFlow && (activeTab === 'countries' || activeTab === 'cities')) {
      handleTabChange('sites');
    }
  }, [isOrgFlow, activeTab, handleTabChange]);

  // Wrap handleTabChange to prevent org flow from accessing countries/cities
  const wrappedHandleTabChange = useCallback(
    (tab: TabType) => {
      if (isGroupSyncing) {
        return;
      }

      if (isOrgFlow && (tab === 'countries' || tab === 'cities')) {
        return;
      }

      if (tab !== activeTab) {
        trackFeatureUsage(posthog, 'data_export', 'tab_changed', {
          from_tab: activeTab,
          to_tab: tab,
          is_org_flow: isOrgFlow,
        });
        trackEvent('data_export_tab_changed', {
          from_tab: activeTab,
          to_tab: tab,
          is_org_flow: isOrgFlow,
        });
      }

      handleTabChange(tab);
    },
    [activeTab, isGroupSyncing, isOrgFlow, handleTabChange, posthog]
  );

  // Data fetching and processing (initial call with empty array)
  const selectedDevicesForActions = useMemo(
    () =>
      selectedDeviceIds
        .map(id => selectedDevicesCache[id])
        .filter((item): item is TableItem => Boolean(item)),
    [selectedDeviceIds, selectedDevicesCache]
  );
  const selectedCountriesForActions = useMemo(
    () =>
      selectedGridIds
        .map(id => selectedCountriesCache[id])
        .filter((item): item is TableItem => Boolean(item)),
    [selectedCountriesCache, selectedGridIds]
  );
  const selectedCitiesForActions = useMemo(
    () =>
      selectedGridIds
        .map(id => selectedCitiesCache[id])
        .filter((item): item is TableItem => Boolean(item)),
    [selectedCitiesCache, selectedGridIds]
  );
  const selectedSitesForActions = useMemo(
    () =>
      selectedSiteIds
        .map(id => selectedSitesCache[id])
        .filter((item): item is TableItem => Boolean(item)),
    [selectedSiteIds, selectedSitesCache]
  );

  const {
    sitesHook,
    devicesHook,
    currentHook,
    tableData,
    processedSitesData,
    processedDevicesData,
    processedCountriesData,
    processedCitiesData,
  } = useDataExportData(
    activeTab,
    tabStates,
    isOrgFlow,
    deviceCategory,
    selectedDeviceIds,
    selectedDevicesForActions,
    setSelectedDevices,
    isOrgContextReady
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
      selectedCountriesForActions.length > 0
        ? selectedCountriesForActions
        : processedCountriesData,
      selectedCitiesForActions.length > 0
        ? selectedCitiesForActions
        : processedCitiesData
    );

  const currentState = tabStates[activeTab];
  const config = getTabConfig(activeTab);
  const meta = currentHook.data?.meta || { total: 0, page: 1, totalPages: 1 };
  const displayTableData = useMemo(
    () => (isGroupSyncing ? [] : tableData),
    [isGroupSyncing, tableData]
  );
  const displaySitesData = isGroupSyncing
    ? undefined
    : (currentHook.data as CohortSitesResponse | undefined)?.sites;
  const displayDevicesData = isGroupSyncing
    ? undefined
    : (currentHook.data as CohortDevicesResponse | undefined)?.devices;
  const tableLoading =
    isGroupSyncing || (currentHook.isLoading && currentHook.data === undefined);
  const compactTableRows =
    activeTab === 'devices' ||
    activeTab === 'countries' ||
    activeTab === 'cities';

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
    if (
      activeTab === 'devices' &&
      deviceCategory === 'bam' &&
      dataType !== 'raw'
    ) {
      setDataType('raw');
    }
  }, [activeTab, deviceCategory, dataType, setDataType]);

  // Reset group-scoped selections and cached metadata on group switch
  useEffect(() => {
    const currentGroupId = activeGroup?.id ?? null;
    const previousGroupId = previousGroupIdRef.current;

    if (
      currentGroupId &&
      previousGroupId &&
      currentGroupId !== previousGroupId
    ) {
      resetGroupScopedState(!siteSelectionDownloading);
      setPendingDownload(null);
      setSaveFormatDialogOpen(false);
      setSavingFormat(null);
      setSelectedSitesCache({});
      setSelectedDevicesCache({});
      setSelectedCountriesCache({});
      setSelectedCitiesCache({});
      setSelectedGridForSites(null);
      setSiteSelectionDialogOpen(false);
      setSiteSelectionDownloading(false);
    }

    previousGroupIdRef.current = currentGroupId;
  }, [
    activeGroup?.id,
    resetGroupScopedState,
    setPendingDownload,
    setSaveFormatDialogOpen,
    setSavingFormat,
    setSelectedDevicesCache,
    setSelectedGridForSites,
    setSelectedSitesCache,
    setSiteSelectionDialogOpen,
    setSiteSelectionDownloading,
    siteSelectionDownloading,
  ]);

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

      if (activeTab === 'countries') {
        setSelectedCountriesCache(prevCache =>
          rebuildSelectionCache(stringIds, processedCountriesData, prevCache)
        );
      } else {
        setSelectedCitiesCache(prevCache =>
          rebuildSelectionCache(stringIds, processedCitiesData, prevCache)
        );
      }
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

  // Keep selected countries cache synchronized as table pages/search results change.
  useEffect(() => {
    if (activeTab !== 'countries' || selectedGridIds.length === 0) {
      setSelectedCountriesCache({});
      return;
    }

    setSelectedCountriesCache(prevCache =>
      rebuildSelectionCache(selectedGridIds, processedCountriesData, prevCache)
    );
  }, [activeTab, processedCountriesData, selectedGridIds]);

  // Keep selected cities cache synchronized as table pages/search results change.
  useEffect(() => {
    if (activeTab !== 'cities' || selectedGridIds.length === 0) {
      setSelectedCitiesCache({});
      return;
    }

    setSelectedCitiesCache(prevCache =>
      rebuildSelectionCache(selectedGridIds, processedCitiesData, prevCache)
    );
  }, [activeTab, processedCitiesData, selectedGridIds]);

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
      const preparedDownload = await handleDownload({
        customSelectedGridSiteIds: nextSelectedGridSiteIds,
      });

      // Close dialog only on successful download preparation
      if (preparedDownload) {
        setSiteSelectionDialogOpen(false);
        setSelectedGridForSites(null);
        openSaveFormatDialog(preparedDownload);
      }
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

  const handleRefreshCurrentTab = useCallback(async () => {
    if (isGroupSyncing) {
      return;
    }

    setIsRefreshing(true);
    try {
      await currentHook.mutate?.();
    } finally {
      if (isMountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [currentHook, isGroupSyncing]);

  const openSaveFormatDialog = (download: PreparedDownloadResult) => {
    if (fileType === 'json') {
      void savePreparedDownload(download, 'json');
      return;
    }

    setPendingDownload(download);
    setSavingFormat(null);
    setSaveFormatDialogOpen(true);
  };

  const savePreparedDownload = async (
    download: PreparedDownloadResult,
    format: FinalSaveFormat
  ) => {
    try {
      const preserveSelectedColumns =
        download.activeTab === 'countries' || download.activeTab === 'cities';
      const filename = `${download.filenameBase}.${format}`;

      if (format === 'pdf') {
        const titleSuffix =
          download.activeTab.charAt(0).toUpperCase() +
          download.activeTab.slice(1);
        const blob = buildDownloadPdfBlob(
          download.response,
          download.selectedColumnKeys,
          {
            title: `AirQo Data Export - ${titleSuffix}`,
            summaryItems: download.summaryItems,
            footerText: 'Generated by AirQo Data Export',
            preserveSelectedColumns,
          }
        );

        saveBlobToDisk(blob, filename);
      } else {
        const downloadType = format === 'csv' ? 'csv' : 'json';
        const { content, mimeType } = buildDownloadFileContent(
          download.response,
          downloadType,
          download.selectedColumnKeys,
          preserveSelectedColumns
        );

        saveBlobToDisk(new Blob([content], { type: mimeType }), filename);
      }

      trackFeatureUsage(posthog, 'data_export', 'download_saved', {
        active_tab: download.activeTab,
        save_format: format,
        fallback_applied: download.fallbackApplied,
      });

      trackEvent('data_export_saved', {
        active_tab: download.activeTab,
        save_format: format,
        fallback_applied: download.fallbackApplied,
      });

      const savedLabel = format.toUpperCase();
      const savedMessage =
        format === 'pdf'
          ? 'Your professional PDF report has been saved.'
          : format === 'csv'
            ? 'Your CSV file has been saved.'
            : 'Your JSON file has been saved.';

      toast.success(`Saved as ${savedLabel}`, savedMessage);
      setSaveFormatDialogOpen(false);
      setPendingDownload(null);

      return true;
    } catch (error) {
      console.error('Failed to save export:', error);
      const errorMessage = error instanceof Error ? error.message : '';

      if (format === 'pdf' && /export too large for pdf/i.test(errorMessage)) {
        toast.error('PDF Too Large', errorMessage);
      } else {
        toast.error(
          'Save Failed',
          errorMessage || 'We could not save the file. Please try again.'
        );
      }

      if (format === 'json') {
        setSaveFormatDialogOpen(false);
        setPendingDownload(null);
      }

      return false;
    }
  };

  const handleSaveFormatSelection = async (format: SaveFormat) => {
    if (!pendingDownload) {
      return;
    }

    setSavingFormat(format);

    try {
      await savePreparedDownload(pendingDownload, format);
    } catch (error) {
      console.error('Failed to save export:', error);
      toast.error(
        'Save Failed',
        'We could not save the file. Please try again.'
      );
    } finally {
      setSavingFormat(null);
    }
  };

  const handleDismissHelpBanner = () => {
    setShowHelpBanner(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hideDataExportHelpBanner', 'true');
    }
  };

  if (isOrgUnresolved) {
    return (
      <div className="min-h-[400px] p-6">
        <AccessDenied
          title="Organization not found"
          message="We could not resolve that organization slug or you do not have access to it."
          showBackButton={false}
        />
      </div>
    );
  }

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
              sitesData={displaySitesData}
              devicesData={displayDevicesData}
              isLoadingSites={isGroupSyncing || sitesHook.isLoading}
              isLoadingDevices={isGroupSyncing || devicesHook.isLoading}
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
              isGroupSyncing={isGroupSyncing}
              onRefresh={handleRefreshCurrentTab}
              isRefreshing={isRefreshing}
              onTabChange={wrappedHandleTabChange}
              onClearSelections={handleClearSelections}
              onVisualizeData={handleVisualizeData}
              onDownload={() => setPreviewOpen(true)}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              sidebarOpen={sidebarOpen}
              isOrgFlow={isOrgFlow}
            />

            <DataExportTable
              activeTab={activeTab}
              tableData={displayTableData}
              columns={config.columns}
              loading={tableLoading}
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
              compactRows={compactTableRows}
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
        onConfirm={async (selectedColumnKeys: string[]) => {
          try {
            const preparedDownload = await handleDownload({
              exportColumnKeys: selectedColumnKeys,
            });

            if (preparedDownload) {
              setPreviewOpen(false);
              openSaveFormatDialog(preparedDownload);
            }
          } catch (error) {
            console.error('Unexpected download confirmation error:', error);
          }
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

      <DownloadFormatDialog
        isOpen={saveFormatDialogOpen}
        isSaving={savingFormat !== null}
        savingFormat={savingFormat}
        onClose={() => {
          if (!savingFormat) {
            setSaveFormatDialogOpen(false);
            setPendingDownload(null);
          }
        }}
        onSave={handleSaveFormatSelection}
      />
    </div>
  );
};

export default DataExportPage;
