import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import { usePathname, useRouter } from 'next/navigation';
import PageHeading from '@/shared/components/ui/page-heading';
import { AiDrawerTrigger } from '@/modules/ai/components/AiDrawerTrigger';
import { AiPageContextProvider } from '@/modules/ai/context/ai-page-context';
import { SuccessBanner } from '@/shared/components/ui/banner';
import { DataExportSidebar } from './components/DataExportSidebar';
import { SiteSelectionDialog } from './components/SiteSelectionDialog';
import { DownloadFormatDialog } from './components/DownloadFormatDialog';
import { SelectedGridsSummary } from './components/SelectedGridsSummary';
import { DataExportPreview } from './components/DataExportPreview';
import { DataExportHeader } from './components/DataExportHeader';
import { DataExportTable } from './components/DataExportTable';
import { DataExportBanner } from './components/DataExportBanner';
import { DataExportHelpBanner } from './components/DataExportHelpBanner';
import { DataAvailabilityBanner } from './components/DataAvailabilityBanner';
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
import { useDataAvailabilityCheck } from './hooks/useDataAvailabilityCheck';
import { resolveGridSitesForDownload } from './utils/dataExportRequest';
import {
  getSiteDisplayName,
  getSiteNavigationData,
} from './utils/dataExportUtils';
import {
  buildDownloadFileContent,
  buildDownloadPdfBlob,
  buildDownloadXlsxBlob,
} from './utils/dataExportFile';
import { FREQUENCY_LABELS } from '@/shared/components/charts/constants';
import MoreInsights from '@/modules/location-insights/more-insights';
import AddLocation from '@/modules/location-insights/add-location';
import { trackEvent } from '@/shared/utils/analytics';
import {
  trackFeatureUsage,
  trackDataDownload,
} from '@/shared/utils/enhancedAnalytics';
import { useUser } from '@/shared/hooks/useUser';
import { useRBAC } from '@/shared/hooks';
import { useUserActions } from '@/shared/hooks/useUserActions';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { rememberSiteSlug } from './hooks/useResolveSiteByName';
import { toSiteSlug } from './utils/siteDetails';

type SaveFormat = 'csv' | 'xlsx' | 'pdf';
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

type PreviewData = Record<string, string | number | null>;

