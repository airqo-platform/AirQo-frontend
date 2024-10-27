import React, { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
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
import { exportDataApi } from '@/core/apis/Analytics';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import CustomToast from '../../../Toast/CustomToast';

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
  const userInfo = useSelector((state) => state.login.userInfo);
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

  // Extract selected site IDs from preferencesData
  const selectedSiteIds = useMemo(() => {
    return preferencesData?.[0]?.selected_sites?.map((site) => site._id) || [];
  }, [preferencesData]);

  // Network options based on user groups
  const NETWORK_OPTIONS =
    userInfo?.groups?.map((network) => ({
      id: network._id,
      name: network.grp_title,
    })) || [];

  // Form data state
  const [formData, setFormData] = useState({
    title: { name: 'Untitled Report' },
    network: NETWORK_OPTIONS[0] || { id: '', name: 'Default Network' },
    dataType: DATA_TYPE_OPTIONS[0],
    pollutant: POLLUTANT_OPTIONS[0],
    duration: null,
    frequency: FREQUENCY_OPTIONS[0],
    fileType: FILE_TYPE_OPTIONS[0],
  });

  const [edit, setEdit] = useState(false);

  /**
   * Clears all selected sites.
   */
  const handleClearSelection = useCallback(() => {
    setClearSelected(true);
    setSelectedSites([]);
    // Reset clearSelected flag in the next tick
    setTimeout(() => setClearSelected(false), 0);
  }, []);

  /**
   * Handles the selection of form options.
   * @param {string} id - The ID of the form field.
   * @param {object} option - The selected option.
   */
  const handleOptionSelect = useCallback((id, option) => {
    setFormData((prevData) => ({ ...prevData, [id]: option }));
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
      setFormError(''); // Reset previous errors

      // Validate form data
      if (
        !formData.duration ||
        !formData.duration.name?.start ||
        !formData.duration.name?.end
      ) {
        setFormError(
          'Please select a valid duration with both start and end dates',
        );
        setDownloadLoading(false);
        return;
      }

      if (selectedSites.length === 0) {
        setFormError('Please select at least one location');
        setDownloadLoading(false);
        return;
      }

      // Prepare data for API
      const apiData = {
        startDateTime: formData.duration.name.start.toISOString(),
        endDateTime: formData.duration.name.end.toISOString(),
        sites: selectedSites.map((site) => site._id),
        network: formData.network.name,
        datatype: formData.dataType.name.toLowerCase(),
        pollutants: [formData.pollutant.name.toLowerCase().replace('.', '_')],
        resolution: formData.frequency.name.toLowerCase(),
        downloadType: formData.fileType.name.toLowerCase(),
        outputFormat: 'airqo-standard',
      };

      try {
        // Call the exportDataApi with the prepared data
        const response = await exportDataApi(apiData);

        // Determine the file extension and MIME type
        const fileExtension = formData.fileType.name.toLowerCase();
        const mimeType = getMimeType(fileExtension);
        const fileName = `${formData.title.name}.${fileExtension}`;

        if (fileExtension === 'csv') {
          // Handle CSV: response.data is a CSV string
          if (typeof response.data !== 'string') {
            throw new Error('Invalid CSV data format');
          }

          const blob = new Blob([response.data], { type: mimeType });
          saveAs(blob, fileName);
        } else if (fileExtension === 'json') {
          // Handle JSON: response.data is an object with a 'data' array
          if (!response.data || !Array.isArray(response.data.data)) {
            throw new Error('Invalid JSON data format');
          }

          const json = JSON.stringify(response.data.data, null, 2);
          const blob = new Blob([json], { type: mimeType });
          saveAs(blob, fileName);
        } else if (fileExtension === 'pdf') {
          // Handle PDF: response.data is an object with a 'data' array
          if (!response.data || !Array.isArray(response.data.data)) {
            throw new Error('Invalid PDF data format');
          }

          const pdfData = response.data.data;

          const doc = new jsPDF();

          if (pdfData.length === 0) {
            doc.text('No data available to display.', 10, 10);
          } else {
            const tableColumn = Object.keys(pdfData[0]);
            const tableRows = pdfData.map((data) =>
              tableColumn.map((col) =>
                data[col] !== undefined && data[col] !== null
                  ? data[col]
                  : '---',
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

        // Show success toast
        CustomToast();

        // Clear selections after successful download
        handleClearSelection();
        onClose();
      } catch (error) {
        // Handle any errors during the download process
        console.error('Error downloading data:', error);
        setFormError('An error occurred while downloading. Please try again.');
      } finally {
        setDownloadLoading(false);

        // Reset form data after submission
        setFormData({
          title: { name: 'Untitled Report' },
          network: NETWORK_OPTIONS[0] || { id: '', name: 'Default Network' },
          dataType: DATA_TYPE_OPTIONS[0],
          pollutant: POLLUTANT_OPTIONS[0],
          duration: null,
          frequency: FREQUENCY_OPTIONS[0],
          fileType: FILE_TYPE_OPTIONS[0],
        });
      }
    },
    [formData, selectedSites, NETWORK_OPTIONS, handleClearSelection, onClose],
  );

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

  return (
    <>
      {/* Section 1: Form */}
      <form
        className="w-[280px] h-[658px] relative bg-[#f6f6f7] space-y-3 px-5 pt-5 pb-14"
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
          title="Network"
          options={NETWORK_OPTIONS}
          id="network"
          icon={<WorldIcon width={16} height={16} fill="#000" />}
          defaultOption={formData.network}
          handleOptionSelect={handleOptionSelect}
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
        <div className="px-8 pt-6 pb-4 overflow-y-auto">
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
          btnText="Download"
          loading={downloadLoading}
        />
      </div>
    </>
  );
};

export default DataDownload;
