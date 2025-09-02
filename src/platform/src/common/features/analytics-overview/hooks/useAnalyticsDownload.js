import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { saveAs } from 'file-saver';
import CustomToast from '@/components/Toast/CustomToast';
import useDataDownload from '@/core/hooks/useDataDownload';
import { format } from 'date-fns';
import { POLLUTANT_OPTIONS } from '@/lib/constants';

// Convert response to CSV format
const csvFromResponse = (response) => {
  if (typeof response === 'string') {
    return response.startsWith('resp') ? response.substring(4) : response;
  }

  if (typeof response === 'object' && response !== null) {
    // Handle JSON response - convert to CSV
    const data =
      response.data || (Array.isArray(response) ? response : [response]);
    if (!Array.isArray(data) || data.length === 0) {
      return 'datetime,site_name,pm2_5_calibrated_value\n';
    }

    // Get headers from the first object
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    // Convert data rows
    const csvRows = data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (
            typeof value === 'string' &&
            (value.includes(',') || value.includes('\n') || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(','),
    );

    return [csvHeaders, ...csvRows].join('\n');
  }

  return 'datetime,site_name,pm2_5_calibrated_value\n';
};

// Format filename based on parameters
const formatFileName = ({
  selectedSites,
  pollutant,
  startDate,
  endDate,
  frequency,
}) => {
  const sitesText =
    selectedSites.length === 1
      ? selectedSites[0].name || 'site'
      : `${selectedSites.length}_sites`;

  const dateText = `${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}`;
  const pollutantText = pollutant.toLowerCase().replace('.', '_');

  return `airquality_${sitesText}_${pollutantText}_${frequency}_${dateText}.csv`;
};

export default function useAnalyticsDownload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get analytics data from Redux
  const chartData = useSelector((state) => state.chart);

  const fetchData = useDataDownload();

  const download = useCallback(
    async (datatype = 'calibrated', sitesData = []) => {
      // Validate required data
      if (!chartData.chartSites || chartData.chartSites.length === 0) {
        CustomToast({
          message:
            'No favorite locations selected. Please add favorite locations first.',
          type: 'warning',
        });
        return;
      }

      if (
        !chartData.chartDataRange?.startDate ||
        !chartData.chartDataRange?.endDate
      ) {
        CustomToast({
          message: 'Invalid date range. Please select a valid date range.',
          type: 'warning',
        });
        return;
      }

      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
        setError('Download timed-out. Please retry.');
        setLoading(false);
      }, 30000); // 30 second timeout

      try {
        // Get site names for filename
        const selectedSites =
          sitesData && sitesData.length > 0
            ? sitesData
            : chartData.chartSites.map((id, index) => ({
                _id: id,
                name: `Site_${index + 1}`,
              }));

        // Get the selected pollutant info
        const selectedPollutant = POLLUTANT_OPTIONS.find(
          (option) => option.id === chartData.pollutionType,
        );
        const pollutantId = selectedPollutant?.id || 'pm2_5';

        // Prepare API parameters
        const apiParams = {
          startDateTime: new Date(
            chartData.chartDataRange.startDate,
          ).toISOString(),
          endDateTime: new Date(chartData.chartDataRange.endDate).toISOString(),
          sites: chartData.chartSites,
          pollutants: [pollutantId],
          frequency: chartData.timeFrame || 'daily',
          device_category: 'lowcost',
          datatype: datatype?.value || datatype,
          downloadType: 'csv',
          outputFormat: 'airqo-standard',
          metaDataFields: ['latitude', 'longitude'],
          weatherFields: ['temperature', 'humidity'],
          minimum: true,
        };

        const response = await fetchData(apiParams, {
          signal: controller.signal,
        });
        clearTimeout(timeout);

        const csv = csvFromResponse(response);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

        if (blob.size < 10) {
          throw new Error(
            'No records found for your selected criteria. Please adjust your filters and try again.',
          );
        }

        const filename = formatFileName({
          selectedSites,
          pollutant: selectedPollutant?.name || 'PM2.5',
          startDate: new Date(chartData.chartDataRange.startDate),
          endDate: new Date(chartData.chartDataRange.endDate),
          frequency: chartData.timeFrame || 'daily',
        });

        saveAs(blob, filename);

        CustomToast({
          message: `Download complete for ${chartData.chartSites.length} favorite location(s)!`,
          type: 'success',
        });
      } catch (err) {
        const errorMessage =
          err.name === 'AbortError' ? 'Download canceled' : err.message;
        setError(errorMessage);
        CustomToast({
          message: errorMessage,
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
    [chartData, fetchData],
  );

  return { download, loading, error };
}
