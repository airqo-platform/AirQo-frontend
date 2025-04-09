'use client';

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import WorldIcon from '@/icons/SideBar/world_Icon';
import CalibrateIcon from '@/icons/Analytics/calibrateIcon';
import FileTypeIcon from '@/icons/Analytics/fileTypeIcon';
import FrequencyIcon from '@/icons/Analytics/frequencyIcon';
import WindIcon from '@/icons/Analytics/windIcon';
import EditIcon from '@/icons/Analytics/EditIcon';
import LocationIcon from '@/icons/Analytics/LocationIcon';
import DeviceIcon from '@/icons/Analytics/deviceIcon';
import DataTable from '../components/DataTable';
import CustomFields from '../components/CustomFields';
import Footer from '../components/Footer';

import {
  POLLUTANT_OPTIONS,
  DATA_TYPE_OPTIONS,
  FREQUENCY_OPTIONS,
  FILE_TYPE_OPTIONS,
} from '../constants';

import useDataDownload from '@/core/hooks/useDataDownload';
import {
  useSitesSummary,
  useDeviceSummary,
  useGridSummary,
  useSiteAndDeviceIds,
} from '@/core/hooks/analyticHooks';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import CustomToast from '@/components/Toast/CustomToast';
import { format } from 'date-fns';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import { event } from '@/core/hooks/useGoogleAnalytics';
import SelectionMessage from '../components/SelectionMessage';

/**
 * Header component for the Download Data modal.
 */
export const DownloadDataHeader = () => (
  <h3
    className="flex text-lg leading-6 font-medium text-gray-900"
    id="modal-title"
  >
    Download air quality data
  </h3>
);

// Filter type constants
const FILTER_TYPES = {
  COUNTRIES: 'countries',
  CITIES: 'cities',
  SITES: 'sites',
  DEVICES: 'devices',
};

// Message types for footer component
const MESSAGE_TYPES = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// MIME type mapping with fallback
const getMimeType = (fileType) => {
  const mimeTypes = {
    csv: 'text/csv;charset=utf-8;',
    pdf: 'application/pdf',
    json: 'application/json',
  };
  return mimeTypes[fileType] || 'application/octet-stream';
};

/**
 * SettingsSidebar component for DataDownload
 */
const SettingsSidebar = ({
  formData,
  handleOptionSelect,
  edit,
  setEdit,
  filteredDataTypeOptions,
  ORGANIZATION_OPTIONS,
  durationGuidance,
  handleSubmit,
  handleTitleChange,
  sidebarBg = '#f6f6f7',
}) => {
  // Animation variants for sidebar
  const sidebarVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.07,
      },
    },
  };

  const formItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.form
      className="w-[280px] min-h-[400px] max-h-[658px] relative space-y-3 px-5 pt-5 pb-14 border-r flex-shrink-0 overflow-y-auto overflow-x-hidden"
      style={{ backgroundColor: sidebarBg }}
      onSubmit={handleSubmit}
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="flex justify-between items-center mb-3"
        variants={formItemVariants}
      >
        <h4 className="text-lg font-medium">Download Settings</h4>
        <motion.button
          type="button"
          className={`text-sm text-blue-600 ${edit ? 'font-semibold' : 'opacity-80'}`}
          onClick={() => setEdit(!edit)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {edit ? 'Done' : <EditIcon />}
        </motion.button>
      </motion.div>

      {/* Form Fields */}
      <motion.div className="space-y-4">
        <motion.div variants={formItemVariants}>
          {edit ? (
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.title.name}
                onChange={handleTitleChange}
                autoFocus
              />
            </div>
          ) : (
            <CustomFields
              field
              title="Title"
              edit={false}
              id="title"
              defaultOption={{ name: formData.title.name }}
              handleOptionSelect={handleOptionSelect}
            />
          )}
        </motion.div>

        <motion.div variants={formItemVariants}>
          <CustomFields
            title="Organization"
            options={ORGANIZATION_OPTIONS}
            id="organization"
            icon={<WorldIcon width={16} height={16} fill="#000" />}
            defaultOption={formData.organization}
            handleOptionSelect={handleOptionSelect}
            textFormat="uppercase"
          />
        </motion.div>

        <motion.div variants={formItemVariants}>
          <CustomFields
            title="Data type"
            options={filteredDataTypeOptions}
            id="dataType"
            icon={<CalibrateIcon />}
            defaultOption={formData.dataType}
            handleOptionSelect={handleOptionSelect}
          />
        </motion.div>

        <motion.div variants={formItemVariants}>
          <CustomFields
            title="Pollutant"
            options={POLLUTANT_OPTIONS}
            id="pollutant"
            icon={<WindIcon />}
            defaultOption={formData.pollutant}
            handleOptionSelect={handleOptionSelect}
          />
        </motion.div>

        <motion.div variants={formItemVariants}>
          <CustomFields
            title="Duration"
            id="duration"
            useCalendar
            required={true}
            requiredText={`${!formData.duration ? 'please select a date range' : ''}`}
            defaultOption={formData.duration}
            handleOptionSelect={handleOptionSelect}
          />

          {durationGuidance && (
            <div className="text-xs text-blue-600 -mt-2 ml-1">
              {durationGuidance}
            </div>
          )}
        </motion.div>

        <motion.div variants={formItemVariants}>
          <CustomFields
            title="Frequency"
            options={FREQUENCY_OPTIONS}
            id="frequency"
            icon={<FrequencyIcon />}
            defaultOption={formData.frequency}
            handleOptionSelect={handleOptionSelect}
          />
        </motion.div>

        <motion.div variants={formItemVariants}>
          <CustomFields
            title="File type"
            options={FILE_TYPE_OPTIONS}
            id="fileType"
            icon={<FileTypeIcon />}
            defaultOption={formData.fileType}
            handleOptionSelect={handleOptionSelect}
          />
        </motion.div>
      </motion.div>
    </motion.form>
  );
};

