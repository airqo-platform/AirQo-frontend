'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { AqGlobe05, AqMarkerPin01, AqMonitor03 } from '@airqo/icons-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import logger from '@/lib/logger';

import {
  DATA_TYPE_OPTIONS,
  FREQUENCY_OPTIONS,
  FILTER_TYPES,
} from './constants';

import {
  useSiteAndDeviceIds,
  usePaginatedSitesSummary,
  usePaginatedDevicesSummary,
  usePaginatedGridsSummary,
  usePaginatedMobileDevices,
} from '@/core/hooks/analyticHooks';

import { getAssignedSitesForGrid } from '@/core/apis/DeviceRegistry';

import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import { useDispatch } from 'react-redux';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';

// Import custom hooks
import {
  useDataDownloadLogic,
  MESSAGE_TYPES,
} from './hooks/useDataDownloadLogic';
import { useDataPreview } from './hooks/useDataPreview';

// Import components
import { DownloadDataHeader, MobileMenuButton } from './components/Header';
import MobileSidebar from './components/MobileSidebar';
import DataPreviewDialog from './components/DataPreviewDialog';
import SettingsSidebar from './components/SettingsSidebar';
import DataContent from './components/DataContent';
import Footer from '../components/Footer';
import InfoMessage from '@/components/Messages/InfoMessage';

// Import utilities
import {
  getDefaultFormData,
  useDurationGuidance,
  useDownloadDisabled,
  useFooterInfo,
  animations,
} from './utils';

/**
 * DataDownload component allows users to download air quality data
 * with various filtering options and preview functionality.
 * Refactored for better maintainability with modular components.
 *
 * @param {Object} props
 * @param {Function} props.onClose - Function to close the modal
 * @param {string} props.sidebarBg - Background color for sidebar
 */
