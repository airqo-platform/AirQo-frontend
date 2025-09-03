'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { AqGlobe05, AqMarkerPin01, AqMonitor03 } from '@airqo/icons-react';
import ErrorBoundary from '@/components/ErrorBoundary';

import {
  DATA_TYPE_OPTIONS,
  FREQUENCY_OPTIONS,
  FILTER_TYPES,
} from './constants';

import {
  useSitesSummary,
  useDeviceSummary,
  useGridSummary,
  useSiteAndDeviceIds,
} from '@/core/hooks/analyticHooks';

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

  // Data fetching hooks with dependencies
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
  } = useSitesSummary(isGridSelection ? '' : groupTitle || 'AirQo', {});

  const {
    data: devicesData,
    isLoading: devicesLoading,
    isError: devicesError,
    error: devicesErrorMsg,
    refresh: refreshDevices,
  } = useDeviceSummary(groupTitle || 'AirQo', {});

  const {
    data: countriesData,
    isLoading: countriesLoading,
    isError: countriesError,
    error: countriesErrorMsg,
    refresh: refreshCountries,
  } = useGridSummary('country');

  const {
    data: citiesData,
    isLoading: citiesLoading,
    isError: citiesError,
    error: citiesErrorMsg,
    refresh: refreshCities,
  } = useGridSummary('city,state,county,district,region,province');

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
      const refreshMap = {
        [FILTER_TYPES.COUNTRIES]: refreshCountries,
        [FILTER_TYPES.CITIES]: refreshCities,
        [FILTER_TYPES.DEVICES]: refreshDevices,
        [FILTER_TYPES.SITES]: refreshSites,
      };

      if (refreshMap[filterKey]) {
        refreshMap[filterKey]();
      }

      setActiveFilterKey(filterKey);
    },
    [
      refreshCountries,
      refreshCities,
      refreshDevices,
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

    const baseData = baseDataMap[activeFilterKey] || [];

    // Apply special filtering for devices
    if (activeFilterKey === FILTER_TYPES.DEVICES) {
      return baseData.filter((device) => {
        // Filter by device category if specified
        let matchesCategory = true;
        if (formData.deviceCategory) {
          const selectedCategory = formData.deviceCategory.name.toLowerCase();
          const deviceCategory = String(device.category || '').toLowerCase();

          // Special handling for mobile devices
          if (selectedCategory === 'mobile') {
            // For mobile devices, check that category is 'lowcost' AND mobility is true
            const isMobileDevice =
              deviceCategory === 'lowcost' &&
              (device.mobility === true || device.mobility === 'true');
            matchesCategory = isMobileDevice;
          } else {
            // For other categories, direct match
            matchesCategory = deviceCategory === selectedCategory;
          }
        }

        return matchesCategory;
      });
    }

    return baseData;
  }, [
    activeFilterKey,
    countriesData,
    citiesData,
    devicesData,
    sitesData,
    formData.deviceCategory,
  ]);

  // Get loading state for current filter
  const isLoading = useMemo(() => {
    const loadingMap = {
      [FILTER_TYPES.COUNTRIES]: countriesLoading,
      [FILTER_TYPES.CITIES]: citiesLoading,
      [FILTER_TYPES.DEVICES]: devicesLoading,
      [FILTER_TYPES.SITES]: sitesLoading,
    };
    return loadingMap[activeFilterKey] || false;
  }, [
    activeFilterKey,
    countriesLoading,
    citiesLoading,
    devicesLoading,
    sitesLoading,
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
          // Enhanced handling for countries and cities with better error management
          // IMPORTANT: We fetch all sites (not group-filtered) to ensure we can find
          // all sites returned by the grid API, which may span multiple organizations
          if (siteAndDeviceIds?.site_ids?.length > 0) {
            // Map site IDs to actual site objects from the available sites data
            const availableSites = sitesData || [];

            // Debug logging to track the data mapping issue
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              console.log(
                'Grid API returned site IDs:',
                siteAndDeviceIds.site_ids.length,
              );
              // eslint-disable-next-line no-console
              console.log(
                'Available sites for mapping:',
                availableSites.length,
              );
            }

            // Use a more efficient approach for large datasets
            const siteMap = new Map(
              availableSites.map((site) => [site._id, site]),
            );

            visualizationData = siteAndDeviceIds.site_ids
              .map((siteId) => siteMap.get(siteId))
              .filter(Boolean); // Remove any undefined entries

            // Debug logging to track successful mappings
            if (process.env.NODE_ENV === 'development') {
              const unmappedCount =
                siteAndDeviceIds.site_ids.length - visualizationData.length;
              if (unmappedCount > 0) {
                // eslint-disable-next-line no-console
                console.warn(
                  `Could not map ${unmappedCount} site IDs to site objects. This may indicate sites from different organizations.`,
                );
              }
              // eslint-disable-next-line no-console
              console.log(
                'Successfully mapped sites for visualization:',
                visualizationData.length,
              );
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
            modalTitle = `Air Quality Insights - ${locationLabel} (${visualizationData.length} Site${visualizationData.length > 1 ? 's' : ''})`;

            // For performance and to avoid sending overly large payloads to the modal,
            // send a minimal representation of each site (only the fields needed for display)
            // but do not arbitrarily discard sites here. The More Insights UI will
            // handle pagination/limits when rendering charts.
            visualizationData = visualizationData.map((site) => ({
              _id: site._id,
              name: site.name || site.location_name || site.location || '',
              location_name: site.location_name || site.name || '',
              city: site.city || site.city_name || '',
              country: site.country || '',
            }));

            // Check if we have any sites after mapping
            if (visualizationData.length === 0) {
              const locationTypeText =
                activeFilterKey === FILTER_TYPES.COUNTRIES ? 'country' : 'city';
              setFormError(
                `No site details available for visualization in the selected ${locationTypeText}. The sites exist but detailed information may not be accessible due to permissions or data synchronization.`,
              );
              return;
            }
          } else {
            // No sites found, show error
            const locationTypeText =
              activeFilterKey === FILTER_TYPES.COUNTRIES ? 'country' : 'city';
            setFormError(
              `No monitoring sites found for the selected ${locationTypeText}. This may be due to data availability or connectivity issues.`,
            );
            return;
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
              console.log('Selected devices:', selectedItems.length);
              // eslint-disable-next-line no-console
              console.log('Device site IDs extracted:', deviceSiteIds);
              // eslint-disable-next-line no-console
              console.log('Unique sites from devices:', uniqueSiteIds.length);
              // eslint-disable-next-line no-console
              console.log(
                'Sites available for visualization:',
                visualizationData.length,
              );
              // eslint-disable-next-line no-console
              console.log(
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
        console.error('Error in onViewDataClick:', error);
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
    siteAndDeviceIds,
    sitesData,
    dispatch,
    backToDownload,
    setFormError,
    // Note: setStatusMessage and setMessageType are intentionally omitted
    // because they are not referenced inside this callback. Including them
    // causes unnecessary linter warnings and re-creations of the callback.
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
    const isError = sitesError || devicesError || countriesError || citiesError;
    const errorMessage =
      sitesErrorMsg?.message ||
      devicesErrorMsg?.message ||
      countriesErrorMsg?.message ||
      citiesErrorMsg?.message ||
      'Error loading data. Please try again.';

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

    // Enable View Data for all filter types with selections, but disable when fetching sites data for countries/cities
    const isLoadingVisualizationData =
      (activeFilterKey === FILTER_TYPES.COUNTRIES ||
        activeFilterKey === FILTER_TYPES.CITIES) &&
      selectedItems.length > 0 &&
      isLoadingSiteIds;

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
        />
      </motion.div>
    );
  }, [
    sitesError,
    devicesError,
    countriesError,
    citiesError,
    sitesErrorMsg,
    devicesErrorMsg,
    countriesErrorMsg,
    citiesErrorMsg,
    isLoading,
    isLoadingSiteIds,
    selectedItems,
    clearSelections,
    currentFilterData,
    activeFilterKey,
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
    formData.deviceCategory,
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
