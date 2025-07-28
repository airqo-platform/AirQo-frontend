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
import {
  AqXClose,
  AqGlobe05,
  AqMarkerPin01,
  AqMonitor03,
  AqMenu01,
} from '@airqo/icons-react';
import Footer from '../components/Footer';

import ErrorBoundary from '@/components/ErrorBoundary';

import {
  POLLUTANT_OPTIONS,
  DATA_TYPE_OPTIONS,
  FREQUENCY_OPTIONS,
  FILE_TYPE_OPTIONS,
} from './constants';

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
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';
import { event } from '@/core/hooks/useGoogleAnalytics';
import SettingsSidebar from './components/SettingsSidebar';
import DataContent, { FILTER_TYPES } from './components/DataContent';
import { useDispatch } from 'react-redux';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import { getMimeType } from './utils';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import InfoMessage from '@/components/Messages/InfoMessage';

/**
 * Header component for the Download Data modal.
 */
export const DownloadDataHeader = () => (
  <h3
    className="flex text-lg leading-6 font-medium dark:text-white"
    id="modal-title"
  >
    Download air quality data
  </h3>
);

// Message types for footer component
const MESSAGE_TYPES = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

/**
 * DataDownload component allows users to download air quality data
 * with various filtering options.
 * Refactored for better mobile responsiveness with a toggleable sidebar.
 *
 * @param {Object} props
 * @param {Function} props.onClose - Function to close the modal
 * @param {string} props.sidebarBg - Background color for sidebar
 */
