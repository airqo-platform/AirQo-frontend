import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
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
import CustomToast from '../../../Toast/CustomToast';
import { format } from 'date-fns';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import { event } from '@/core/hooks/useGoogleAnalytics';

/**
 * Header component for the Download Data modal.
 * Explicitly exported to prevent "undefined component" errors.
 */
export const DownloadDataHeader = () => (
  <h3
    className="flex text-lg leading-6 font-medium text-gray-900"
    id="modal-title"
  >
    Download air quality data
  </h3>
);

// Constants for selection limits
const MAX_SELECTIONS = 10;
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
 * DataDownload component allows users to download air quality data
 * with various filtering options.
 */
const DataDownload = ({ onClose }) => {
  // Initialize refs to prevent infinite loops and handle requests
  const initialLoadRef = useRef(false);
  const abortControllerRef = useRef(null);
  const previousFilterRef = useRef(null);
  const errorTimeoutRef = useRef(null);

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

  // Handle automatic error clearing after 2 seconds
  useEffect(() => {
    if (formError) {
      // Clear any existing timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      // Set new timeout to clear error after 2 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setFormError('');
        errorTimeoutRef.current = null;
      }, 2000);
    }

    // Cleanup timeout on unmount
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [formError]);

  // Set initial organization once data is loaded
  useEffect(() => {
    if (
      !initialLoadRef.current &&
      !formData.organization &&
      ORGANIZATION_OPTIONS.length > 0
    ) {
      const airqoNetwork = ORGANIZATION_OPTIONS.find(
        (group) => group.name?.toLowerCase() === 'airqo',
      );

      setFormData((prev) => ({
        ...prev,
        organization: activeGroup?.id
          ? activeGroup
          : airqoNetwork || ORGANIZATION_OPTIONS[0],
      }));

      initialLoadRef.current = true;
    }
  }, [ORGANIZATION_OPTIONS, activeGroup, formData.organization]);

  // Update filter errors for UI feedback
  useEffect(() => {
    const errors = {};

    if (sitesError)
      errors.sites = sitesErrorMsg?.message || 'Error loading sites';
    if (devicesError)
      errors.devices = devicesErrorMsg?.message || 'Error loading devices';
    if (countriesError)
      errors.countries =
        countriesErrorMsg?.message || 'Error loading countries';
    if (citiesError)
      errors.cities = citiesErrorMsg?.message || 'Error loading cities';

    setFilterErrors(errors);
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
      previousFilterRef.current &&
      previousFilterRef.current !== activeFilterKey
    ) {
      clearSelections();
    }
    previousFilterRef.current = activeFilterKey;
  }, [activeFilterKey]);

  // Cancel any pending requests on unmount or when component re-renders
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  // Clear selections without resetting form data
  const clearSelections = useCallback(() => {
    setSelectedItems([]);
    setSelectedGridId(null);
    setStatusMessage('');
    setFormError('');
    setClearSelected(true);
    setTimeout(() => setClearSelected(false), 0);
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

  // Toggle item selection with validation and UX feedback
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

      // For sites and devices, check max limit
      const isSelected = selectedItems.some((s) => s._id === item._id);
      if (!isSelected && selectedItems.length >= MAX_SELECTIONS) {
        setFormError(
          `You cannot select more than ${MAX_SELECTIONS} ${activeFilterKey}`,
        );
        setMessageType(MESSAGE_TYPES.ERROR);
        return;
      }

      // Update selection
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

  // Handle download submission with comprehensive error handling
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Create abort controller for this request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setDownloadLoading(true);
      setFormError('');

      try {
        // Validate form data
        if (!formData.duration?.name?.start || !formData.duration?.name?.end) {
          throw new Error('Please select a valid date range');
        }

        if (!selectedItems.length) {
          throw new Error('Please select at least one location');
        }

        const startDate = new Date(formData.duration.name.start);
        const endDate = new Date(formData.duration.name.end);

        // Validate date range
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error('Invalid date selection. Please try again');
        }

        if (startDate >= endDate) {
          throw new Error('Start date must be before end date');
        }

        // Duration validation based on frequency
        const validateDuration = (frequency, start, end) => {
          const diffMs = end - start;
          const sixMonthsMs = 180 * 24 * 60 * 60 * 1000;

          if (frequency === 'hourly' && diffMs > sixMonthsMs) {
            return 'For hourly data, please limit your selection to 6 months';
          }

          return null;
        };

        const frequencyLower = formData.frequency.name.toLowerCase();
        const durationError = validateDuration(
          frequencyLower,
          startDate,
          endDate,
        );
        if (durationError) {
          throw new Error(durationError);
        }

        // Prepare payload based on selected filter type
        let siteIds = [];
        let deviceNames = [];

        if (
          activeFilterKey === FILTER_TYPES.COUNTRIES ||
          activeFilterKey === FILTER_TYPES.CITIES
        ) {
          if (!siteAndDeviceIds?.site_ids?.length) {
            throw new Error(
              `No sites found for the selected ${
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
          frequency: frequencyLower,
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

        // Make API call with comprehensive error handling
        const response = await fetchData(apiData).catch((error) => {
          // Ignore aborted requests
          if (error.name === 'AbortError') {
            throw new Error('Request was cancelled');
          }

          // Handle common HTTP errors with user-friendly messages
          if (error.response?.status === 500) {
            throw new Error(
              'Server error. The selected data may be too large. Please try fewer locations or a smaller date range',
            );
          }
          if (error.response?.status === 504) {
            throw new Error(
              'Request timeout. Please try a smaller date range or fewer locations',
            );
          }
          if (error.response?.status === 404) {
            throw new Error('No data found for your selection');
          }
          if (error.response?.status === 400) {
            throw new Error(
              'Invalid request parameters. Please check your selections',
            );
          }
          if (error.message === 'Network Error') {
            throw new Error(
              'Network connection issue. Please check your internet connection',
            );
          }

          // Default error message
          throw error;
        });

        // Process and download the file based on file type
        const fileExtension = formData.fileType.name.toLowerCase();
        const mimeType = getMimeType(fileExtension);
        const fileName = `${formData.title.name || 'Data'}.${fileExtension}`;

        if (fileExtension === 'csv') {
          if (typeof response !== 'string') {
            throw new Error('Invalid CSV data format received');
          }
          saveAs(new Blob([response], { type: mimeType }), fileName);
        } else if (fileExtension === 'json') {
          if (!response.data) {
            throw new Error('Invalid JSON data received');
          }
          const json = JSON.stringify(response.data, null, 2);
          saveAs(new Blob([json], { type: mimeType }), fileName);
        } else if (fileExtension === 'pdf') {
          const pdfData = response.data || [];
          const doc = new jsPDF();

          if (pdfData.length === 0) {
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
          throw new Error('Unsupported file type');
        }

        // Success handling
        CustomToast(); // Show success toast notification
        handleClearSelection(); // Reset the form
        onClose(); // Close the modal
      } catch (error) {
        // Skip analytics tracking for aborted requests
        if (error.name !== 'AbortError') {
          // Log error to analytics
          event({
            action: 'download_error',
            category: 'Data Export',
            label: error.message || 'Unknown error',
          });
        }

        // Set user-friendly error message
        setFormError(error.message || 'An error occurred. Please try again');
        setMessageType(MESSAGE_TYPES.ERROR);
      } finally {
        setDownloadLoading(false);
        if (abortControllerRef.current) {
          abortControllerRef.current = null;
        }
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
            <div className="flex items-center">
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
            <div className="flex items-center">
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
        message: 'Select locations to continue',
        type: MESSAGE_TYPES.INFO,
      };
    }

    return { message: '', type: MESSAGE_TYPES.INFO };
  }, [formError, statusMessage, messageType, selectedItems.length]);

  return (
    <>
      {/* Settings Panel */}
      <form
        className="w-auto h-auto md:w-[280px] md:h-[658px] relative bg-[#f6f6f7] space-y-3 px-5 pt-5 pb-14"
        onSubmit={handleSubmit}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-lg font-medium">Download Settings</h4>
          <button
            type="button"
            className={`text-sm text-blue-600 ${edit ? 'font-semibold' : 'opacity-80'}`}
            onClick={() => setEdit(!edit)}
          >
            {edit ? 'Done' : <EditIcon />}
          </button>
        </div>

        {/* Form Fields */}
        <CustomFields
          field
          title="Title"
          edit={edit}
          id="title"
          defaultOption={{ name: formData.title.name }}
          handleOptionSelect={handleOptionSelect}
        />
        <CustomFields
          title="Organization"
          options={ORGANIZATION_OPTIONS}
          id="organization"
          icon={<WorldIcon width={16} height={16} fill="#000" />}
          defaultOption={formData.organization}
          handleOptionSelect={handleOptionSelect}
          textFormat="uppercase"
        />
        <CustomFields
          title="Data type"
          options={DATA_TYPE_OPTIONS}
          id="dataType"
          icon={<CalibrateIcon />}
          defaultOption={formData.dataType}
          handleOptionSelect={handleOptionSelect}
        />
        <CustomFields
          title="Pollutant"
          options={POLLUTANT_OPTIONS}
          id="pollutant"
          icon={<WindIcon />}
          defaultOption={formData.pollutant}
          handleOptionSelect={handleOptionSelect}
        />
        <CustomFields
          title="Duration"
          id="duration"
          useCalendar
          defaultOption={formData.duration}
          handleOptionSelect={handleOptionSelect}
        />
        {durationGuidance && (
          <div className="text-xs text-blue-600 -mt-2 ml-1">
            {durationGuidance}
          </div>
        )}
        <CustomFields
          title="Frequency"
          options={FREQUENCY_OPTIONS}
          id="frequency"
          icon={<FrequencyIcon />}
          defaultOption={formData.frequency}
          handleOptionSelect={handleOptionSelect}
        />
        <CustomFields
          title="File type"
          options={FILE_TYPE_OPTIONS}
          id="fileType"
          icon={<FileTypeIcon />}
          defaultOption={formData.fileType}
          handleOptionSelect={handleOptionSelect}
        />
      </form>

      {/* Data Table Section */}
      <div className="bg-white relative w-full h-auto">
        <div className="px-2 md:px-8 pt-6 pb-4 overflow-y-auto">
          {/* Selection info - keeping basic selection info but removing error UI */}
          {selectedItems.length > 0 && (
            <div className="mb-4 flex justify-between items-center px-4 py-2 bg-blue-50 border-l-4 border-blue-400 rounded-md">
              <div className="text-blue-800 text-sm">
                {activeFilterKey === FILTER_TYPES.COUNTRIES && selectedItems[0]
                  ? `${selectedItems[0]?.name || selectedItems[0]?.long_name || 'Country'} selected`
                  : activeFilterKey === FILTER_TYPES.CITIES && selectedItems[0]
                    ? `${selectedItems[0]?.name || selectedItems[0]?.long_name || 'City'} selected`
                    : `${selectedItems.length} ${
                        selectedItems.length === 1
                          ? activeFilterKey === FILTER_TYPES.SITES
                            ? 'site'
                            : 'device'
                          : activeFilterKey
                      } selected`}
              </div>
              <button
                onClick={clearSelections}
                className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                aria-label="Clear selections"
                type="button"
              >
                Clear
              </button>
            </div>
          )}

          {/* Selection guidance - keeping this helpful info */}
          {selectedItems.length === 0 && (
            <div className="mb-4 px-4 py-2 bg-blue-50 border-l-4 border-blue-400 rounded-md">
              <p className="text-blue-800 text-sm">
                {activeFilterKey === FILTER_TYPES.COUNTRIES ||
                activeFilterKey === FILTER_TYPES.CITIES
                  ? `You can select one ${activeFilterKey === FILTER_TYPES.COUNTRIES ? 'country' : 'city'} at a time`
                  : `You can select up to ${MAX_SELECTIONS} ${activeFilterKey}`}
              </p>
            </div>
          )}

          {/* Data table */}
          <DataTable
            data={currentFilterData}
            selectedRows={selectedItems}
            setSelectedRows={setSelectedItems}
            clearSelectionTrigger={clearSelected}
            loading={isLoading}
            error={!!filterErrors[activeFilterKey]}
            onToggleRow={handleToggleItem}
            columnsByFilter={columnsByFilter}
            filters={filters}
            onFilter={handleFilter}
            searchKeys={searchKeysByFilter[activeFilterKey]}
            onRetry={() => handleRetryLoad(activeFilterKey)}
          />
        </div>

        {/* Footer - now handles all error display */}
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
          disabled={isLoadingSiteIds || downloadLoading}
        />
      </div>
    </>
  );
};

export default DataDownload;
