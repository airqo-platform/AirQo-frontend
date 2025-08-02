import { useState, useCallback, useRef, useEffect } from 'react';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';
import useDataDownload from '@/core/hooks/useDataDownload';
import { getMimeType } from '../utils';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import CustomToast from '@/components/Toast/CustomToast';
import { event } from '@/core/hooks/useGoogleAnalytics';

// Message types for footer component
export const MESSAGE_TYPES = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

/**
 * Custom hook for managing data download functionality
 */
export const useDataDownloadLogic = () => {
  const { id: activeGroupId, title: groupTitle } = useGetActiveGroup();
  const fetchData = useDataDownload();

  // Consolidate refs for better cleanup management
  const refs = useRef({
    abortController: null,
    previousFilter: null,
    errorTimeout: null,
  });

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
    const currentRefs = refs.current;
    return () => {
      if (currentRefs.abortController) {
        currentRefs.abortController.abort();
      }
      if (currentRefs.errorTimeout) {
        clearTimeout(currentRefs.errorTimeout);
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
    setTimeout(() => setClearSelected(false), 50);
  }, []);

  // Reset everything including form data
  const handleClearSelection = useCallback(() => {
    clearSelections();
  }, [clearSelections]);

  // Toggle item selection
  const handleToggleItem = useCallback(
    (item, filterType) => {
      // For countries and cities, only allow one selection
      if (filterType === 'countries' || filterType === 'cities') {
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
    [selectedItems],
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

  // Filter CSV columns based on selected columns
  const filterCSVColumns = useCallback((csvData, selectedColumns) => {
    if (!csvData || !selectedColumns) return csvData;

    try {
      const lines = csvData.trim().split('\n');
      if (lines.length < 2) return csvData;

      // Parse CSV line properly handling quoted fields
      const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        let i = 0;

        while (i < line.length) {
          const char = line[i];
          const nextChar = line[i + 1];

          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
          i++;
        }
        result.push(current.trim());
        return result;
      };

      // Get headers and find selected column indices
      const headers = parseCSVLine(lines[0]).map((h) =>
        h.replace(/^"|"$/g, '').trim(),
      );
      const selectedColumnKeys = Object.keys(selectedColumns).filter(
        (key) => selectedColumns[key],
      );
      const selectedIndices = selectedColumnKeys
        .map((key) => headers.indexOf(key))
        .filter((index) => index !== -1);

      if (selectedIndices.length === 0) return csvData;

      // Filter headers
      const filteredHeaders = selectedIndices.map((index) => headers[index]);

      // Filter data rows
      const filteredRows = lines.slice(1).map((line) => {
        const values = parseCSVLine(line);
        return selectedIndices.map((index) => values[index] || '').join(',');
      });

      // Return filtered CSV
      return [filteredHeaders.join(','), ...filteredRows].join('\n');
    } catch {
      // Return original data if filtering fails
      return csvData;
    }
  }, []);

  // Process different file types with optional column filtering
  const processDownloadResponse = useCallback(
    async (response, formData, selectedColumns = null) => {
      const fileExtension = formData.fileType.name.toLowerCase();
      const mimeType = getMimeType(fileExtension);
      const fileName = `${formData.title.name || 'Air_Quality_Data'}.${fileExtension}`;

      if (fileExtension === 'csv') {
        // Process CSV data
        let csvData =
          typeof response === 'string'
            ? response.startsWith('resp')
              ? response.substring(4)
              : response
            : typeof response === 'object' && response !== null && response.data
              ? typeof response.data === 'string'
                ? response.data
                : JSON.stringify(response.data)
              : 'datetime,device_name,frequency,network,pm2_5_calibrated_value,site_name\n';

        // Filter columns if selectedColumns is provided
        if (selectedColumns) {
          csvData = filterCSVColumns(csvData, selectedColumns);
        }

        // Save as CSV
        const blob = new Blob([csvData], { type: mimeType });
        if (blob.size > 10) {
          saveAs(blob, fileName);
        } else {
          throw new Error('No data available for the selected criteria');
        }
        return csvData;
      } else if (fileExtension === 'json') {
        // Process JSON data
        let jsonData;
        try {
          if (typeof response === 'string') {
            // Check if the response is CSV (contains commas and newlines)
            if (response.includes(',') && response.includes('\n')) {
              // Parse CSV to JSON with proper handling of quoted fields
              const lines = response.trim().split('\n');

              // Parse CSV line properly handling quoted fields
              const parseCSVLine = (line) => {
                const result = [];
                let current = '';
                let inQuotes = false;
                let i = 0;

                while (i < line.length) {
                  const char = line[i];
                  const nextChar = line[i + 1];

                  if (char === '"') {
                    if (inQuotes && nextChar === '"') {
                      // Escaped quote
                      current += '"';
                      i++; // Skip next quote
                    } else {
                      // Toggle quote state
                      inQuotes = !inQuotes;
                    }
                  } else if (char === ',' && !inQuotes) {
                    // Field separator
                    result.push(current.trim());
                    current = '';
                  } else {
                    current += char;
                  }
                  i++;
                }

                // Add the last field
                result.push(current.trim());
                return result;
              };

              const headers = parseCSVLine(lines[0]).map((h) =>
                h.replace(/^"|"$/g, '').trim(),
              );
              jsonData = lines.slice(1).map((line) => {
                const values = parseCSVLine(line);
                return headers.reduce((obj, header, index) => {
                  // Clean up the values and handle empty fields
                  let value = values[index]
                    ? values[index].replace(/^"|"$/g, '').trim()
                    : '';
                  obj[header] = value || null;
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

          if (!jsonData || (Array.isArray(jsonData) && jsonData.length === 0)) {
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
        return jsonData;
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
        return pdfData;
      } else {
        throw new Error(
          'Unsupported file format. Please select CSV, JSON, or PDF.',
        );
      }
    },
    [filterCSVColumns],
  );

  // Handle download submission with improved error handling
  const handleDownload = useCallback(
    async (
      formData,
      siteAndDeviceIds,
      onClose,
      onClearSelection,
      selectedColumns = null,
    ) => {
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

        if (activeFilterKey === 'countries' || activeFilterKey === 'cities') {
          if (!siteAndDeviceIds?.site_ids?.length) {
            throw new Error(
              `No monitoring sites found for the selected ${
                activeFilterKey === 'countries' ? 'country' : 'city'
              }`,
            );
          }
          siteIds = siteAndDeviceIds.site_ids;
        } else if (activeFilterKey === 'sites') {
          siteIds = selectedItems.map((site) => site._id);
        } else if (activeFilterKey === 'devices') {
          deviceNames = selectedItems.map(
            (device) => device.name || device.long_name,
          );
        }

        // API request data with proper organization naming
        const apiData = {
          startDateTime: format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
          endDateTime: format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
          datatype:
            formData.dataType.name.toLowerCase() === 'calibrated data'
              ? 'calibrated'
              : 'raw',
          pollutants: formData.pollutant.map((p) =>
            p.name.toLowerCase().replace('.', '_'),
          ),
          metaDataFields: ['latitude', 'longitude'],
          weatherFields: ['temperature', 'humidity'],
          frequency: formData.frequency.name.toLowerCase(),
          downloadType: formData.fileType.name.toLowerCase(),
          outputFormat: 'airqo-standard',
          minimum: true,
        };

        // Add the appropriate selection parameters based on filter type
        if (activeFilterKey === 'devices') {
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

          // Process response based on file type
          await processDownloadResponse(response, formData, selectedColumns);

          // Success handling
          CustomToast({
            message: 'Data downloaded successfully!',
            type: 'success',
          });

          onClearSelection();
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
      selectedItems,
      activeFilterKey,
      fetchData,
      validateFormData,
      resetErrorAfterDelay,
      processDownloadResponse,
    ],
  );

  return {
    // State
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

    // Actions
    setSelectedItems,
    setFormError,
    setMessageType,
    setStatusMessage,
    setFilterErrors,
    setEdit,
    setActiveFilterKey,
    setSelectedGridId,

    // Methods
    clearSelections,
    handleClearSelection,
    handleToggleItem,
    handleDownload,
    resetErrorAfterDelay,

    // Values
    activeGroupId,
    groupTitle,
  };
};