const DataDownload = ({ onClose, sidebarBg = '#f6f6f7' }) => {
  const dispatch = useDispatch();
  // Consolidate refs for better cleanup management
  const refs = useRef({
    abortController: null,
    previousFilter: null,
    errorTimeout: null,
  });
  // Mobile UI state
  const [isMobileSidebarVisible, setMobileSidebarVisible] = useState(false);

  // Get active group info
  const { id: activeGroupId, title: groupTitle } = useGetActiveGroup();
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
  const { theme, systemTheme } = useTheme();
  const darkMode = useMemo(() => {
    return theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  }, [theme, systemTheme]);
  // All data type options are available for all filter types
  const filteredDataTypeOptions = useMemo(() => {
    return DATA_TYPE_OPTIONS;
  }, []);

  // Active group info - automatically used instead of manual selection
  const activeGroup = useMemo(
    () => ({ id: activeGroupId, name: groupTitle }),
    [activeGroupId, groupTitle],
  );
  // Form state with defaults - organization is automatically determined from active group
  const [formData, setFormData] = useState({
    title: { name: 'Untitled Report' },
    dataType: DATA_TYPE_OPTIONS[0],
    pollutant: [POLLUTANT_OPTIONS[0]],
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
  // Data fetching hooks with dependencies - using active group instead of manual selection
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
  useEffect(() => {
    if (
      refs.current.previousFilter &&
      refs.current.previousFilter !== activeFilterKey
    ) {
      clearSelections();
      // Removed data type restriction for countries and cities
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

    // Reset form data to defaults - no organization field needed
    setFormData({
      title: { name: 'Untitled Report' },
      dataType: DATA_TYPE_OPTIONS[0],
      pollutant: POLLUTANT_OPTIONS[0],
      duration: null,
      frequency: FREQUENCY_OPTIONS[0],
      fileType: FILE_TYPE_OPTIONS[0],
    });
  }, [clearSelections]);

  // Handle form field updates - organization is automatically handled by active group
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

    // Duration validation based on frequency
    const frequencyLower = formData.frequency.name.toLowerCase();
    if (frequencyLower === 'hourly') {
      const diffMs = endDate - startDate;
      const sixMonthsMs = 180 * 24 * 60 * 60 * 1000;
      if (diffMs > sixMonthsMs) {
        return 'For hourly data, please limit your selection to 6 months';
      }
    }

    return null;
  }, []);

  // Handle download submission with improved error handling
  const handleSubmit = useCallback(
    async (e) => {
      if (e && e.preventDefault) {
        e.preventDefault();
      }

      // Close mobile sidebar if open
      if (isMobileSidebarVisible) {
        setMobileSidebarVisible(false);
      }

      // Abort any existing request
      if (refs.current.abortController) {
        refs.current.abortController.abort();
      }
      refs.current.abortController = new AbortController();

      setDownloadLoading(true);
      setFormError('');

      try {
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
          // TODO: uncomment when API supports it FOR ALL
          // network: formData.organization.name,
          datatype:
            formData.dataType.name.toLowerCase() === 'calibrated data'
              ? 'calibrated'
              : 'raw',
          pollutants: formData.pollutant.map((p) =>
            p.name.toLowerCase().replace('.', '_'),
          ),
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
        }, 60000);

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
            let jsonData;
            try {
              if (typeof response === 'string') {
                // Check if the response is CSV (contains commas and newlines)
                if (response.includes(',') && response.includes('\n')) {
                  // Parse CSV to JSON
                  const lines = response.trim().split('\n');
                  const headers = lines[0].split(',');
                  jsonData = lines.slice(1).map((line) => {
                    const values = line.split(',');
                    return headers.reduce((obj, header, index) => {
                      // Clean up the values and handle empty fields
                      let value = values[index] ? values[index].trim() : '';
                      obj[header.trim()] = value || null;
                      return obj;
                    }, {});
                  });
                } else {
                  // Try parsing as JSON if it's not CSV
                  jsonData = JSON.parse(response);
                }
              } else if (typeof response === 'object' && response !== null) {
                jsonData = response.data || response;
              } else {
                throw new Error('No data available');
              }

              if (
                !jsonData ||
                (Array.isArray(jsonData) && jsonData.length === 0)
              ) {
                throw new Error('No data available for the selected criteria');
              }
            } catch (error) {
              if (
                error.message === 'No data available' ||
                error.message === 'No data available for the selected criteria'
              ) {
                throw error;
              }
              throw new Error(
                'Error processing the data. Please try again or contact support.',
              );
            }
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
      isMobileSidebarVisible,
    ],
  );

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
                <span>{formattedName || 'N/A'}</span>
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
          key: 'name',
          label: 'Location',
          render: (item) => (
            <div className="flex items-center">
              <span className="p-2 rounded-full bg-[#F6F6F7] dark:bg-gray-700 mr-3">
                <AqMarkerPin01 size={16} />
              </span>
              <span>
                {item.name || item.search_name || item.location_name || 'N/A'}
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

  // Animation variants
  const animations = {
    pageVariants: {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.3 } },
      exit: { opacity: 0, transition: { duration: 0.2 } },
    },
    sidebarVariants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.3, staggerChildren: 0.07 },
      },
    },
    itemVariants: {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 },
    },
  };
  // Render sidebar content based on loading state
  const renderSidebarContent = () => {
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
        handleSubmit={handleSubmit}
        sidebarBg={darkMode ? '' : sidebarBg}
        isMobile={isMobileSidebarVisible}
      />
    );
  };

  // Render main content area with error handling
  const renderMainContent = () => {
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
            backToDownload: true,
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
          handleToggleItem={handleToggleItem}
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
  };

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
        {' '}
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
        </div>{' '}
        {/* Mobile/Tablet Menu Button */}
        <div className="lg:hidden px-4 md:px-6 pt-2 flex-shrink-0">
          <button
            onClick={() => setMobileSidebarVisible(true)}
            aria-label="Open settings menu"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <AqMenu01 size={24} className="mr-1" />
            <span>Settings</span>
          </button>
        </div>
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileSidebarVisible && (
            <motion.div
              className="absolute inset-0 z-50 flex h-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-[240px] h-full relative bg-white dark:bg-[#1d1f20] overflow-x-hidden overflow-y-auto shadow-lg"
                initial={{ x: -350 }}
                animate={{ x: 0 }}
                exit={{ x: -350 }}
              >
                <div className="p-2 absolute z-50 top-0 right-0">
                  <button
                    onClick={() => setMobileSidebarVisible(false)}
                    aria-label="Close sidebar menu"
                  >
                    <AqXClose size={16} />
                  </button>
                </div>
                {renderSidebarContent()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>{' '}
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
            handleSubmit={handleSubmit}
            onClose={onClose}
            btnText={downloadLoading ? 'Downloading...' : 'Download'}
            loading={downloadLoading}
            disabled={isDownloadDisabled}
          />
        </div>
      </motion.div>
    </ErrorBoundary>
  );
};

DataDownload.propTypes = {
  onClose: PropTypes.func.isRequired,
  sidebarBg: PropTypes.string,
};

export default DataDownload;