/**
 * DataContent component for DataDownload
 */
const DataContent = ({
  selectedItems,
  clearSelections,
  currentFilterData,
  activeFilterKey,
  selectedRows,
  setSelectedRows,
  clearSelected,
  isLoading,
  filterErrors,
  handleToggleItem,
  columnsByFilter,
  filters,
  handleFilter,
  searchKeysByFilter,
  handleRetryLoad,
}) => {
  // Animation variants for content area
  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="bg-white flex-1 h-full px-2 md:px-6 pt-4 pb-4 overflow-y-auto flex flex-col"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Selection info with SelectionMessage component */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SelectionMessage type="info" onClear={clearSelections}>
              {activeFilterKey === FILTER_TYPES.COUNTRIES && selectedItems[0]
                ? `${selectedItems[0]?.name || selectedItems[0]?.long_name || 'Country'} selected for data download`
                : activeFilterKey === FILTER_TYPES.CITIES && selectedItems[0]
                  ? `${selectedItems[0]?.name || selectedItems[0]?.long_name || 'City'} selected for data download`
                  : `${selectedItems.length} ${
                      selectedItems.length === 1
                        ? activeFilterKey === FILTER_TYPES.SITES
                          ? 'monitoring site'
                          : 'device'
                        : activeFilterKey === FILTER_TYPES.SITES
                          ? 'monitoring sites'
                          : 'devices'
                    } selected for data download`}
            </SelectionMessage>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection guidance with SelectionMessage component */}
      <AnimatePresence>
        {selectedItems.length === 0 && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SelectionMessage type="info">
              {activeFilterKey === FILTER_TYPES.COUNTRIES ||
              activeFilterKey === FILTER_TYPES.CITIES
                ? `Please select a ${activeFilterKey === FILTER_TYPES.COUNTRIES ? 'country' : 'city'} to download air quality data (only one selection allowed)`
                : `Please select one or more ${activeFilterKey === FILTER_TYPES.SITES ? 'monitoring sites' : 'devices'} to download air quality data`}
            </SelectionMessage>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data table */}
      <motion.div className="flex-grow mt-4" variants={itemVariants}>
        <DataTable
          data={currentFilterData}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          clearSelectionTrigger={clearSelected}
          loading={isLoading}
          error={!!filterErrors[activeFilterKey]}
          errorMessage={filterErrors[activeFilterKey]}
          onToggleRow={handleToggleItem}
          columnsByFilter={columnsByFilter}
          filters={filters}
          onFilter={handleFilter}
          searchKeys={searchKeysByFilter}
          onRetry={() => handleRetryLoad(activeFilterKey)}
        />
      </motion.div>
    </motion.div>
  );
};

