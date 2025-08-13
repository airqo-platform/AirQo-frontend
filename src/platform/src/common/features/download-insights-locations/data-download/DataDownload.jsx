'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { AqGlobe05, AqMarkerPin01, AqMonitor03 } from '@airqo/icons-react';
import ErrorBoundary from '@/components/ErrorBoundary';

import { DATA_TYPE_OPTIONS } from './constants';

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
import DataContent, { FILTER_TYPES } from './components/DataContent';
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
  const {
    data: sitesData,
    isLoading: sitesLoading,
    isError: sitesError,
    error: sitesErrorMsg,
    refresh: refreshSites,
  } = useSitesSummary(groupTitle || 'AirQo', {});

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
        // Only show deployed devices (exclude "not deployed" and "recalled" devices)
        // Check multiple possible status fields since the data structure might vary
        const deploymentStatus = String(
          device.deployment_status || '',
        ).toLowerCase();
        const status = String(device.status || '').toLowerCase();
        const deviceStatus = String(device.device_status || '').toLowerCase();

        // List of statuses that indicate device is deployed and active
        const deployedStatuses = ['deployed', 'active', 'online'];
        const excludedStatuses = [
          'recalled',
          'not deployed',
          'inactive',
          'offline',
          'maintenance',
        ];

        // Check if any status field indicates deployment
        const hasDeployedStatus = deployedStatuses.some(
          (deployedStatus) =>
            deploymentStatus.includes(deployedStatus) ||
            status.includes(deployedStatus) ||
            deviceStatus.includes(deployedStatus),
        );

        // Check if device is online (another indicator of deployment)
        const isOnline = device.isOnline === true || device.online === true;

        // Check if any status field indicates exclusion
        const hasExcludedStatus = excludedStatuses.some(
          (excludedStatus) =>
            deploymentStatus.includes(excludedStatus) ||
            status.includes(excludedStatus) ||
            deviceStatus.includes(excludedStatus),
        );

        // Device is considered deployed if it has deployed status OR is online,
        // AND doesn't have any excluded status
        const isDeployed =
          (hasDeployedStatus || isOnline) && !hasExcludedStatus;

        // Filter by device category if specified
        let matchesCategory = true;
        if (formData.deviceCategory) {
          const selectedCategory = formData.deviceCategory.name.toLowerCase();
          const deviceCategory = String(device.category || '').toLowerCase();
          matchesCategory = deviceCategory === selectedCategory;
        }

        return isDeployed && matchesCategory;
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
          key: 'status',
          label: 'Status',
          render: (item) => (
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                item.isOnline
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {item.isOnline ? 'Online' : 'Offline'}
            </span>
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

    // Only enable View Data for Sites
    const showViewDataButton =
      activeFilterKey === FILTER_TYPES.SITES && selectedItems.length > 0;

    // Handler for View Data button click (Sites only)
    const onViewDataClick = () => {
      if (activeFilterKey === FILTER_TYPES.SITES && selectedItems.length > 0) {
        dispatch(
          setModalType({
            type: 'inSights',
            ids: null,
            data: selectedItems,
            backToDownload,
          }),
        );
        dispatch(setOpenModal(true));
      }
    };

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
          onViewDataClick={onViewDataClick}
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
    activeFilterKey,
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
    dispatch,
    backToDownload, // Add missing dependency
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
