import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import WorldIcon from '@/icons/SideBar/world_Icon';
import CalibrateIcon from '@/icons/Analytics/calibrateIcon';
import FileTypeIcon from '@/icons/Analytics/fileTypeIcon';
import FrequencyIcon from '@/icons/Analytics/frequencyIcon';
import WindIcon from '@/icons/Analytics/windIcon';
import EditIcon from '@/icons/Analytics/EditIcon';
import DataTable from '../components/DataTable';
import CustomFields from '../components/CustomFields';
import {
  POLLUTANT_OPTIONS,
  DATA_TYPE_OPTIONS,
  FREQUENCY_OPTIONS,
  FILE_TYPE_OPTIONS,
} from '../constants';
import Footer from '../components/Footer';
import useDataDownload from '@/core/hooks/useDataDownload';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import CustomToast from '../../../Toast/CustomToast';
import { format } from 'date-fns';
import { fetchSitesSummary } from '@/lib/store/services/sitesSummarySlice';
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
 * Main component for downloading data.
 * Allows users to select parameters and download air quality data accordingly.
 */
const DataDownload = ({ onClose }) => {
  const dispatch = useDispatch();
  const {
    id: activeGroupId,
    title: groupTitle,
    groupList,
  } = useGetActiveGroup();
  const preferencesData = useSelector(
    (state) => state.defaults.individual_preferences,
  );
  const {
    sitesSummaryData,
    loading,
    error: fetchError,
  } = useSelector((state) => state.sites);

  const [selectedSites, setSelectedSites] = useState([]);
  const [clearSelected, setClearSelected] = useState(false);
  const [formError, setFormError] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);

  // Use the hook to fetch data
  const fetchData = useDataDownload();

  // Active group data
  const activeGroup = { id: activeGroupId, name: groupTitle };

  // Extract selected site IDs from preferencesData
  const selectedSiteIds = useMemo(() => {
    return preferencesData?.[0]?.selected_sites?.map((site) => site._id) || [];
  }, [preferencesData]);

  // Organization options based on user groups
  const ORGANIZATION_OPTIONS = useMemo(
    () =>
      groupList?.map((group) => ({
        id: group._id,
        name: group.grp_title,
      })) || [],
    [groupList],
  );

  // Form data state
  const [formData, setFormData] = useState({
    title: { name: 'Untitled Report' },
    organization: activeGroup || ORGANIZATION_OPTIONS[0],
    dataType: DATA_TYPE_OPTIONS[0],
    pollutant: POLLUTANT_OPTIONS[0],
    duration: null,
    frequency: FREQUENCY_OPTIONS[0],
    fileType: FILE_TYPE_OPTIONS[0],
  });

  const [edit, setEdit] = useState(false);

  /**
   * Initialize default organization once ORGANIZATION_OPTIONS are available.
   * Defaults to "airqo" if available; otherwise, selects the first organization.
   */
  useEffect(() => {
    if (ORGANIZATION_OPTIONS.length > 0 && !formData.organization) {
      const airqoNetwork = ORGANIZATION_OPTIONS.find(
        (group) => group.name.toLowerCase() === 'airqo',
      );

      setFormData((prevData) => ({
        ...prevData,
        organization: activeGroup || airqoNetwork,
      }));
    }
  }, [ORGANIZATION_OPTIONS, formData.organization, activeGroupId, groupTitle]);

  /**
   * Fetch sites summary whenever the selected organization changes.
   */
  useEffect(() => {
    if (formData.organization) {
      dispatch(
        fetchSitesSummary({ group: formData.organization.name.toLowerCase() }),
      );
    }
  }, [dispatch, formData.organization]);

  /**
   * Clears all selected sites and resets form data.
   */
  const handleClearSelection = useCallback(() => {
    setClearSelected(true);
    setSelectedSites([]);
    // Reset form data after submission
    const airqoNetwork = ORGANIZATION_OPTIONS.find(
      (group) => group.name.toLowerCase() === 'airqo',
    );
    setFormData({
      title: { name: 'Untitled Report' },
      organization: activeGroup || airqoNetwork,
      dataType: DATA_TYPE_OPTIONS[0],
      pollutant: POLLUTANT_OPTIONS[0],
      duration: null,
      frequency: FREQUENCY_OPTIONS[0],
      fileType: FILE_TYPE_OPTIONS[0],
    });
    // Reset clearSelected flag in the next tick
    setTimeout(() => setClearSelected(false), 0);
  }, [ORGANIZATION_OPTIONS]);

  /**
   * Handles the selection of form options.
   * @param {string} id - The ID of the form field.
   * @param {object} option - The selected option.
   */
  const handleOptionSelect = useCallback((id, option) => {
    setFormData((prevData) => ({ ...prevData, [id]: option }));
  }, []);

  /**
   * Toggles the selection of a site.
   * @param {object} site - The site to toggle.
   */
  const handleToggleSite = useCallback((site) => {
    setSelectedSites((prev) => {
      const isSelected = prev.some((s) => s._id === site._id);
      return isSelected
        ? prev.filter((s) => s._id !== site._id)
        : [...prev, site];
    });
  }, []);

  /**
   * Handles the submission of the form.
   * Prepares data and calls the exportDataApi to download the data.
   * @param {object} e - The form event.
   */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setDownloadLoading(true);
      setFormError('');

      try {
        // Validate form data
        if (
          !formData.duration ||
          !formData.duration.name?.start ||
          !formData.duration.name?.end
        ) {
          throw new Error(
            'Please select a valid duration with both start and end dates.',
          );
        }

        // Parse the start and end dates
        const startDate = new Date(formData.duration.name.start);
        const endDate = new Date(formData.duration.name.end);

        // Frequency-based duration limit validation
        const validateDuration = (frequency, startDate, endDate) => {
          const sixMonthsInMs = 6 * 30 * 24 * 60 * 60 * 1000; // 6 months in milliseconds
          const oneYearInMs = 12 * 30 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
          const durationMs = endDate - startDate;

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

        if (selectedSites.length === 0) {
          throw new Error('Please select at least one location.');
        }

        // Prepare data for API
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

        const response = await fetchData(apiData);

        // Handle file download based on file type
        const fileExtension = formData.fileType.name.toLowerCase();
        const mimeType = getMimeType(fileExtension);
        const fileName = `${formData.title.name}.${fileExtension}`;

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
            const tableRows = pdfData.map((data) =>
              tableColumn.map((col) =>
                data[col] !== undefined ? data[col] : '---',
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

        // Show success toast
        CustomToast();

        // Clear selections after successful download
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

  return (
    <>
      {/* Section 1: Form */}
      <form
        className="w-auto h-auto md:w-[280px] md:h-[658px] relative bg-[#f6f6f7] space-y-3 px-5 pt-5 pb-14"
        onSubmit={handleSubmit}
      >
        {/* Edit Button */}
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
          {/* Data Table */}
          <DataTable
            data={sitesSummaryData}
            selectedSites={selectedSites}
            setSelectedSites={setSelectedSites}
            clearSites={clearSelected}
            selectedSiteIds={selectedSiteIds}
            loading={loading}
            onToggleSite={handleToggleSite}
          />
          {/* Fetch Errors */}
          {fetchError && (
            <p className="text-red-600 py-4 px-1 text-sm">
              Error fetching data: {fetchError.message}
            </p>
          )}
        </div>
        {/* Footer */}
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