/**
 * DataDownload component allows users to download air quality data
 * with various filtering options.
 * Refactored with exact 280px sidebar width and consistent animations.
 *
 * @param {Object} props
 * @param {Function} props.onClose - Function to close the modal
 * @param {string} props.sidebarBg - Background color for sidebar
 */
const DataDownload = ({ onClose, sidebarBg = '#f6f6f7' }) => {
  // Consolidate refs for better cleanup management
  const refs = useRef({
    abortController: null,
    previousFilter: null,
    errorTimeout: null,
  });

  // Get active group info
  const {
    id: activeGroupId,
    title: groupTitle,
    groupList,
  } = useGetActiveGroup();
  const fetchData = useDataDownload();

  // Core state
  const [selectedItems, setSelectedItems] = useState([]);
  const [clearSelected, setClearSelected] = useState(false);
  const [formError, setFormError] = useState('');
  const [messageType, setMessageType] = useState(MESSAGE_TYPES.INFO);
  const [statusMessage, setStatusMessage] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [filterErrors, setFilterErrors] = useState({});
  const [edit, setEdit] = useState(false);
  const [activeFilterKey, setActiveFilterKey] = useState('sites');
  const [selectedGridId, setSelectedGridId] = useState(null);

  // Organization options derived from group list
  const ORGANIZATION_OPTIONS = useMemo(
    () =>
      groupList?.map((group) => ({
        id: group._id,
        name: group.grp_title,
      })) || [],
    [groupList],
  );

  // Filter data type options based on active filter
  const filteredDataTypeOptions = useMemo(() => {
    if (
      activeFilterKey === FILTER_TYPES.COUNTRIES ||
      activeFilterKey === FILTER_TYPES.CITIES
    ) {
      return DATA_TYPE_OPTIONS.filter(
        (option) => option.name.toLowerCase() !== 'raw data',
      );
    }
    return DATA_TYPE_OPTIONS;
  }, [activeFilterKey]);

  // Active group info for organization selection
  const activeGroup = useMemo(
    () => ({ id: activeGroupId, name: groupTitle }),
    [activeGroupId, groupTitle],
  );

  // Form state with defaults
  const [formData, setFormData] = useState({
    title: { name: 'Untitled Report' },
    organization: null,
    dataType: DATA_TYPE_OPTIONS[0],
    pollutant: POLLUTANT_OPTIONS[0],
    duration: null,
    frequency: FREQUENCY_OPTIONS[0],
    fileType: FILE_TYPE_OPTIONS[0],
  });

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
  } = useSitesSummary(formData.organization?.name?.toLowerCase(), {
    enabled: !!formData.organization?.name,
  });

  const {
    data: devicesData,
    isLoading: devicesLoading,
    isError: devicesError,
    error: devicesErrorMsg,
    refresh: refreshDevices,
  } = useDeviceSummary(formData.organization?.name?.toLowerCase(), {
    enabled: !!formData.organization?.name,
  });

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
  } = useGridSummary('city');

  // Enhanced error handling with automatic clearing
  const resetErrorAfterDelay = useCallback((error) => {
    setFormError(error);

    if (refs.current.errorTimeout) {
      clearTimeout(refs.current.errorTimeout);
    }

    refs.current.errorTimeout = setTimeout(() => {
      setFormError('');
    }, 2000);
  }, []);

  // Complete cleanup on unmount
  useEffect(() => {
    return () => {
      if (refs.current.abortController) {
        refs.current.abortController.abort();
      }
      if (refs.current.errorTimeout) {
        clearTimeout(refs.current.errorTimeout);
      }
    };
  }, []);

  // Set initial organization once data is loaded
  useEffect(() => {
    if (!formData.organization && ORGANIZATION_OPTIONS.length > 0) {
      const airqoNetwork = ORGANIZATION_OPTIONS.find(
        (group) => group.name?.toLowerCase() === 'airqo',
      );

      setFormData((prev) => ({
        ...prev,
        organization: activeGroup?.id
          ? activeGroup
          : airqoNetwork || ORGANIZATION_OPTIONS[0],
      }));
    }
  }, [ORGANIZATION_OPTIONS, activeGroup, formData.organization]);

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
  }, [selectedGridId, isLoadingSiteIds, isSiteIdsError, siteAndDeviceIds]);

  // Handle filter tab changes and clear selections
  useEffect(() => {
    if (
      refs.current.previousFilter &&
      refs.current.previousFilter !== activeFilterKey
    ) {
      clearSelections();

      // If switching to Countries or Cities and Raw Data is selected, switch to Calibrated Data
      if (
        (activeFilterKey === FILTER_TYPES.COUNTRIES ||
          activeFilterKey === FILTER_TYPES.CITIES) &&
        formData.dataType.name.toLowerCase() === 'raw data'
      ) {
        setFormData((prev) => ({
          ...prev,
          dataType:
            DATA_TYPE_OPTIONS.find(
              (opt) => opt.name.toLowerCase() === 'calibrated data',
            ) || DATA_TYPE_OPTIONS[0],
        }));
      }
    }
    refs.current.previousFilter = activeFilterKey;
  }, [activeFilterKey]);

  // Clear selections without resetting form data
  const clearSelections = useCallback(() => {
    setSelectedItems([]);
    setSelectedGridId(null);
    setStatusMessage('');
    setFormError('');
    setClearSelected(true);
    setTimeout(() => setClearSelected(false), 50);
  }, []);

  // Reset everything including form data
  const handleClearSelection = useCallback(() => {
    clearSelections();

    // Reset form data to defaults
    const airqoNetwork = ORGANIZATION_OPTIONS.find(
      (group) => group.name?.toLowerCase() === 'airqo',
    );

    setFormData({
      title: { name: 'Untitled Report' },
      organization: activeGroup?.id
        ? activeGroup
        : airqoNetwork || ORGANIZATION_OPTIONS[0],
      dataType: DATA_TYPE_OPTIONS[0],
      pollutant: POLLUTANT_OPTIONS[0],
      duration: null,
      frequency: FREQUENCY_OPTIONS[0],
      fileType: FILE_TYPE_OPTIONS[0],
    });
  }, [ORGANIZATION_OPTIONS, activeGroup, clearSelections]);

  // Handle form field updates
  const handleOptionSelect = useCallback(
    (id, option) => {
      setFormData((prev) => ({ ...prev, [id]: option }));

      // Refresh data when organization changes
      if (id === 'organization' && option?.name) {
        refreshSites();
        refreshDevices();
        clearSelections();
      }
    },
    [refreshSites, refreshDevices, clearSelections],
  );

  // Toggle item selection
  const handleToggleItem = useCallback(
    (item) => {
      // For countries and cities, only allow one selection
      if (
        activeFilterKey === FILTER_TYPES.COUNTRIES ||
        activeFilterKey === FILTER_TYPES.CITIES
      ) {
        const isSelected = selectedItems.some((s) => s._id === item._id);

        if (isSelected) {
          // Deselect
          setSelectedItems([]);
          setSelectedGridId(null);
          setStatusMessage('');
        } else {
          // Select new item
          setSelectedItems([item]);
          setSelectedGridId(item._id);
        }
        return;
      }

      // For sites and devices, allow unlimited selections
      const isSelected = selectedItems.some((s) => s._id === item._id);
      setSelectedItems((prev) =>
        isSelected ? prev.filter((s) => s._id !== item._id) : [...prev, item],
      );
      setFormError('');
    },
    [activeFilterKey, selectedItems],
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
    [refreshCountries, refreshCities, refreshDevices, refreshSites],
  );

  // Enhanced validation function
  const validateFormData = useCallback((formData, selectedItems) => {
    if (!formData.duration?.name?.start || !formData.duration?.name?.end) {
      return 'Please select a valid date range';
    }

    if (!selectedItems.length) {
      return 'Please select at least one location to download data from';
    }

    const startDate = new Date(formData.duration.name.start);
    const endDate = new Date(formData.duration.name.end);

    // Validate date range
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 'Invalid date selection. Please choose valid dates';
    }

    if (startDate >= endDate) {
      return 'Start date must be before end date';
    }

    // Duration validation based on frequency
    const frequencyLower = formData.frequency.name.toLowerCase();
    if (frequencyLower === 'hourly') {
      const diffMs = endDate - startDate;
      const sixMonthsMs = 180 * 24 * 60 * 60 * 1000; // 180 days in milliseconds
      if (diffMs > sixMonthsMs) {
        return 'For hourly data, please limit your selection to 6 months';
      }
    }

    return null; // No errors
  }, []);

  // Handle download submission with improved error handling
  const handleSubmit = useCallback(
    async (e) => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }

      // Abort any existing request
      if (refs.current.abortController) {
        refs.current.abortController.abort();
      }
      refs.current.abortController = new AbortController();

      setDownloadLoading(true);
      setFormError('');

      try {
        // Enhanced validation with specific error messages
        const validationError = validateFormData(formData, selectedItems);
        if (validationError) {
          throw new Error(validationError);
        }

        const startDate = new Date(formData.duration.name.start);
        const endDate = new Date(formData.duration.name.end);

        // Prepare payload based on selected filter type
        let siteIds = [];
        let deviceNames = [];

        if (
          activeFilterKey === FILTER_TYPES.COUNTRIES ||
          activeFilterKey === FILTER_TYPES.CITIES
        ) {
          if (!siteAndDeviceIds?.site_ids?.length) {
            throw new Error(
              `No monitoring sites found for the selected ${
                activeFilterKey === FILTER_TYPES.COUNTRIES ? 'country' : 'city'
              }`,
            );
          }
          siteIds = siteAndDeviceIds.site_ids;
        } else if (activeFilterKey === FILTER_TYPES.SITES) {
          siteIds = selectedItems.map((site) => site._id);
        } else if (activeFilterKey === FILTER_TYPES.DEVICES) {
          deviceNames = selectedItems.map(
            (device) => device.name || device.long_name,
          );
        }

        // API request data with proper organization naming
        const apiData = {
          startDateTime: format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
          endDateTime: format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
          network: formData.organization.name,
          datatype:
            formData.dataType.name.toLowerCase() === 'calibrated data'
              ? 'calibrated'
              : 'raw',
          pollutants: [formData.pollutant.name.toLowerCase().replace('.', '_')],
          frequency: formData.frequency.name.toLowerCase(),
          downloadType: formData.fileType.name.toLowerCase(),
          outputFormat: 'airqo-standard',
          minimum: true,
        };

        // Add the appropriate selection parameters based on filter type
        if (activeFilterKey === FILTER_TYPES.DEVICES) {
          apiData.device_names = deviceNames;
        } else {
          apiData.sites = siteIds;
        }

        // Set timeout for the request
        const timeoutId = setTimeout(() => {
          if (refs.current.abortController) {
            refs.current.abortController.abort();
            resetErrorAfterDelay('Request timed out. Please try again later.');
            setMessageType(MESSAGE_TYPES.ERROR);
            setDownloadLoading(false);
          }
        }, 60000); // 60-second timeout

        try {
          // Make API call
          const response = await fetchData(apiData);
          clearTimeout(timeoutId);

          // Set file name and extension
          const fileExtension = formData.fileType.name.toLowerCase();
          const mimeType = getMimeType(fileExtension);
          const fileName = `${formData.title.name || 'Air_Quality_Data'}.${fileExtension}`;

          // Process response based on file type
          if (fileExtension === 'csv') {
            // Process CSV data
            let csvData =
              typeof response === 'string'
                ? response.startsWith('resp')
                  ? response.substring(4)
                  : response
                : typeof response === 'object' &&
                    response !== null &&
                    response.data
                  ? typeof response.data === 'string'
                    ? response.data
                    : JSON.stringify(response.data)
                  : 'datetime,device_name,frequency,network,pm2_5_calibrated_value,site_name\n';

            // Save as CSV
            const blob = new Blob([csvData], { type: mimeType });
            if (blob.size > 10) {
              saveAs(blob, fileName);
            } else {
              throw new Error('No data available for the selected criteria');
            }
          } else if (fileExtension === 'json') {
            // Process JSON data
            let jsonData =
              typeof response === 'string'
                ? JSON.parse(response)
                : typeof response === 'object' && response !== null
                  ? response.data || response
                  : { error: 'No data available' };

            // Save as JSON
            const jsonString = JSON.stringify(jsonData, null, 2);
            saveAs(new Blob([jsonString], { type: mimeType }), fileName);
          } else if (fileExtension === 'pdf') {
            // Process PDF data
            const doc = new jsPDF();
            let pdfData = [];

            if (typeof response === 'string') {
              try {
                pdfData = JSON.parse(response).data || [];
              } catch {
                // Try to parse as CSV if JSON fails
                const lines = response.split('\n');
                if (lines.length > 1) {
                  const headers = lines[0].split(',');
                  pdfData = lines
                    .slice(1)
                    .filter(Boolean)
                    .map((line) => {
                      const values = line.split(',');
                      return headers.reduce((obj, header, i) => {
                        obj[header] = values[i];
                        return obj;
                      }, {});
                    });
                }
              }
            } else if (typeof response === 'object' && response !== null) {
              pdfData = response.data || [];
            }

            // Create PDF
            if (!pdfData || pdfData.length === 0) {
              doc.text('No data available to display', 10, 10);
            } else {
              const tableColumn = Object.keys(pdfData[0]);
              const tableRows = pdfData.map((row) =>
                tableColumn.map((col) =>
                  row[col] !== undefined ? row[col] : '---',
                ),
              );

              doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [22, 160, 133] },
                theme: 'striped',
                margin: { top: 20 },
              });
            }

            doc.save(fileName);
          } else {
            throw new Error(
              'Unsupported file format. Please select CSV, JSON, or PDF.',
            );
          }

          // Success handling
          CustomToast();
          handleClearSelection();
          onClose();
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      } catch (error) {
        console.error('Download error:', error);

        // Skip analytics tracking for aborted requests
        if (error.name !== 'AbortError') {
          event({
            action: 'download_error',
            category: 'Data Export',
            label: error.message || 'Unknown error',
          });
        }

        resetErrorAfterDelay(
          error.message || 'Error downloading the data. Please try again.',
        );
        setMessageType(MESSAGE_TYPES.ERROR);
      } finally {
        setDownloadLoading(false);
        refs.current.abortController = null;
      }
    },
    [
      formData,
      selectedItems,
      activeFilterKey,
      siteAndDeviceIds,
      fetchData,
      handleClearSelection,
      onClose,
      validateFormData,
      resetErrorAfterDelay,
    ],
  );

  // Define filter tabs
  const filters = useMemo(
    () => [
      { key: FILTER_TYPES.COUNTRIES, label: 'Countries' },
      { key: FILTER_TYPES.CITIES, label: 'Cities' },
      { key: FILTER_TYPES.SITES, label: 'Sites' },
      { key: FILTER_TYPES.DEVICES, label: 'Devices' },
    ],
    [],
  );

  // Get data for current filter tab with proper null handling
  const currentFilterData = useMemo(() => {
    const dataMap = {
      [FILTER_TYPES.COUNTRIES]: countriesData || [],
      [FILTER_TYPES.CITIES]: citiesData || [],
      [FILTER_TYPES.DEVICES]: devicesData || [],
      [FILTER_TYPES.SITES]: sitesData || [],
    };
    return dataMap[activeFilterKey] || [];
  }, [activeFilterKey, countriesData, citiesData, devicesData, sitesData]);

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

  // Columns config for each filter type
  const columnsByFilter = useMemo(
    () => ({
      countries: [
        {
          key: 'name',
          label: 'Country',
          render: (item) => (
            <div className="flex items-center capitalize">
              <span className="p-2 rounded-full bg-[#F6F6F7] mr-3">
                <WorldIcon width={16} height={16} fill="#9EA3AA" />
              </span>
              <span>{item.name || item.long_name || 'N/A'}</span>
            </div>
          ),
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
              <span className="p-2 rounded-full bg-[#F6F6F7] mr-3">
                <LocationIcon width={16} height={16} fill="#9EA3AA" />
              </span>
              <span>
                {(item.name || item.long_name || '')
                  .split('_')
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() +
                      word.slice(1).toLowerCase(),
                  )
                  .join(' ') || 'N/A'}
              </span>
            </div>
          ),
        },
        {
          key: 'network',
          label: 'Network',
          render: (item) => (
            <span className="capitalize">{item.network || 'N/A'}</span>
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
              <span className="p-2 rounded-full bg-[#F6F6F7] mr-3">
                <LocationIcon width={16} height={16} fill="#9EA3AA" />
              </span>
              <span>{item.search_name || 'N/A'}</span>
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
              <span className="p-2 rounded-full bg-[#F6F6F7] mr-3">
                <DeviceIcon width={16} height={16} />
              </span>
              <span>{item.name || item.long_name || 'N/A'}</span>
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
            <span className="capitalize">{item.network || 'N/A'}</span>
          ),
        },
        {
          key: 'category',
          label: 'Category',
          render: (item) => (
            <span className="capitalize">{item.category || 'N/A'}</span>
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

  // Handle filter tab changes
  const handleFilter = useCallback(
    (_, activeFilter) => {
      if (activeFilter?.key) {
        setActiveFilterKey(activeFilter.key);
        setFormError('');
      }
      return currentFilterData;
    },
    [currentFilterData],
  );

  // Duration guidance based on frequency
  const durationGuidance = useMemo(() => {
    if (formData.frequency?.name?.toLowerCase() === 'hourly') {
      return 'For hourly data, limit selection to 6 months';
    }
    return null;
  }, [formData.frequency]);

  // Get the footer message and message type
  const footerInfo = useMemo(() => {
    if (formError) {
      return { message: formError, type: MESSAGE_TYPES.ERROR };
    }

    if (statusMessage) {
      return { message: statusMessage, type: messageType };
    }

    if (selectedItems.length === 0) {
      return {
        message: 'Select at least one location to continue',
        type: MESSAGE_TYPES.INFO,
      };
    }

    if (!formData.duration) {
      return {
        message: 'Please select a date range before downloading',
        type: MESSAGE_TYPES.WARNING,
      };
    }

    return { message: 'Ready to download', type: MESSAGE_TYPES.INFO };
  }, [
    formError,
    statusMessage,
    messageType,
    selectedItems.length,
    formData.duration,
  ]);

  // Check if download button should be disabled
  const isDownloadDisabled = useMemo(() => {
    return (
      isLoadingSiteIds ||
      downloadLoading ||
      !formData.duration ||
      selectedItems.length === 0
    );
  }, [
    isLoadingSiteIds,
    downloadLoading,
    formData.duration,
    selectedItems.length,
  ]);

  // Main component animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="flex flex-col md:flex-row h-full overflow-hidden"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Settings Panel - Exactly 280px width */}
      <SettingsSidebar
        formData={formData}
        handleOptionSelect={handleOptionSelect}
        handleTitleChange={handleTitleChange}
        edit={edit}
        setEdit={setEdit}
        filteredDataTypeOptions={filteredDataTypeOptions}
        ORGANIZATION_OPTIONS={ORGANIZATION_OPTIONS}
        durationGuidance={durationGuidance}
        handleSubmit={handleSubmit}
        sidebarBg={sidebarBg}
      />

      {/* Main Content Section */}
      <div className="flex-1 flex flex-col relative">
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
          handleToggleItem={handleToggleItem}
          columnsByFilter={columnsByFilter}
          filters={filters}
          handleFilter={handleFilter}
          searchKeysByFilter={searchKeysByFilter[activeFilterKey]}
          handleRetryLoad={handleRetryLoad}
        />

        <Footer
          setError={setFormError}
          messageType={footerInfo.type}
          message={footerInfo.message}
          selectedItems={selectedItems}
          handleClearSelection={handleClearSelection}
          handleSubmit={handleSubmit}
          onClose={onClose}
          btnText={downloadLoading ? 'Downloading...' : 'Download'}
          loading={downloadLoading}
          disabled={isDownloadDisabled}
        />
      </div>
    </motion.div>
  );
};

DataDownload.propTypes = {
  onClose: PropTypes.func.isRequired,
  sidebarBg: PropTypes.string,
};

export default DataDownload;
