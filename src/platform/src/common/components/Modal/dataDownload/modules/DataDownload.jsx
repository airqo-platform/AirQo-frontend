import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
} from '@/core/hooks/analyticHooks';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import CustomToast from '../../../Toast/CustomToast';
import { format } from 'date-fns';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';

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

/**
 * Helper function to map file types to MIME types.
 */
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
  // Get active group info
  const {
    id: activeGroupId,
    title: groupTitle,
    groupList,
    loading: isFetchingActiveGroup,
  } = useGetActiveGroup();

  const fetchData = useDataDownload();

  // Local state
  const [selectedSites, setSelectedSites] = useState([]);
  const [clearSelected, setClearSelected] = useState(false);
  const [formError, setFormError] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [activeFilterKey, setActiveFilterKey] = useState('sites');
  const [dataError, setDataError] = useState(null);

  // Prepare active group info
  const activeGroup = useMemo(() => {
    return { id: activeGroupId, name: groupTitle };
  }, [activeGroupId, groupTitle]);

  // Organization options
  const ORGANIZATION_OPTIONS = useMemo(
    () =>
      groupList?.map((group) => ({
        id: group._id,
        name: group.grp_title,
      })) || [],
    [groupList],
  );

  // Form state
  const [formData, setFormData] = useState({
    title: { name: 'Untitled Report' },
    organization: null,
    dataType: DATA_TYPE_OPTIONS[0],
    pollutant: POLLUTANT_OPTIONS[0],
    duration: null,
    frequency: FREQUENCY_OPTIONS[0],
    fileType: FILE_TYPE_OPTIONS[0],
  });

  // Set initial organization once data is loaded
  useEffect(() => {
    if (!formData.organization && !isFetchingActiveGroup) {
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
  }, [
    isFetchingActiveGroup,
    ORGANIZATION_OPTIONS,
    activeGroup,
    formData.organization,
  ]);

  // Fetch sites data
  const {
    data: sitesData,
    isLoading: sitesLoading,
    isError: sitesError,
    error: sitesErrorMsg,
    refresh: refreshSites,
  } = useSitesSummary(formData.organization?.name?.toLowerCase(), {
    enabled: !isFetchingActiveGroup && !!formData.organization?.name,
  });

  // Fetch devices data
  const {
    data: devicesData,
    isLoading: devicesLoading,
    isError: devicesError,
    error: devicesErrorMsg,
    refresh: refreshDevices,
  } = useDeviceSummary(formData.organization?.name?.toLowerCase(), {
    enabled: !isFetchingActiveGroup && !!formData.organization?.name,
  });

  // Fetch country grids data
  const {
    data: countriesData,
    isLoading: countriesLoading,
    isError: countriesError,
    error: countriesErrorMsg,
  } = useGridSummary('country', {
    enabled: !isFetchingActiveGroup,
  });

  // Fetch city grids data
  const {
    data: citiesData,
    isLoading: citiesLoading,
    isError: citiesError,
    error: citiesErrorMsg,
  } = useGridSummary('city', {
    enabled: !isFetchingActiveGroup,
  });

  // Update error state based on active filter
  useEffect(() => {
    // Set error based on active filter
    switch (activeFilterKey) {
      case 'countries':
        if (countriesError) {
          setDataError(
            countriesErrorMsg?.message || 'Error loading countries data',
          );
        } else {
          setDataError(null);
        }
        break;
      case 'cities':
        if (citiesError) {
          setDataError(citiesErrorMsg?.message || 'Error loading cities data');
        } else {
          setDataError(null);
        }
        break;
      case 'devices':
        if (devicesError) {
          setDataError(
            devicesErrorMsg?.message || 'Error loading devices data',
          );
        } else {
          setDataError(null);
        }
        break;
      case 'sites':
      default:
        if (sitesError) {
          setDataError(sitesErrorMsg?.message || 'Error loading sites data');
        } else {
          setDataError(null);
        }
        break;
    }
  }, [
    activeFilterKey,
    sitesError,
    sitesErrorMsg,
    devicesError,
    devicesErrorMsg,
    countriesError,
    countriesErrorMsg,
    citiesError,
    citiesErrorMsg,
  ]);

  /**
   * Clear selection in both the table and form.
   */
  const handleClearSelection = useCallback(() => {
    setClearSelected(true);
    setSelectedSites([]);

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

    setTimeout(() => setClearSelected(false), 0);
  }, [ORGANIZATION_OPTIONS, activeGroup]);

  /**
   * Update a form field (title, organization, etc.).
   */
  const handleOptionSelect = useCallback(
    (id, option) => {
      setFormData((prevData) => ({ ...prevData, [id]: option }));

      // Refresh data when organization changes
      if (id === 'organization' && option?.name) {
        refreshSites();
        refreshDevices();
      }
    },
    [refreshSites, refreshDevices],
  );

  /**
   * Toggles the selection of a site in DataTable.
   */
  const handleToggleSite = useCallback((item) => {
    setSelectedSites((prev) => {
      const isSelected = prev.some((s) => s._id === item._id);
      return isSelected
        ? prev.filter((s) => s._id !== item._id)
        : [...prev, item];
    });
  }, []);

  /**
   * Download button handler
   */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setDownloadLoading(true);
      setFormError('');

      try {
        // Validate date range
        if (
          !formData.duration ||
          !formData.duration.name?.start ||
          !formData.duration.name?.end
        ) {
          throw new Error(
            'Please select a valid duration with both start and end dates.',
          );
        }

        const startDate = new Date(formData.duration.name.start);
        const endDate = new Date(formData.duration.name.end);

        // Duration constraints for hourly/daily
        const validateDuration = (frequency, sDate, eDate) => {
          const sixMonthsInMs = 6 * 30 * 24 * 60 * 60 * 1000;
          const oneYearInMs = 12 * 30 * 24 * 60 * 60 * 1000;
          const durationMs = eDate - sDate;
          if (frequency === 'hourly' && durationMs > sixMonthsInMs) {
            return 'For hourly frequency, the duration cannot exceed 6 months.';
          }
          if (frequency === 'daily' && durationMs > oneYearInMs) {
            return 'For daily frequency, the duration cannot exceed 1 year.';
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

        // At least one location
        if (selectedSites.length === 0) {
          throw new Error('Please select at least one location.');
        }

        // Prepare data for the API
        const apiData = {
          startDateTime: format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
          endDateTime: format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
          sites: selectedSites.map((site) => site._id),
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

        // Make API call
        const response = await fetchData(apiData);

        // Build filename and MIME
        const fileExtension = formData.fileType.name.toLowerCase();
        const mimeType = getMimeType(fileExtension);
        const fileName = `${formData.title.name}.${fileExtension}`;

        // Download logic
        if (fileExtension === 'csv') {
          if (typeof response !== 'string') {
            throw new Error('Invalid CSV data format.');
          }
          const blob = new Blob([response], { type: mimeType });
          saveAs(blob, fileName);
        } else if (fileExtension === 'json') {
          const json = JSON.stringify(response.data, null, 2);
          const blob = new Blob([json], { type: mimeType });
          saveAs(blob, fileName);
        } else if (fileExtension === 'pdf') {
          const pdfData = response.data || [];
          const doc = new jsPDF();
          if (pdfData.length === 0) {
            doc.text('No data available to display.', 10, 10);
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
          throw new Error('Unsupported file type.');
        }

        // Success
        CustomToast();
        handleClearSelection();
        onClose();
      } catch (error) {
        console.error('Error downloading data:', error);
        setFormError(
          error.message ||
            'An error occurred while downloading. Please try again.',
        );
      } finally {
        setDownloadLoading(false);
      }
    },
    [formData, selectedSites, handleClearSelection, fetchData, onClose],
  );

  /**
   * Define the filter tabs
   */
  const filters = useMemo(
    () => [
      { key: 'countries', label: 'Countries' },
      { key: 'cities', label: 'Cities' },
      { key: 'sites', label: 'Sites' },
      { key: 'devices', label: 'Devices' },
    ],
    [],
  );

  /**
   * Define columns for each filter type
   */
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
              <span>{item.name || item.long_name || 'N/A'}</span>
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

  /**
   * Generate search keys for each filter type
   */
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

  /**
   * Filter handler - this is called by the DataTable component
   * Updates the activeFilterKey state and returns the appropriate data
   */
  const handleFilter = useCallback(
    (allData, activeFilter) => {
      // Update the active filter key
      setActiveFilterKey(activeFilter.key);

      // Return data based on filter type
      switch (activeFilter.key) {
        case 'countries':
          return countriesData || [];
        case 'cities':
          return citiesData || [];
        case 'devices':
          return devicesData || [];
        case 'sites':
        default:
          return sitesData || [];
      }
    },
    [countriesData, citiesData, devicesData, sitesData],
  );

  // Determine loading state based on active filter
  const isLoading = useMemo(() => {
    switch (activeFilterKey) {
      case 'countries':
        return countriesLoading;
      case 'cities':
        return citiesLoading;
      case 'devices':
        return devicesLoading;
      case 'sites':
      default:
        return sitesLoading;
    }
  }, [
    activeFilterKey,
    sitesLoading,
    devicesLoading,
    countriesLoading,
    citiesLoading,
  ]);

  return (
    <>
      {/* Section 1: Form */}
      <form
        className="w-auto h-auto md:w-[280px] md:h-[658px] relative bg-[#f6f6f7] space-y-3 px-5 pt-5 pb-14"
        onSubmit={handleSubmit}
      >
        {/* Edit Title Button */}
        <button
          type="button"
          className={`absolute top-8 right-6 ${edit ? 'text-blue-600' : ''}`}
          onClick={() => setEdit(!edit)}
        >
          {edit ? 'Done' : <EditIcon />}
        </button>

        {/* Custom Fields */}
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

      {/* Section 2: Data Table and Footer */}
      <div className="bg-white relative w-full h-auto">
        <div className="px-2 md:px-8 pt-6 pb-4 overflow-y-auto">
          <DataTable
            data={sitesData}
            selectedRows={selectedSites}
            setSelectedRows={setSelectedSites}
            clearSelectionTrigger={clearSelected}
            loading={isLoading}
            error={dataError !== null}
            onToggleRow={handleToggleSite}
            columnsByFilter={columnsByFilter}
            filters={filters}
            onFilter={handleFilter}
            searchKeys={searchKeysByFilter[activeFilterKey]}
          />

          {/* Display error message if there's an error */}
          {dataError && (
            <p className="text-red-600 py-2 px-1 text-sm">{dataError}</p>
          )}
        </div>
        <Footer
          setError={setFormError}
          errorMessage={formError}
          selectedSites={selectedSites}
          handleClearSelection={handleClearSelection}
          handleSubmit={handleSubmit}
          onClose={onClose}
          btnText={downloadLoading ? 'Downloading...' : 'Download'}
          loading={downloadLoading}
        />
      </div>
    </>
  );
};

export default DataDownload;