const DataDownload = ({
  onClose,
  sidebarBg = '#f6f6f7',
  resetOnClose = false,
  backToDownload = true,
}) => {
  const dispatch = useDispatch();

  // Theme
  const { theme, systemTheme } = useTheme();
  const darkMode = useMemo(() => {
    return theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  }, [theme, systemTheme]);

  // Get active group info
  const { title: groupTitle } = useGetActiveGroup();

  // Use custom hooks for data download logic
  const {
    selectedItems,
    clearSelected,
    formError,
    messageType,
    statusMessage,
    downloadLoading,
    filterErrors,
    edit,
    activeFilterKey,
    selectedGridId,
    setSelectedItems,
    setFormError,
    setMessageType,
    setStatusMessage,
    setFilterErrors,
    setEdit,
    setActiveFilterKey,
    clearSelections,
    handleClearSelection,
    handleToggleItem,
    handleDownload,
    activeGroupId,
  } = useDataDownloadLogic();

  // Use preview hook
  const {
    previewData,
    previewLoading,
    previewError,
    selectedColumns,
    generatePreview,
    toggleColumn,
    resetColumns,
    clearPreview,
  } = useDataPreview();

  // Mobile UI state
  const [isMobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isFetchingAssignedSites, setIsFetchingAssignedSites] = useState(false);

  // Form state with defaults
  const [formData, setFormData] = useState(getDefaultFormData());

  // Enhanced close handler for resetOnClose
  const handleClose = useCallback(() => {
    if (resetOnClose) {
      setFormData(getDefaultFormData());
      clearSelections();
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  }, [resetOnClose, setFormData, clearSelections, onClose]);

  // Filter data type options based on device category
  const filteredDataTypeOptions = useMemo(() => {
    const deviceCategory =
      formData.deviceCategory?.name?.toLowerCase() || 'lowcost';

    // For lowcost devices: both calibrated and raw data available
    if (deviceCategory === 'lowcost') {
      return DATA_TYPE_OPTIONS; // Both calibrated and raw
    }

    // For bam and mobile devices: only raw data available
    if (deviceCategory === 'bam' || deviceCategory === 'mobile') {
      return DATA_TYPE_OPTIONS.filter(
        (option) => option.name.toLowerCase() === 'raw data',
      );
    }

    // Default fallback
    return DATA_TYPE_OPTIONS;
  }, [formData.deviceCategory]);

  // Filter frequency options based on device category and filter type
  const filteredFrequencyOptions = useMemo(() => {
    const deviceCategory =
      formData.deviceCategory?.name?.toLowerCase() || 'lowcost';
    // For mobile devices in devices filter: only show Raw frequency
    if (
      activeFilterKey === FILTER_TYPES.DEVICES &&
      deviceCategory === 'mobile'
    ) {
      return FREQUENCY_OPTIONS.filter(
        (option) => option.name.toLowerCase() === 'raw',
      );
    }

    // For BAM devices in devices filter: allow all frequency options (including raw)
    if (activeFilterKey === FILTER_TYPES.DEVICES && deviceCategory === 'bam') {
      return FREQUENCY_OPTIONS;
    }

    // For other cases, exclude Raw frequency (it's only for mobile and bam devices)
    return FREQUENCY_OPTIONS.filter(
      (option) => option.name.toLowerCase() !== 'raw',
    );
  }, [formData.deviceCategory, activeFilterKey]);

  // Active group info
  const activeGroup = useMemo(
    () => ({ id: activeGroupId, name: groupTitle }),
    [activeGroupId, groupTitle],
  );

  // Handle title change
  const handleTitleChange = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      title: { name: e.target.value },
    }));
  }, []);

  // Use the SiteAndDeviceIds hook with proper error handling
  const {
    data: siteAndDeviceIds,
    isLoading: isLoadingSiteIds,
    isError: isSiteIdsError,
  } = useSiteAndDeviceIds(selectedGridId);

  // Data fetching hooks with dependencies using paginated versions
  // For countries/cities visualization, we need all sites without group filtering
  // For other cases, we use group-filtered sites
  const isGridSelection =
    activeFilterKey === FILTER_TYPES.COUNTRIES ||
    activeFilterKey === FILTER_TYPES.CITIES;

  const {
    data: sitesData,
    isLoading: sitesLoading,
    isError: sitesError,
    error: sitesErrorMsg,
    refresh: refreshSites,
    meta: sitesMeta,
    loadMore: loadMoreSites,
    canLoadMore: canLoadMoreSites,
    hasNextPage: sitesHasNextPage,
  } = usePaginatedSitesSummary(isGridSelection ? '' : groupTitle || 'AirQo', {
    enableInfiniteScroll: true,
  });

  const {
    data: devicesData,
    isLoading: devicesLoading,
    isError: devicesError,
    error: devicesErrorMsg,
    refresh: refreshDevices,
    meta: devicesMeta,
    loadMore: loadMoreDevices,
    canLoadMore: canLoadMoreDevices,
    hasNextPage: devicesHasNextPage,
  } = usePaginatedDevicesSummary(groupTitle || 'AirQo', {
    enableInfiniteScroll: true,
  });

  const {
    data: countriesData,
    isLoading: countriesLoading,
    isError: countriesError,
    error: countriesErrorMsg,
    refresh: refreshCountries,
    meta: countriesMeta,
    loadMore: loadMoreCountries,
    canLoadMore: canLoadMoreCountries,
    hasNextPage: countriesHasNextPage,
  } = usePaginatedGridsSummary('country', {
    enableInfiniteScroll: true,
  });

  const {
    data: citiesData,
    isLoading: citiesLoading,
    isError: citiesError,
    error: citiesErrorMsg,
    refresh: refreshCities,
    meta: citiesMeta,
    loadMore: loadMoreCities,
    canLoadMore: canLoadMoreCities,
    hasNextPage: citiesHasNextPage,
  } = usePaginatedGridsSummary('city,state,county,district,region,province', {
    enableInfiniteScroll: true,
  });

  const {
    data: mobileDevicesData,
    isLoading: mobileDevicesLoading,
    isError: mobileDevicesError,
    error: mobileDevicesErrorMsg,
    refresh: refreshMobileDevices,
    meta: mobileDevicesMeta,
    loadMore: loadMoreMobileDevices,
    canLoadMore: canLoadMoreMobileDevices,
    hasNextPage: mobileDevicesHasNextPage,
  } = usePaginatedMobileDevices({
    enableInfiniteScroll: true,
  });

  // Close mobile sidebar when resizing to larger screen
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileSidebarVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update filter errors for UI feedback
  useEffect(() => {
    setFilterErrors({
      sites: sitesError ? sitesErrorMsg?.message || 'Error loading sites' : '',
      devices: devicesError
        ? devicesErrorMsg?.message || 'Error loading devices'
        : '',
      mobileDevices: mobileDevicesError
        ? mobileDevicesErrorMsg?.message || 'Error loading mobile devices'
        : '',
      countries: countriesError
        ? countriesErrorMsg?.message || 'Error loading countries'
        : '',
      cities: citiesError
        ? citiesErrorMsg?.message || 'Error loading cities'
        : '',
    });
  }, [
    sitesError,
    sitesErrorMsg,
    devicesError,
    devicesErrorMsg,
    mobileDevicesError,
    mobileDevicesErrorMsg,
    countriesError,
    countriesErrorMsg,
    citiesError,
    citiesErrorMsg,
    setFilterErrors,
    backToDownload,
  ]);

  // Handle site IDs fetching status with UX feedback
  useEffect(() => {
    if (!selectedGridId) {
      setStatusMessage('');
      return;
    }

    if (isLoadingSiteIds) {
      setStatusMessage('Preparing location data...');
      setMessageType(MESSAGE_TYPES.INFO);
    } else if (isSiteIdsError) {
      setStatusMessage('Error loading data. Please try again.');
      setMessageType(MESSAGE_TYPES.ERROR);
    } else if (siteAndDeviceIds?.site_ids?.length) {
      setStatusMessage('Ready to download');
      setMessageType(MESSAGE_TYPES.INFO);
    } else if (siteAndDeviceIds?.site_ids?.length === 0) {
      setStatusMessage('No data available for this selection');
      setMessageType(MESSAGE_TYPES.WARNING);
    }
  }, [
    selectedGridId,
    isLoadingSiteIds,
    isSiteIdsError,
    siteAndDeviceIds,
    setStatusMessage,
    setMessageType,
  ]);

  // Clear selections when filter changes
  useEffect(() => {
    clearSelections();
  }, [activeFilterKey, clearSelections]);

  // Reset device category to 'lowcost' when switching away from devices filter
  // but preserve user selection when switching back to devices
  useEffect(() => {
    if (activeFilterKey !== FILTER_TYPES.DEVICES) {
      // Only reset if not already 'lowcost' to avoid unnecessary re-renders
      if (formData.deviceCategory?.name !== 'lowcost') {
        setFormData((prev) => ({
          ...prev,
          deviceCategory: { id: 1, name: 'lowcost' },
        }));
      }
    }
    // Note: We don't need to reset when switching TO devices,
    // as user should be able to keep their last selection
  }, [activeFilterKey, formData.deviceCategory?.name]);

  // Auto-switch to Raw Data when bam or mobile device categories are selected
  useEffect(() => {
    const deviceCategory = formData.deviceCategory?.name?.toLowerCase();
    if (deviceCategory === 'bam' || deviceCategory === 'mobile') {
      // Find the Raw Data option
      const rawDataOption = DATA_TYPE_OPTIONS.find(
        (option) => option.name.toLowerCase() === 'raw data',
      );

      if (
        rawDataOption &&
        formData.dataType?.name?.toLowerCase() !== 'raw data'
      ) {
        setFormData((prev) => ({
          ...prev,
          dataType: rawDataOption,
        }));
        clearSelections(); // Clear selections when data type changes automatically
      }
    }
  }, [formData.deviceCategory?.name, formData.dataType?.name, clearSelections]);

  // Auto-switch to Raw frequency for mobile devices in devices filter only.
  // BAM devices are allowed to use any frequency; do not auto-change frequency for BAM.
  useEffect(() => {
    const deviceCategory = formData.deviceCategory?.name?.toLowerCase();

    // If we're on the devices filter and the device category is mobile,
    // force the frequency to Raw to match backend availability.
    if (
      activeFilterKey === FILTER_TYPES.DEVICES &&
      deviceCategory === 'mobile'
    ) {
      const rawFrequencyOption = FREQUENCY_OPTIONS.find(
        (option) => option.name.toLowerCase() === 'raw',
      );

      if (
        rawFrequencyOption &&
        formData.frequency?.name?.toLowerCase() !== 'raw'
      ) {
        setFormData((prev) => ({
          ...prev,
          frequency: rawFrequencyOption,
        }));
        clearSelections(); // Clear selections when frequency changes automatically
      }

      return; // exit early
    }

    // If we are NOT on a mobile device and the current frequency is raw,
    // switch back to a sensible default (daily). This keeps previous behavior
    // but avoids forcing a change for BAM devices.
    if (formData.frequency?.name?.toLowerCase() === 'raw') {
      const defaultFrequencyOption = FREQUENCY_OPTIONS.find(
        (option) => option.name.toLowerCase() === 'daily',
      );

      if (defaultFrequencyOption) {
        setFormData((prev) => ({
          ...prev,
          frequency: defaultFrequencyOption,
        }));
        clearSelections();
      }
    }
    // Intentionally depend on only the values we read and the stable helper
    // functions to prevent extra re-renders or loops.
  }, [
    activeFilterKey,
    formData.deviceCategory?.name,
    formData.frequency?.name,
    clearSelections,
  ]);

  // Handle form field updates
  const handleOptionSelect = useCallback(
    (id, option) => {
      setFormData((prev) => ({ ...prev, [id]: option }));

      // Clear selections when data type changes to ensure consistency
      if (id === 'dataType') {
        clearSelections();
      }
    },
    [clearSelections],
  );

  // Retry loading data for a specific filter
  const handleRetryLoad = useCallback(
    (filterKey) => {
      if (filterKey === FILTER_TYPES.DEVICES) {
        // For devices, check if mobile category is selected
        if (
          formData.deviceCategory &&
          formData.deviceCategory.name.toLowerCase() === 'mobile'
        ) {
          refreshMobileDevices();
        } else {
          refreshDevices();
        }
      } else {
        const refreshMap = {
          [FILTER_TYPES.COUNTRIES]: refreshCountries,
          [FILTER_TYPES.CITIES]: refreshCities,
          [FILTER_TYPES.SITES]: refreshSites,
        };

        if (refreshMap[filterKey]) {
          refreshMap[filterKey]();
        }
      }

      setActiveFilterKey(filterKey);
    },
    [
      formData.deviceCategory,
      refreshCountries,
      refreshCities,
      refreshDevices,
      refreshMobileDevices,
      refreshSites,
      setActiveFilterKey,
    ],
  );

  // Handle preview generation
  const handlePreview = useCallback(async () => {
    try {
      setShowPreview(true);
      await generatePreview(
        formData,
        selectedItems,
        activeFilterKey,
        siteAndDeviceIds,
      );
    } catch {
      // Handle preview error silently
      setShowPreview(false);
    }
  }, [
    formData,
    selectedItems,
    activeFilterKey,
    siteAndDeviceIds,
    generatePreview,
  ]);

  // Handle confirmed download from preview
  const handleConfirmDownload = useCallback(async () => {
    try {
      // Close preview dialog first
      setShowPreview(false);
      clearPreview();

      // Close mobile sidebar if open
      if (isMobileSidebarVisible) {
        setMobileSidebarVisible(false);
      }

      // Proceed with download with selected columns
      await handleDownload(
        formData,
        siteAndDeviceIds,
        onClose,
        handleClearSelection,
        selectedColumns, // Pass selected columns to filter the download
      );
    } catch {
      // Handle download error silently
    }
  }, [
    formData,
    siteAndDeviceIds,
    onClose,
    handleClearSelection,
    handleDownload,
    isMobileSidebarVisible,
    clearPreview,
    selectedColumns, // Add selectedColumns to dependencies
  ]);

  // Define filter tabs, hiding Countries and Cities unless AirQo group is active
  const filters = useMemo(() => {
    const baseFilters = [
      { key: FILTER_TYPES.COUNTRIES, label: 'Countries' },
      { key: FILTER_TYPES.CITIES, label: 'Cities' },
      { key: FILTER_TYPES.SITES, label: 'Sites' },
      { key: FILTER_TYPES.DEVICES, label: 'Devices' },
    ];
    if (activeGroup?.name?.toLowerCase() !== 'airqo') {
      // Hide Countries and Cities unless AirQo group is active
      return baseFilters.filter(
        (f) =>
          f.key !== FILTER_TYPES.COUNTRIES && f.key !== FILTER_TYPES.CITIES,
      );
    }
    return baseFilters;
  }, [activeGroup]);

  // Get data for current filter tab with proper null handling and device filtering
  const currentFilterData = useMemo(() => {
    const baseDataMap = {
      [FILTER_TYPES.COUNTRIES]: countriesData || [],
      [FILTER_TYPES.CITIES]: citiesData || [],
      [FILTER_TYPES.DEVICES]: devicesData || [],
      [FILTER_TYPES.SITES]: sitesData || [],
    };

    let baseData = baseDataMap[activeFilterKey] || [];

    // Apply special filtering for devices
    if (activeFilterKey === FILTER_TYPES.DEVICES) {
      // Check if mobile category is selected
      if (
        formData.deviceCategory &&
        formData.deviceCategory.name.toLowerCase() === 'mobile'
      ) {
        // Use dedicated mobile devices data instead of filtering
        return mobileDevicesData || [];
      } else {
        // Filter regular devices data by category (excluding mobile devices from general devices)
        return baseData.filter((device) => {
          // Filter by device category if specified
          let matchesCategory = true;
          if (formData.deviceCategory) {
            const selectedCategory = formData.deviceCategory.name.toLowerCase();
            const deviceCategory = String(device.category || '').toLowerCase();

            // For non-mobile categories, direct match and exclude mobile devices
            matchesCategory =
              deviceCategory === selectedCategory &&
              !(
                deviceCategory === 'lowcost' &&
                (device.mobility === true || device.mobility === 'true')
              );
          } else {
            // If no category selected, exclude mobile devices from general view
            const deviceCategory = String(device.category || '').toLowerCase();
            matchesCategory = !(
              deviceCategory === 'lowcost' &&
              (device.mobility === true || device.mobility === 'true')
            );
          }

          return matchesCategory;
        });
      }
    }

    return baseData;
  }, [
    activeFilterKey,
    countriesData,
    citiesData,
    devicesData,
    sitesData,
    mobileDevicesData,
    formData.deviceCategory,
  ]);

  // Get loading state for current filter
  const isLoading = useMemo(() => {
    if (activeFilterKey === FILTER_TYPES.DEVICES) {
      // For devices filter, check if mobile category is selected
      if (
        formData.deviceCategory &&
        formData.deviceCategory.name.toLowerCase() === 'mobile'
      ) {
        return mobileDevicesLoading;
      } else {
        return devicesLoading;
      }
    }

    const loadingMap = {
      [FILTER_TYPES.COUNTRIES]: countriesLoading,
      [FILTER_TYPES.CITIES]: citiesLoading,
      [FILTER_TYPES.SITES]: sitesLoading,
    };
    return loadingMap[activeFilterKey] || false;
  }, [
    activeFilterKey,
    formData.deviceCategory,
    countriesLoading,
    citiesLoading,
    devicesLoading,
    mobileDevicesLoading,
    sitesLoading,
  ]);

  // Get pagination metadata for current filter
  const currentPaginationMeta = useMemo(() => {
    if (activeFilterKey === FILTER_TYPES.DEVICES) {
      // For devices filter, check if mobile category is selected
      if (
        formData.deviceCategory &&
        formData.deviceCategory.name.toLowerCase() === 'mobile'
      ) {
        return mobileDevicesMeta || {};
      } else {
        return devicesMeta || {};
      }
    }

    const metaMap = {
      [FILTER_TYPES.COUNTRIES]: countriesMeta,
      [FILTER_TYPES.CITIES]: citiesMeta,
      [FILTER_TYPES.SITES]: sitesMeta,
    };
    return metaMap[activeFilterKey] || {};
  }, [
    activeFilterKey,
    formData.deviceCategory,
    countriesMeta,
    citiesMeta,
    devicesMeta,
    mobileDevicesMeta,
    sitesMeta,
  ]);

  // Get load more function for current filter
  const currentLoadMore = useMemo(() => {
    if (activeFilterKey === FILTER_TYPES.DEVICES) {
      // For devices filter, check if mobile category is selected
      if (
        formData.deviceCategory &&
        formData.deviceCategory.name.toLowerCase() === 'mobile'
      ) {
        return loadMoreMobileDevices;
      } else {
        return loadMoreDevices;
      }
    }

    const loadMoreMap = {
      [FILTER_TYPES.COUNTRIES]: loadMoreCountries,
      [FILTER_TYPES.CITIES]: loadMoreCities,
      [FILTER_TYPES.SITES]: loadMoreSites,
    };
    return loadMoreMap[activeFilterKey];
  }, [
    activeFilterKey,
    formData.deviceCategory,
    loadMoreCountries,
    loadMoreCities,
    loadMoreDevices,
    loadMoreMobileDevices,
    loadMoreSites,
  ]);

  // Get can load more state for current filter
  const currentCanLoadMore = useMemo(() => {
    if (activeFilterKey === FILTER_TYPES.DEVICES) {
      // For devices filter, check if mobile category is selected
      if (
        formData.deviceCategory &&
        formData.deviceCategory.name.toLowerCase() === 'mobile'
      ) {
        return canLoadMoreMobileDevices;
      } else {
        return canLoadMoreDevices;
      }
    }

    const canLoadMoreMap = {
      [FILTER_TYPES.COUNTRIES]: canLoadMoreCountries,
      [FILTER_TYPES.CITIES]: canLoadMoreCities,
      [FILTER_TYPES.SITES]: canLoadMoreSites,
    };
    return canLoadMoreMap[activeFilterKey] || false;
  }, [
    activeFilterKey,
    formData.deviceCategory,
    canLoadMoreCountries,
    canLoadMoreCities,
    canLoadMoreDevices,
    canLoadMoreMobileDevices,
    canLoadMoreSites,
  ]);

  // Get has next page state for current filter
  const currentHasNextPage = useMemo(() => {
    if (activeFilterKey === FILTER_TYPES.DEVICES) {
      // For devices filter, check if mobile category is selected
      if (
        formData.deviceCategory &&
        formData.deviceCategory.name.toLowerCase() === 'mobile'
      ) {
        return mobileDevicesHasNextPage;
      } else {
        return devicesHasNextPage;
      }
    }

    const hasNextPageMap = {
      [FILTER_TYPES.COUNTRIES]: countriesHasNextPage,
      [FILTER_TYPES.CITIES]: citiesHasNextPage,
      [FILTER_TYPES.SITES]: sitesHasNextPage,
    };
    return hasNextPageMap[activeFilterKey] || false;
  }, [
    activeFilterKey,
    formData.deviceCategory,
    countriesHasNextPage,
    citiesHasNextPage,
    devicesHasNextPage,
    mobileDevicesHasNextPage,
    sitesHasNextPage,
  ]);

  // Use utility hooks for computed values
  const durationGuidance = useDurationGuidance(formData.frequency);
  const isDownloadDisabled = useDownloadDisabled(
    isLoadingSiteIds,
    downloadLoading,
    formData,
    selectedItems,
  );
  const footerInfo = useFooterInfo(
    formError,
    statusMessage,
    messageType,
    selectedItems,
    formData,
  );

  // Handle filter tab changes
  const handleFilter = useCallback(
    (_, activeFilter) => {
      if (activeFilter?.key) {
        setActiveFilterKey(activeFilter.key);
        setFormError('');
      }
      return currentFilterData;
    },
    [currentFilterData, setActiveFilterKey, setFormError],
  );

  // Toggle item selection using hook method
  const handleToggleItemWithHook = useCallback(
    (item) => {
      handleToggleItem(item, activeFilterKey);
    },
    [handleToggleItem, activeFilterKey],
  );

  // Enhanced handler for View Data button click supporting all filter types
  const onViewDataClick = useCallback(async () => {
    if (selectedItems.length === 0) return;

    // Prevent duplicate visualize actions while fetching assigned sites
    if (isFetchingAssignedSites) return;

    try {
      let visualizationData = [];
      let modalTitle = 'Air Quality Insights';

      switch (activeFilterKey) {
        case FILTER_TYPES.SITES:
          // For sites, use selected items directly
          visualizationData = selectedItems;
          modalTitle = `Air Quality Insights - ${selectedItems.length} Site${selectedItems.length > 1 ? 's' : ''}`;
          break;

        case FILTER_TYPES.COUNTRIES:
        case FILTER_TYPES.CITIES:
          // Optimized handling for countries and cities using the dedicated assigned sites API
          setIsFetchingAssignedSites(true);
          try {
            // Get all assigned sites for the selected grids (countries/cities)
            const assignedSitesPromises = selectedItems.map(
              async (gridItem) => {
                try {
                  const response = await getAssignedSitesForGrid(gridItem._id);

                  // Debug logging for development
                  if (process.env.NODE_ENV === 'development') {
                    logger.debug(
                      `Retrieved ${response?.assigned_grids?.length || 0} sites for grid ${gridItem.name}`,
                      response?.assigned_grids,
                    );
                  }

                  return {
                    gridItem,
                    sites: response?.assigned_grids || [],
                  };
                } catch (error) {
                  logger.error(
                    `Error fetching sites for grid ${gridItem.name}:`,
                    error,
                  );
                  return {
                    gridItem,
                    sites: [],
                  };
                }
              },
            );

            const assignedSitesResults = await Promise.all(
              assignedSitesPromises,
            );

            // Flatten all sites from all selected grids
            const allAssignedSites = assignedSitesResults.reduce(
              (acc, result) => {
                return acc.concat(result.sites);
              },
              [],
            );

            if (allAssignedSites.length === 0) {
              const locationTypeText =
                activeFilterKey === FILTER_TYPES.COUNTRIES
                  ? 'country'
                  : 'cities';
              setFormError(
                `No monitoring sites found for the selected ${locationTypeText}. This may be due to data availability or connectivity issues.`,
              );
              return;
            }

            // Format location name properly (remove underscores/hyphens, capitalize)
            let locationLabel = '';
            if (selectedItems.length === 1) {
              const rawLocationName =
                selectedItems[0]?.name ||
                selectedItems[0]?.long_name ||
                'Selected Location';
              locationLabel = rawLocationName
                .replace(/[_-]/g, ' ')
                .split(' ')
                .map(
                  (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
                )
                .join(' ');
            } else {
              locationLabel = `${selectedItems.length} ${activeFilterKey === FILTER_TYPES.COUNTRIES ? 'Countries' : 'Cities'}`;
            }
            modalTitle = `Air Quality Insights - ${locationLabel} (${allAssignedSites.length} Site${allAssignedSites.length > 1 ? 's' : ''})`;

            // Map to the expected visualization data structure
            visualizationData = allAssignedSites.map((site) => ({
              _id: site._id,
              name: site.name || site.description || '',
              location_name: site.name || site.description || '',
              city: site.district || '',
              country: site.country || '',
              region: site.region || '',
              district: site.district || '',
              generated_name: site.generated_name || '',
              description: site.description || '',
              createdAt: site.createdAt || '',
            }));

            // Debug logging for development
            if (process.env.NODE_ENV === 'development') {
              logger.debug(
                'Successfully prepared sites for visualization:',
                visualizationData.length,
                visualizationData,
              );
            }
          } catch (error) {
            logger.error(
              'Error fetching assigned sites for visualization:',
              error,
            );
            const locationTypeText =
              activeFilterKey === FILTER_TYPES.COUNTRIES ? 'country' : 'city';
            setFormError(
              `Failed to load site data for the selected ${locationTypeText}. Please try again or contact support if the issue persists.`,
            );
            return;
          } finally {
            setIsFetchingAssignedSites(false);
          }
          break;

        case FILTER_TYPES.DEVICES:
          // For devices, extract site IDs and visualize site data instead of device data
          // Each device has a 'site' object with _id property
          if (selectedItems.length > 0) {
            // Extract unique site IDs from selected devices
            const deviceSiteIds = selectedItems
              .map((device) => device.site?._id)
              .filter(Boolean); // Remove any null/undefined site IDs

            // Remove duplicates in case multiple devices are on the same site
            const uniqueSiteIds = [...new Set(deviceSiteIds)];

            if (uniqueSiteIds.length === 0) {
              setFormError(
                'No site information available for the selected devices. Cannot visualize data without site details.',
              );
              return;
            }

            // Map site IDs to actual site objects from available sites data
            const availableSites = sitesData || [];
            const siteMap = new Map(
              availableSites.map((site) => [site._id, site]),
            );

            // Get site objects for the unique site IDs
            let deviceSites = uniqueSiteIds
              .map((siteId) => siteMap.get(siteId))
              .filter(Boolean); // Remove any undefined entries

            // If we can't find site details from the main sites data,
            // try to use the site data embedded in the devices themselves
            if (deviceSites.length === 0) {
              deviceSites = selectedItems
                .map((device) => device.site)
                .filter(Boolean)
                .filter(
                  (site, index, self) =>
                    // Remove duplicates based on _id
                    index === self.findIndex((s) => s._id === site._id),
                );
            }

            if (deviceSites.length === 0) {
              setFormError(
                'Unable to retrieve site details for the selected devices. Please try again or contact support.',
              );
              return;
            }

            // Enhance site objects with device information for better display
            visualizationData = deviceSites.map((site) => {
              // Find all devices that belong to this site
              const devicesAtSite = selectedItems.filter(
                (device) => device.site?._id === site._id,
              );

              // Create enhanced site object with device info
              return {
                ...site,
                // Override the site name with device name(s) for display purposes
                displayName:
                  devicesAtSite.length === 1
                    ? devicesAtSite[0].name ||
                      devicesAtSite[0].long_name ||
                      site.name ||
                      site.location_name
                    : `${devicesAtSite.length} Devices at ${site.name || site.location_name}`,
                // Keep original name for reference
                originalSiteName: site.name || site.location_name,
                // Add device information
                associatedDevices: devicesAtSite,
                deviceCount: devicesAtSite.length,
                // Override name property that gets displayed in cards
                name:
                  devicesAtSite.length === 1
                    ? devicesAtSite[0].name || devicesAtSite[0].long_name
                    : `${devicesAtSite.length} Devices`,
                // Keep location_name for geographic context
                location_name: site.location_name || site.name,
              };
            });

            // Create appropriate modal title
            if (selectedItems.length === 1) {
              const deviceName =
                selectedItems[0].name ||
                selectedItems[0].long_name ||
                'Selected Device';
              const siteName =
                deviceSites[0]?.name ||
                deviceSites[0]?.location_name ||
                'Associated Site';
              modalTitle = `Air Quality Insights - ${deviceName} at ${siteName}`;
            } else if (uniqueSiteIds.length === 1) {
              const siteName =
                deviceSites[0]?.name || deviceSites[0]?.location_name || 'Site';
              modalTitle = `Air Quality Insights - ${selectedItems.length} Devices at ${siteName}`;
            } else {
              modalTitle = `Air Quality Insights - ${selectedItems.length} Devices across ${uniqueSiteIds.length} Sites`;
            }

            // Debug logging for development
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              logger.debug('Selected devices:', selectedItems.length);
              // eslint-disable-next-line no-console
              logger.debug('Device site IDs extracted:', deviceSiteIds);
              // eslint-disable-next-line no-console
              logger.debug('Unique sites from devices:', uniqueSiteIds.length);
              // eslint-disable-next-line no-console
              logger.debug(
                'Sites available for visualization:',
                visualizationData.length,
              );
              // eslint-disable-next-line no-console
              logger.debug(
                'Enhanced visualization data:',
                visualizationData.map((site) => ({
                  id: site._id,
                  displayName: site.displayName,
                  deviceCount: site.deviceCount,
                  devices:
                    site.associatedDevices?.map((d) => d.name || d.long_name) ||
                    [],
                })),
              );
            }
          } else {
            setFormError('No devices selected for visualization');
            return;
          }
          break;

        default:
          setFormError('Unable to visualize data for this selection type');
          return;
      }

      if (visualizationData.length === 0) {
        setFormError(
          'No data available for visualization. Please try selecting a different location or check back later.',
        );
        return;
      }

      // Clear any existing errors
      setFormError('');

      // Dispatch modal with enhanced data structure
      dispatch(
        setModalType({
          type: 'inSights',
          ids: null,
          data: visualizationData,
          backToDownload,
          filterType: activeFilterKey,
          modalTitle,
          originalSelection: selectedItems,
        }),
      );
      dispatch(setOpenModal(true));
    } catch (error) {
      // Enhanced error handling with more specific messages
      // Log error for debugging (in development only)
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        logger.error('Error in onViewDataClick:', error);
      }

      if (error.name === 'QuotaExceededError') {
        setFormError(
          'Unable to load visualization due to data size. Please try selecting fewer items.',
        );
      } else if (error.message?.includes('network')) {
        setFormError(
          'Network error. Please check your connection and try again.',
        );
      } else {
        setFormError(
          'Failed to open visualization. Please try again or contact support if the issue persists.',
        );
      }
    }
  }, [
    selectedItems,
    activeFilterKey,
    sitesData, // Still needed for devices case
    dispatch,
    backToDownload,
    setFormError,
    // Note: setStatusMessage and setMessageType are intentionally omitted
    // because they are not referenced inside this callback. Including them
    // causes unnecessary linter warnings and re-creations of the callback.
    isFetchingAssignedSites,
  ]);

  // Columns config for each filter type
  const columnsByFilter = useMemo(
    () => ({
      countries: [
        {
          key: 'name',
          label: 'Country',
          render: (item) => {
            // Replace underscores and hyphens with spaces, then capitalize each word
            const rawName = item.name || item.long_name || '';
            const formattedName = rawName
              .replace(/[_-]/g, ' ')
              .split(' ')
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
              )
              .join(' ');
            return (
              <div className="flex items-center capitalize">
                <span className="p-2 rounded-full bg-[#F6F6F7] dark:bg-gray-700 mr-3">
                  <AqGlobe05 size={16} />
                </span>
                <span>{formattedName || '--'}</span>
              </div>
            );
          },
        },
        {
          key: 'numberOfSites',
          label: 'Number of Sites',
          render: (item) => item.numberOfSites || item.sites?.length || 0,
        },
      ],
      cities: [
        {
          key: 'name',
          label: 'City',
          render: (item) => (
            <div className="flex items-center">
              <span className="p-2 rounded-full bg-[#F6F6F7] dark:bg-gray-700 mr-3">
                <AqGlobe05 size={16} />
              </span>
              <span>
                {(item.name || item.long_name || '')
                  .split('_')
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() +
                      word.slice(1).toLowerCase(),
                  )
                  .join(' ') || '--'}
              </span>
            </div>
          ),
        },
        {
          key: 'network',
          label: 'Network',
          render: (item) => (
            <span className="uppercase">{item.network || '--'}</span>
          ),
        },
        {
          key: 'numberOfSites',
          label: 'Number of Sites',
          render: (item) => item.numberOfSites || item.sites?.length || 0,
        },
      ],
      sites: [
        {
          key: 'search_name',
          label: 'Location',
          render: (item) => (
            <div className="flex items-center">
              <span className="p-2 rounded-full bg-[#F6F6F7] dark:bg-gray-700 mr-3">
                <AqMarkerPin01 size={16} />
              </span>
              <span>
                {item.search_name || item.name || item.location_name || '--'}
              </span>
            </div>
          ),
        },
        { key: 'city', label: 'City' },
        { key: 'country', label: 'Country' },
        { key: 'data_provider', label: 'Owner' },
      ],
      devices: [
        {
          key: 'name',
          label: 'Device Name',
          render: (item) => (
            <div className="flex items-center capitalize">
              <span className="p-2 rounded-full bg-[#F6F6F7] dark:bg-gray-700 mr-3">
                <AqMonitor03 size={16} />
              </span>
              <span>{item.name || item.long_name || '--'}</span>
            </div>
          ),
        },
        {
          key: 'network',
          label: 'Network',
          render: (item) => (
            <span className="uppercase">{item.network || '--'}</span>
          ),
        },
        {
          key: 'category',
          label: 'Category',
          render: (item) => (
            <span className="capitalize">{item.category || '--'}</span>
          ),
        },
      ],
    }),
    [],
  );

  // Search keys for each filter type
  const searchKeysByFilter = useMemo(
    () => ({
      countries: ['name', 'long_name'],
      cities: ['name', 'long_name', 'network'],
      sites: [
        'location_name',
        'search_name',
        'city',
        'country',
        'data_provider',
      ],
      devices: ['name', 'long_name', 'network', 'category', 'serial_number'],
    }),
    [],
  );

  // Render sidebar content based on loading state
  const renderSidebarContent = useCallback(() => {
    if (!activeGroup?.name) {
      return (
        <motion.div
          className="animate-pulse space-y-4 p-4"
          variants={animations.itemVariants}
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full"
            />
          ))}
        </motion.div>
      );
    }

    return (
      <SettingsSidebar
        formData={formData}
        handleOptionSelect={handleOptionSelect}
        handleTitleChange={handleTitleChange}
        edit={edit}
        setEdit={setEdit}
        filteredDataTypeOptions={filteredDataTypeOptions}
        filteredFrequencyOptions={filteredFrequencyOptions}
        durationGuidance={durationGuidance}
        handleSubmit={handlePreview}
        sidebarBg={darkMode ? '' : sidebarBg}
        isMobile={isMobileSidebarVisible}
        activeFilterKey={activeFilterKey} // Pass the active filter key
      />
    );
  }, [
    activeGroup?.name,
    formData,
    handleOptionSelect,
    handleTitleChange,
    edit,
    setEdit,
    filteredDataTypeOptions,
    filteredFrequencyOptions,
    durationGuidance,
    handlePreview,
    darkMode,
    sidebarBg,
    isMobileSidebarVisible,
    activeFilterKey, // Add activeFilterKey to dependencies
  ]);

  // Render main content area with error handling
  const renderMainContent = useCallback(() => {
    // Check for errors based on current filter and mobile device selection
    let isError, errorMessage;

    if (activeFilterKey === FILTER_TYPES.DEVICES) {
      // For devices filter, check specific error based on mobile category selection
      if (
        formData.deviceCategory &&
        formData.deviceCategory.name.toLowerCase() === 'mobile'
      ) {
        isError = mobileDevicesError;
        errorMessage =
          mobileDevicesErrorMsg?.message ||
          'Error loading mobile devices. Please try again.';
      } else {
        isError = devicesError;
        errorMessage =
          devicesErrorMsg?.message ||
          'Error loading devices. Please try again.';
      }
    } else {
      // For other filters, check their respective errors
      const errorMap = {
        [FILTER_TYPES.SITES]: {
          error: sitesError,
          message: sitesErrorMsg?.message,
        },
        [FILTER_TYPES.COUNTRIES]: {
          error: countriesError,
          message: countriesErrorMsg?.message,
        },
        [FILTER_TYPES.CITIES]: {
          error: citiesError,
          message: citiesErrorMsg?.message,
        },
      };

      const currentError = errorMap[activeFilterKey];
      isError = currentError?.error;
      errorMessage =
        currentError?.message || 'Error loading data. Please try again.';
    }

    if (isError && !isLoading) {
      return (
        <motion.div
          className="p-4"
          variants={animations.itemVariants}
          initial="hidden"
          animate="visible"
        >
          <InfoMessage
            title="Error Loading Data"
            description={errorMessage}
            variant="error"
          />
        </motion.div>
      );
    }

    // Enable View Data for all filter types with selections
    // Include assigned-sites fetching flag so the table shows loading while sites are fetched
    const isLoadingVisualizationData = isFetchingAssignedSites;

    const showViewDataButton = selectedItems.length > 0;

    return (
      <motion.div variants={animations.itemVariants}>
        <DataContent
          selectedItems={selectedItems}
          clearSelections={clearSelections}
          currentFilterData={currentFilterData}
          activeFilterKey={activeFilterKey}
          selectedRows={selectedItems}
          setSelectedRows={setSelectedItems}
          clearSelected={clearSelected}
          isLoading={isLoading}
          filterErrors={filterErrors}
          handleToggleItem={handleToggleItemWithHook}
          columnsByFilter={columnsByFilter}
          filters={filters}
          handleFilter={handleFilter}
          searchKeysByFilter={searchKeysByFilter[activeFilterKey]}
          handleRetryLoad={handleRetryLoad}
          showViewDataButton={showViewDataButton}
          isLoadingVisualizationData={isLoadingVisualizationData}
          onViewDataClick={onViewDataClick}
          deviceCategory={formData.deviceCategory} // Pass device category
          // Pagination props
          paginationMeta={currentPaginationMeta}
          onLoadMore={currentLoadMore}
          canLoadMore={currentCanLoadMore}
          hasNextPage={currentHasNextPage}
        />
      </motion.div>
    );
  }, [
    activeFilterKey,
    formData.deviceCategory,
    sitesError,
    devicesError,
    mobileDevicesError,
    countriesError,
    citiesError,
    sitesErrorMsg,
    devicesErrorMsg,
    mobileDevicesErrorMsg,
    countriesErrorMsg,
    citiesErrorMsg,
    isLoading,
    selectedItems,
    clearSelections,
    currentFilterData,
    setSelectedItems,
    clearSelected,
    filterErrors,
    handleToggleItemWithHook,
    columnsByFilter,
    filters,
    handleFilter,
    searchKeysByFilter,
    handleRetryLoad,
    onViewDataClick,
    isFetchingAssignedSites,
    currentPaginationMeta,
    currentLoadMore,
    currentCanLoadMore,
    currentHasNextPage,
  ]);

  return (
    <ErrorBoundary name="DataDownload" feature="Air Quality Data Download">
      <motion.div
        className="relative flex flex-col lg:flex-row h-full min-h-0"
        variants={animations.pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        data-testid="data-download-container"
      >
        {/* Desktop Sidebar */}
        <div className="hidden lg:block flex-shrink-0">
          <motion.div
            className="w-[240px] h-full overflow-y-auto overflow-x-hidden border-r border-gray-200 dark:border-gray-700 relative"
            variants={animations.sidebarVariants}
            initial="hidden"
            animate="visible"
          >
            {renderSidebarContent()}
          </motion.div>
        </div>

        {/* Mobile/Tablet Menu Button */}
        <MobileMenuButton onClick={() => setMobileSidebarVisible(true)} />

        {/* Mobile Sidebar */}
        <MobileSidebar
          isVisible={isMobileSidebarVisible}
          onClose={() => setMobileSidebarVisible(false)}
        >
          {renderSidebarContent()}
        </MobileSidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative overflow-hidden min-h-0">
          <motion.div
            className="flex-1 overflow-y-auto overflow-x-hidden"
            variants={animations.sidebarVariants}
            initial="hidden"
            animate="visible"
          >
            {renderMainContent()}
          </motion.div>

          <Footer
            setError={setFormError}
            messageType={footerInfo.type}
            message={footerInfo.message}
            selectedItems={selectedItems}
            handleClearSelection={
              selectedItems.length > 0 ? handleClearSelection : undefined
            }
            handleSubmit={handlePreview} // Changed to preview instead of direct download
            onClose={handleClose}
            btnText={downloadLoading ? 'Downloading...' : 'Preview & Download'}
            loading={previewLoading || downloadLoading}
            disabled={isDownloadDisabled}
          />
        </div>

        {/* Preview Dialog */}
        <DataPreviewDialog
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            clearPreview();
          }}
          previewData={previewData}
          previewLoading={previewLoading}
          previewError={previewError}
          selectedColumns={selectedColumns}
          onToggleColumn={toggleColumn}
          onResetColumns={resetColumns}
          onConfirmDownload={handleConfirmDownload}
          downloadLoading={downloadLoading}
        />
      </motion.div>
    </ErrorBoundary>
  );
};

DataDownload.propTypes = {
  onClose: PropTypes.func.isRequired,
  sidebarBg: PropTypes.string,
  resetOnClose: PropTypes.bool,
  backToDownload: PropTypes.bool,
};

// Export the header component for use in other places
export { DownloadDataHeader };

export default DataDownload;
