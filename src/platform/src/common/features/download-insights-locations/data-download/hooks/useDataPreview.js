import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import useDataDownload from '@/core/hooks/useDataDownload';

// Available column definitions for preview
export const AVAILABLE_COLUMNS = [
  { key: 'datetime', label: 'Date Time', enabled: true, required: true },
  { key: 'month', label: 'Month Date', enabled: true, required: true },
  { key: 'device_name', label: 'Device Name', enabled: true },
  { key: 'frequency', label: 'Frequency', enabled: true },
  { key: 'humidity', label: 'Humidity', enabled: true },
  { key: 'latitude', label: 'Latitude', enabled: true },
  { key: 'longitude', label: 'Longitude', enabled: true },
  { key: 'network', label: 'Network', enabled: true },
  { key: 'pm10', label: 'PM10', enabled: true },
  { key: 'pm10_calibrated_value', label: 'PM10 Calibrated', enabled: true },
  { key: 'pm2_5', label: 'PM2.5', enabled: true },
  { key: 'pm2_5_calibrated_value', label: 'PM2.5 Calibrated', enabled: true },
  { key: 'site_name', label: 'Site Name', enabled: true },
  { key: 'temperature', label: 'Temperature', enabled: true },
];

/**
 * Custom hook for managing data preview functionality
 */
export const useDataPreview = () => {
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState(
    AVAILABLE_COLUMNS.reduce(
      (acc, col) => ({
        ...acc,
        [col.key]: col.enabled,
      }),
      {},
    ),
  );

  const fetchData = useDataDownload();

  // Parse CSV response to structured data
  const parseCSVResponse = useCallback((csvString) => {
    if (!csvString || typeof csvString !== 'string') {
      return { headers: [], rows: [] };
    }

    const lines = csvString.trim().split('\n');
    if (lines.length < 2) {
      return { headers: [], rows: [] };
    }

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

      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map((h) =>
      h.replace(/^"|"$/g, '').trim(),
    );

    // Take only first 10 rows for preview
    const dataRows = lines.slice(1, 11).map((line) => {
      const values = parseCSVLine(line);
      return headers.reduce((obj, header, index) => {
        let value = values[index]
          ? values[index].replace(/^"|"$/g, '').trim()
          : '';
        obj[header] = value || null;
        return obj;
      }, {});
    });

    return { headers, rows: dataRows };
  }, []);

  // Generate preview data
  const generatePreview = useCallback(
    async (formData, selectedItems, activeFilterKey, siteAndDeviceIds) => {
      setPreviewLoading(true);
      setPreviewError(null);

      try {
        // Validate inputs
        if (!formData.duration?.name?.start || !formData.duration?.name?.end) {
          throw new Error('Please select a valid date range');
        }

        if (!selectedItems.length) {
          throw new Error('Please select at least one location');
        }

        const startDate = new Date(formData.duration.name.start);
        const endDate = new Date(formData.duration.name.end);

        // Prepare API payload
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

        // Create a limited time range for preview (max 7 days)
        const previewEndDate = new Date(
          Math.min(
            endDate.getTime(),
            startDate.getTime() + 7 * 24 * 60 * 60 * 1000,
          ),
        );

        // Extract device category value with fallback
        const deviceCategoryValue =
          formData.deviceCategory?.name?.toLowerCase() || 'lowcost';

        const apiData = {
          startDateTime: format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
          endDateTime: format(previewEndDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
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
          downloadType: 'csv', // Always use CSV for preview
          outputFormat: 'airqo-standard',
          minimum: true,
          // Always include device_category in preview payload
          device_category: deviceCategoryValue,
        };

        // Add selection parameters
        if (activeFilterKey === 'devices') {
          apiData.device_names = deviceNames;
        } else {
          apiData.sites = siteIds;
        }

        // Debug logging to verify the preview payload includes device_category
        console.log('Preview API payload:', JSON.stringify(apiData, null, 2));
        console.log(
          'Preview device category value being sent:',
          apiData.device_category,
        );

        // Fetch preview data
        const response = await fetchData(apiData);

        // Process CSV response
        let csvData = '';
        if (typeof response === 'string') {
          csvData = response.startsWith('resp')
            ? response.substring(4)
            : response;
        } else if (
          typeof response === 'object' &&
          response !== null &&
          response.data
        ) {
          csvData =
            typeof response.data === 'string'
              ? response.data
              : JSON.stringify(response.data);
        }

        if (!csvData || csvData.length < 10) {
          throw new Error('No data available for the selected criteria');
        }

        const parsedData = parseCSVResponse(csvData);

        if (!parsedData.headers.length || !parsedData.rows.length) {
          throw new Error('No valid data found for preview');
        }

        // Set up column selection based on available headers
        const updatedColumns = {};
        AVAILABLE_COLUMNS.forEach((col) => {
          updatedColumns[col.key] =
            parsedData.headers.includes(col.key) &&
            (col.enabled || col.required);
        });

        setSelectedColumns(updatedColumns);
        setPreviewData({
          ...parsedData,
          totalItems: selectedItems.length,
          dateRange: {
            start: format(startDate, 'PPP'),
            end: format(endDate, 'PPP'),
          },
          previewNote:
            previewEndDate < endDate
              ? `Preview showing data from ${format(startDate, 'PPP')} to ${format(previewEndDate, 'PPP')} (first 7 days of selected range)`
              : `Preview showing all data from ${format(startDate, 'PPP')} to ${format(endDate, 'PPP')}`,
          selectedItemsInfo: {
            type: activeFilterKey,
            items: selectedItems,
            count:
              activeFilterKey === 'countries' || activeFilterKey === 'cities'
                ? siteAndDeviceIds?.site_ids?.length || 0
                : selectedItems.length,
          },
        });
      } catch (error) {
        setPreviewError(error.message || 'Failed to generate preview');
      } finally {
        setPreviewLoading(false);
      }
    },
    [fetchData, parseCSVResponse],
  );

  // Toggle column selection
  const toggleColumn = useCallback((columnKey) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  }, []);

  // Reset column selection
  const resetColumns = useCallback(() => {
    setSelectedColumns(
      AVAILABLE_COLUMNS.reduce(
        (acc, col) => ({
          ...acc,
          [col.key]: col.enabled,
        }),
        {},
      ),
    );
  }, []);

  // Get filtered preview data based on selected columns
  const getFilteredPreviewData = useCallback(() => {
    if (!previewData) return null;

    const enabledColumns = Object.keys(selectedColumns).filter(
      (key) => selectedColumns[key],
    );
    const filteredHeaders = previewData.headers.filter((header) =>
      enabledColumns.includes(header),
    );
    const filteredRows = previewData.rows.map((row) => {
      const filteredRow = {};
      filteredHeaders.forEach((header) => {
        filteredRow[header] = row[header];
      });
      return filteredRow;
    });

    return {
      ...previewData,
      headers: filteredHeaders,
      rows: filteredRows,
    };
  }, [previewData, selectedColumns]);

  // Clear preview data
  const clearPreview = useCallback(() => {
    setPreviewData(null);
    setPreviewError(null);
  }, []);

  return {
    previewData,
    previewLoading,
    previewError,
    selectedColumns,
    generatePreview,
    toggleColumn,
    resetColumns,
    getFilteredPreviewData,
    clearPreview,
    availableColumns: AVAILABLE_COLUMNS,
  };
};