const DataExportPage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const posthog = usePostHog();
  const { activeGroup, groups, isLoading: userLoading } = useUser();
  const { switchGroup } = useUserActions();
  const { hasPermission } = useRBAC();
  const canDownload = hasPermission('DATA_EXPORT');

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
  const exportBaseHref = isOrgFlow
    ? `/org/${orgSlugFromPath || ''}/data-export`
    : '/user/data-export';

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
  const [pendingColumnKeys, setPendingColumnKeys] = React.useState<
    string[] | null
  >(null);
  const [pendingDownload, setPendingDownload] =
    React.useState<PreparedDownloadResult | null>(null);
  const [saveFormatDialogOpen, setSaveFormatDialogOpen] = React.useState(false);
  const [savingFormat, setSavingFormat] = React.useState<SaveFormat | null>(
    null
  );
  const [downloadSuccess, setDownloadSuccess] = React.useState<{
    format: string;
    message: string;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const refreshInFlightRef = React.useRef(false);
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
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Auto-dismiss success banner after 10 seconds
  useEffect(() => {
    if (!downloadSuccess) return;
    const timer = setTimeout(() => setDownloadSuccess(null), 10000);
    return () => clearTimeout(timer);
  }, [downloadSuccess]);

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

  // Preview state — built from cached data (no API call needed)
  const [previewRows, setPreviewRows] = useState<PreviewData[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const clearPreviewState = useCallback(() => {
    setPreviewRows([]);
    setPreviewError(null);
    setIsPreviewLoading(false);
    setPreviewOpen(false);
  }, [setPreviewOpen]);

  const clearSelectionState = useCallback(() => {
    handleClearSelections();
    setSelectedSitesCache({});
    setSelectedDevicesCache({});
    setSelectedCountriesCache({});
    setSelectedCitiesCache({});
    setSelectedGridForSites(null);
    setSiteSelectionDialogOpen(false);
    setSiteSelectionDownloading(false);
    setPendingColumnKeys(null);
    setPendingDownload(null);
    setSaveFormatDialogOpen(false);
    setSavingFormat(null);
    setDownloadSuccess(null);
    clearPreviewState();
  }, [clearPreviewState, handleClearSelections]);

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
    [activeTab, handleTabChange, isGroupSyncing, isOrgFlow, posthog]
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
    groupCohortsHook,
    tableData,
    processedSitesData,
    processedDevicesData,
    processedCountriesData,
    processedCitiesData,
  } = useDataExportData(
    activeTab,
    tabStates,
    isOrgFlow,
    activeGroup?.id ?? organizationGroupId,
    deviceCategory,
    selectedDeviceIds,
    selectedDevicesForActions,
    setSelectedDevices,
    isOrgContextReady
  );

  const selectedDeviceNamesForExport = useMemo(() => {
    const source = [...selectedDevicesForActions, ...processedDevicesData];
    const names = selectedDeviceIds.map(id => {
      const device = source.find(item => String(item.id) === id);
      const name = device?.name ?? device?.device_name;
      return typeof name === 'string' && name.trim() && name !== '--'
        ? name.trim()
        : null;
    });

    return names.every(Boolean) ? (names as string[]) : [];
  }, [processedDevicesData, selectedDeviceIds, selectedDevicesForActions]);

  // Compute site names from cache to avoid stale state issues
  const selectedSiteNames = useMemo(
    () =>
      selectedSiteIds.map(id => {
        const cached = selectedSitesCache[id];
        if (cached) {
          const displayName = getSiteDisplayName(cached);
          return displayName === '--' ? id : displayName;
        }
        // Fallback: find in current page data
        const site = processedSitesData.find(item => String(item.id) === id);
        if (!site) return id;

        const displayName = getSiteDisplayName(site);
        return displayName === '--' ? id : displayName;
      }),
    [selectedSiteIds, selectedSitesCache, processedSitesData]
  );

  // Build preview rows from cached data (no API call needed)
  const handleOpenPreview = useCallback(() => {
    if (isPreviewLoading) return;

    setIsPreviewLoading(true);
    setPreviewError(null);
    setPreviewRows([]);

    try {
      let rows: PreviewData[] = [];

      // Derive config-based field values for the preview
      const frequencyLabel =
        FREQUENCY_LABELS[frequency as keyof typeof FREQUENCY_LABELS] ||
        frequency;
      const formatNetwork = (val: unknown): string | null => {
        if (typeof val !== 'string' || !val.trim()) return null;
        return val.trim().toUpperCase();
      };
      const formattedDate = (() => {
        if (!dateRange?.from || !dateRange?.to) return 'Not selected';
        const fmt = (d: Date) =>
          d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        return `${fmt(dateRange.from)} – ${fmt(dateRange.to)}`;
      })();

      if (activeTab === 'sites') {
        rows = selectedSiteIds.map(id => {
          const site = selectedSitesCache[id];
          const name = site ? (site.name ?? site.site_name ?? id) : id;
          const row: PreviewData = {
            id: site?.id ?? id,
            site_name: name as string,
            datetime: formattedDate,
            frequency: frequencyLabel,
            network: formatNetwork(
              site?.network ?? site?.sensor_manufacturer ?? site?.data_provider
            ),
            latitude: (site?.latitude ?? site?.lat ?? null) as
              | string
              | number
              | null,
            longitude: (site?.longitude ?? site?.lng ?? site?.lon ?? null) as
              | string
              | number
              | null,
            site_id: (site?.site_id ?? site?.id ?? id) as string,
          };
          if (site?.search_name) row.search_name = site.search_name as string;
          if (site?.formatted_name)
            row.formatted_name = site.formatted_name as string;
          if (site?.location_name)
            row.location_name = site.location_name as string;
          if (site?.city) row.city = site.city as string;
          if (site?.country) row.country = site.country as string;
          if (site?.data_provider)
            row.data_provider = site.data_provider as string;
          return row;
        });
      } else if (activeTab === 'devices') {
        rows = selectedDeviceIds.map(id => {
          const device = selectedDevicesCache[id];
          const name = device ? (device.name ?? device.device_name ?? id) : id;
          const row: PreviewData = {
            id: device?.id ?? id,
            device_name: name as string,
            datetime: formattedDate,
            frequency: frequencyLabel,
            network: formatNetwork(
              device?.network ??
                device?.sensor_manufacturer ??
                device?.manufacturer
            ),
            device_id: (device?.device_id ?? device?.id ?? id) as string,
            latitude: (device?.latitude ?? device?.lat ?? null) as
              | string
              | number
              | null,
            longitude: (device?.longitude ??
              device?.lng ??
              device?.lon ??
              null) as string | number | null,
          };
          if (device?.site_name) row.site_name = device.site_name as string;
          if (device?.category) row.category = device.category as string;
          return row;
        });
      } else if (activeTab === 'countries' || activeTab === 'cities') {
        // For countries/cities, build preview from selected grid sites
        const resolvedSiteIds = resolveGridSitesForDownload(
          selectedGridIds,
          selectedGridSites,
          selectedGridSiteIds
        );
        const gridData =
          activeTab === 'countries'
            ? processedCountriesData
            : processedCitiesData;

        // Build siteId → siteName and siteId → network lookups from grid data
        const siteIdToName = new Map<string, string>();
        const siteIdToNetwork = new Map<string, string | null>();
        gridData.forEach(grid => {
          const gridNetwork = formatNetwork(
            grid.network ?? grid.sensor_manufacturer
          );
          const sites = grid.sites as
            | Array<{ _id?: string; name?: string }>
            | undefined;
          sites?.forEach(site => {
            if (site._id) {
              siteIdToName.set(String(site._id), String(site.name ?? site._id));
              siteIdToNetwork.set(String(site._id), gridNetwork);
            }
          });
        });

        rows = resolvedSiteIds.map(siteId => ({
          id: siteId,
          site_id: siteId,
          site_name: siteIdToName.get(siteId) ?? siteId,
          datetime: formattedDate,
          frequency: frequencyLabel,
          network: siteIdToNetwork.get(siteId) ?? null,
          latitude: null,
          longitude: null,
        }));
      }

      setPreviewRows(rows);
    } catch {
      setPreviewError('Unable to build data preview. Please try again.');
    } finally {
      setIsPreviewLoading(false);
      setPreviewOpen(true);
    }
  }, [
    isPreviewLoading,
    activeTab,
    dateRange,
    frequency,
    selectedSiteIds,
    selectedDeviceIds,
    selectedSitesCache,
    selectedDevicesCache,
    selectedGridIds,
    selectedGridSites,
    selectedGridSiteIds,
    processedCountriesData,
    processedCitiesData,
    setPreviewOpen,
  ]);

  // A preview is a snapshot of the current export configuration. Close and
  // discard it as soon as a filter or selection changes so stale rows cannot
  // be mistaken for the next export.
  const previewFromTimestamp = dateRange?.from?.getTime();
  const previewToTimestamp = dateRange?.to?.getTime();

  useEffect(() => {
    if (previewOpen) {
      clearPreviewState();
    }
    // previewOpen is intentionally omitted: this effect reacts only to
    // configuration changes, not to opening the preview itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    clearPreviewState,
    dataType,
    previewFromTimestamp,
    previewToTimestamp,
    deviceCategory,
    frequency,
    selectedDeviceIds,
    selectedGridIds,
    selectedGridSiteIds,
    selectedGridSites,
    selectedPollutants,
    selectedSiteIds,
  ]);

  // Actions and event handlers
  const { handleDownload, handleVisualizeData, isDownloading, cancelDownload } =
    useDataExportActions(
      dateRange,
      activeTab,
      selectedSiteNames,
      selectedDeviceNamesForExport,
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
    isGroupSyncing || groupCohortsHook.isLoading || currentHook.isLoading;
  const tableRefreshing =
    !tableLoading && (currentHook.isValidating || isRefreshing);
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
      toast.info(
        'Data Type Updated',
        'Reference monitors only provide raw data. Data type has been set to Raw.'
      );
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
      cancelDownload();
      resetGroupScopedState(true);
      clearSelectionState();
    }

    previousGroupIdRef.current = currentGroupId;
  }, [
    activeGroup?.id,
    cancelDownload,
    clearSelectionState,
    resetGroupScopedState,
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
  const selectedGridSiteCount = useMemo(
    () =>
      resolveGridSitesForDownload(
        selectedGridIds,
        selectedGridSites,
        selectedGridSiteIds
      ).length,
    [selectedGridIds, selectedGridSites, selectedGridSiteIds]
  );

  const isDownloadReady = useMemo(() => {
    const hasDateRange = dateRange?.from && dateRange?.to;
    const hasSelections =
      activeTab === 'sites'
        ? selectedSiteIds.length > 0
        : activeTab === 'devices'
          ? selectedDeviceIds.length > 0
          : selectedGridSiteCount > 0;
    const hasPollutants = selectedPollutants.length > 0;

    return Boolean(hasDateRange && hasSelections && hasPollutants);
  }, [
    dateRange,
    activeTab,
    selectedSiteIds,
    selectedDeviceIds,
    selectedGridSiteCount,
    selectedPollutants,
  ]);

  // Data availability check — verifies which selected locations have
  // measurement data for the current date range and pollutants.
  // Build a siteId → display name map so the banner shows human-readable
  // names instead of raw IDs.
  const availabilitySiteNameMap = useMemo(() => {
    const map: Record<string, string> = {};

    if (activeTab === 'sites') {
      selectedSiteIds.forEach(id => {
        const cached = selectedSitesCache[id];
        if (cached) {
          const displayName = getSiteDisplayName(cached);
          if (displayName && displayName !== '--') {
            map[id] = displayName;
          }
        }
      });
    } else if (activeTab === 'devices') {
      // For devices, map each resolved site ID to the first device name
      // found that links to it, falling back to site name from cache.
      selectedDeviceIds.forEach(deviceId => {
        const device = selectedDevicesCache[deviceId];
        if (!device) return;
        const siteId = (device.site_id ?? device.siteId) as string | undefined;
        if (!siteId || !siteId.trim()) return;
        const trimmedSiteId = siteId.trim();
        if (!map[trimmedSiteId]) {
          const deviceName =
            device.name || device.device_name;
          const nameStr =
            typeof deviceName === 'string' &&
            deviceName.trim() &&
            deviceName !== '--'
              ? deviceName.trim()
              : undefined;
          if (nameStr) {
            map[trimmedSiteId] = nameStr;
          }
        }
      });
    } else {
      // countries / cities: resolve names from the grid data
      const gridData =
        activeTab === 'countries'
          ? processedCountriesData
          : processedCitiesData;
      gridData.forEach(grid => {
        const sites = grid.sites as
          | Array<{ _id?: string; name?: string; search_name?: string }>
          | undefined;
        sites?.forEach(site => {
          if (site._id) {
            const displayName = getSiteDisplayName(site);
            if (displayName && displayName !== '--') {
              map[String(site._id)] = displayName;
            }
          }
        });
      });
    }

    return map;
  }, [
    activeTab,
    selectedSiteIds,
    selectedSitesCache,
    selectedDeviceIds,
    selectedDevicesCache,
    processedCountriesData,
    processedCitiesData,
  ]);

  const availability = useDataAvailabilityCheck(
    activeTab,
    selectedSiteIds,
    selectedDeviceIds,
    selectedGridIds,
    selectedGridSites,
    selectedGridSiteIds,
    selectedDevicesCache,
    dateRange,
    availabilitySiteNameMap
  );

  // When no data is available, the download button should guide the user
  // instead of showing "Review & Download".
  const hasNoData = isDownloadReady && availability.aggregateStatus === 'none';

  // Handle table selection changes
  const handleSelectedItemsChange = (selectedIds: (string | number)[]) => {
    const stringIds = selectedIds.map(id => String(id));
    if (activeTab === 'sites') {
      setSelectedSiteIds(stringIds);
      // For sites, get human-readable names from processedSitesData
      const siteNames = stringIds.map(id => {
        const site = processedSitesData.find(item => String(item.id) === id);
        return site
          ? String(site.name || site.search_name || site.location_name || id)
          : id;
      });
      setSelectedSites(siteNames);
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
      const newSelectedGridSites: Record<string, string[]> = {
        ...selectedGridSites,
      };
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
          } else if (
            !Object.prototype.hasOwnProperty.call(newSelectedGridSites, id)
          ) {
            newSelectedGridSites[id] = [];
          }
        });
      }
      Object.keys(newSelectedGridSites).forEach(gridId => {
        if (!stringIds.includes(gridId)) {
          delete newSelectedGridSites[gridId];
        }
      });
      setSelectedGridSites(newSelectedGridSites);
      const selectedGridIdSet = new Set(stringIds);
      const retainedCustomSelections = Object.fromEntries(
        Object.entries(selectedGridSiteIds).filter(([gridId]) =>
          selectedGridIdSet.has(gridId)
        )
      );
      setSelectedGridSiteIds(retainedCustomSelections);

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

  const handleTableRowClick = useCallback(
    (item: TableItem) => {
      if (activeTab !== 'sites' && activeTab !== 'devices') return;

      const navigationData = getSiteNavigationData(
        item,
        activeTab === 'devices' ? 'device' : 'site'
      );

      if (!navigationData) {
        toast.warning(
          'Location details unavailable',
          activeTab === 'devices'
            ? 'This device is not linked to a monitoring site.'
            : 'This row does not contain a valid site ID.'
        );
        return;
      }

      const slug = toSiteSlug(navigationData.displayName);
      rememberSiteSlug(slug, navigationData);
      router.push(
        `${exportBaseHref}/sites/${slug}?site_id=${encodeURIComponent(navigationData.siteId)}`
      );
    },
    [activeTab, exportBaseHref, router]
  );

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
    if (!selectedGridForSites) {
      return;
    }

    setSiteSelectionDownloading(true);
    try {
      const nextSelectedGridSiteIds = {
        ...selectedGridSiteIds,
        [selectedGridForSites.grid._id]: selectedSiteIds,
      };
      setSelectedGridSiteIds(nextSelectedGridSiteIds);

      // Trigger download with the updated selections
      const preparedDownload = await handleDownload({
        customSelectedGridSiteIds: nextSelectedGridSiteIds,
      });

      // Store prepared download and open format dialog directly
      if (preparedDownload) {
        setSiteSelectionDialogOpen(false);
        setSelectedGridForSites(null);
        setPendingDownload(preparedDownload);
        setSaveFormatDialogOpen(true);
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
    if (isGroupSyncing || isRefreshing || refreshInFlightRef.current) {
      return;
    }

    refreshInFlightRef.current = true;
    setIsRefreshing(true);
    try {
      await currentHook.mutate?.();
      toast.success('Data refreshed', 'The current table has been updated.');
    } catch (error) {
      console.error('Failed to refresh export data:', error);
      toast.error('Refresh failed', 'We could not refresh the data.');
    } finally {
      refreshInFlightRef.current = false;
      if (isMountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [currentHook, isGroupSyncing, isRefreshing]);

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
        const blob = await buildDownloadPdfBlob(
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
      } else if (format === 'xlsx') {
        const blob = buildDownloadXlsxBlob(
          download.response,
          download.selectedColumnKeys,
          {
            activeTab: download.activeTab,
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

      trackDataDownload(posthog, {
        dataType: dataType as 'calibrated' | 'raw',
        fileType: format as 'csv' | 'json',
        frequency: frequency as 'hourly' | 'daily' | 'monthly',
        pollutants: selectedPollutants,
        locationCount: download.locationCount,
        startDate: dateRange?.from?.toISOString() || '',
        endDate: dateRange?.to?.toISOString() || '',
        durationDays: download.summaryItems.find(
          item => item.label === 'Date range'
        )
          ? 1
          : 0,
        source: activeTab as 'sites' | 'devices' | 'countries' | 'cities',
        datasetLabel: download.summaryItems.find(
          item => item.label === 'Source'
        )?.value,
        timePeriodType:
          download.summaryItems.find(item => item.label === 'Frequency')
            ?.value === 'daily'
            ? 'historical'
            : 'real_time',
      });

      trackEvent('data_export_saved', {
        active_tab: download.activeTab,
        save_format: format,
        fallback_applied: download.fallbackApplied,
      });

      const savedLabel = format.toUpperCase();
      const savedMessage =
        format === 'pdf'
          ? 'Your professional PDF summary has been saved.'
          : format === 'xlsx'
            ? 'Your Excel workbook has been saved with one sheet per location.'
            : format === 'csv'
              ? 'Your CSV file has been saved.'
              : 'Your JSON file has been saved.';

      setDownloadSuccess({ format: savedLabel, message: savedMessage });
      setSaveFormatDialogOpen(false);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';

      if (format === 'pdf' && /export too large for pdf/i.test(errorMessage)) {
        toast.error('PDF Too Large', errorMessage);
      } else {
        toast.error(
          'Save Failed',
          `${errorMessage || 'We could not save the file.'} Click a format button to retry.`
        );
      }

      return false;
    }
  };

  const handleSaveFormatSelection = async (format: SaveFormat) => {
    setSavingFormat(format);

    try {
      // Use pendingDownload if already prepared (from grid site selection),
      // otherwise make the API call now that user has chosen a format
      const preparedDownload =
        pendingDownload ??
        (await handleDownload({
          exportColumnKeys: pendingColumnKeys ?? undefined,
        }));

      if (!preparedDownload) {
        setSavingFormat(null);
        return;
      }

      const saved = await savePreparedDownload(preparedDownload, format);

      if (saved) {
        setPendingDownload(null);
        setPendingColumnKeys(null);
      }
    } catch {
      toast.error(
        'Download Failed',
        'We could not complete your download. Please try again.'
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

  const handleToggleHelpBanner = () => {
    setShowHelpBanner(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('hideDataExportHelpBanner', String(!next));
      }
      return next;
    });
  };

  // Compute the total selection count for the current tab
  const selectionCount = useMemo(() => {
    if (activeTab === 'sites') return selectedSiteIds.length;
    if (activeTab === 'devices') return selectedDeviceIds.length;
    // countries/cities: count selected grid IDs
    return selectedGridIds.length;
  }, [activeTab, selectedSiteIds, selectedDeviceIds, selectedGridIds]);

  // Export location count — on grid tabs a "location" is a monitoring site
  const exportLocationCount = useMemo(() => {
    if (activeTab === 'sites') return selectedSiteIds.length;
    if (activeTab === 'devices') return selectedDeviceIds.length;
    return selectedGridSiteCount;
  }, [activeTab, selectedSiteIds, selectedDeviceIds, selectedGridSiteCount]);

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
    <AiPageContextProvider
      value={{
        pageTitle: 'Visualization & Data Export',
        pageDescription:
          'Download air quality measurement data for selected locations.',
        data: {
          activeTab,
          selectedSiteCount: selectedSiteIds.length,
          selectedDeviceCount: selectedDeviceIds.length,
          dateRange: dateRange
            ? {
                from: dateRange.from?.toISOString?.() ?? null,
                to: dateRange.to?.toISOString?.() ?? null,
              }
            : null,
        },
      }}
    >
    <div className="flex flex-col">
      {/* Page Header */}
      <PageHeading
        title="Custom Data Downloads"
        subtitle="Select any number of locations across Africa to download comprehensive air quality datasets with flexible date ranges and formats."
        action={<AiDrawerTrigger />}
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
              selectedGridSiteCount={selectedGridSiteCount}
              selectedPollutants={selectedPollutants}
              deviceCategory={deviceCategory}
              isDownloadReady={isDownloadReady}
              sitesData={displaySitesData}
              devicesData={displayDevicesData}
              isLoadingSites={
                isGroupSyncing ||
                groupCohortsHook.isLoading ||
                sitesHook.isLoading
              }
              isLoadingDevices={
                isGroupSyncing ||
                groupCohortsHook.isLoading ||
                devicesHook.isLoading
              }
              pathname={pathname}
            />

            {/* Data Availability Banner */}
            {isDownloadReady && (
              <DataAvailabilityBanner
                aggregateStatus={availability.aggregateStatus}
                totalSites={availability.totalSites}
                sitesWithData={availability.sitesWithData}
                sitesWithoutData={availability.sitesWithoutData}
                siteDetails={availability.siteDetails}
                activeTab={activeTab}
                isDownloadReady={isDownloadReady}
                onChangeFilters={() => setSidebarOpen(true)}
                onChooseLocations={() => setSidebarOpen(true)}
              />
            )}

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
                  selectedGridSites={selectedGridSites}
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
              isPreviewLoading={isPreviewLoading}
              isGroupSyncing={isGroupSyncing}
              canDownload={canDownload}
              onRefresh={handleRefreshCurrentTab}
              isRefreshing={isRefreshing}
              onTabChange={wrappedHandleTabChange}
              onClearSelections={clearSelectionState}
              onVisualizeData={handleVisualizeData}
              onDownload={handleOpenPreview}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              sidebarOpen={sidebarOpen}
              isOrgFlow={isOrgFlow}
              showHelpBanner={showHelpBanner}
              onToggleHelpBanner={handleToggleHelpBanner}
              selectionCount={selectionCount}
              hasNoData={hasNoData}
            />

            {/* Download Success Banner */}
            {downloadSuccess && (
              <SuccessBanner
                dense
                dismissible
                onDismiss={() => setDownloadSuccess(null)}
                title={`Saved as ${downloadSuccess.format}`}
                message={downloadSuccess.message}
              />
            )}

            <DataExportTable
              activeTab={activeTab}
              tableData={displayTableData}
              columns={config.columns}
              loading={tableLoading}
              isRefreshing={tableRefreshing}
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
              onRowClick={handleTableRowClick}
            />
          </div>
        </main>
      </div>

      {/* Data Export Preview Dialog */}
      <DataExportPreview
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onConfirm={(selectedColumnKeys: string[]) => {
          setPendingColumnKeys(selectedColumnKeys);
          setPreviewOpen(false);
          setSaveFormatDialogOpen(true);
        }}
        onRetryPreview={handleOpenPreview}
        isDownloading={isDownloading}
        previewRows={previewRows}
        isFetchingPreview={isPreviewLoading}
        previewError={previewError}
        dataType={dataType}
        frequency={frequency}
        fileType={fileType}
        selectedPollutants={selectedPollutants}
        dateRange={dateRange}
        activeTab={activeTab}
        selectedSites={selectedSites}
        selectedDevices={selectedDeviceNamesForExport}
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
            selectedGridSiteIds[selectedGridForSites.grid._id] ??
            selectedGridSites[selectedGridForSites.grid._id] ??
            []
          }
          gridName={selectedGridForSites.grid.name}
          detailsBaseHref={exportBaseHref}
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
            setPendingColumnKeys(null);
          }
        }}
        onSave={handleSaveFormatSelection}
        locationCount={exportLocationCount}
      />

    </div>
    </AiPageContextProvider>
  );
};

export default DataExportPage;
