import { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import CustomToast from '@/components/Toast/CustomToast';
import useDataDownload from '@/core/hooks/useDataDownload';
import csvFromResponse from '../utils/csvFromResponse';
import formatFileName from '../utils/formatFileName';

export default function useDownload({
  visibleSites,
  allSites,
  dateRange,
  pollutant,
  frequency,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchData = useDataDownload();

  const download = useCallback(
    async (datatype = 'calibrated') => {
      if (!visibleSites.length) {
        CustomToast({ message: 'Select at least one site', type: 'warning' });
        return;
      }
      setLoading(true);
      setError(null);
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
        setError('Download timed-out. Please retry.');
        setLoading(false);
      }, 3e4);

      try {
        const res = await fetchData(
          {
            startDateTime: new Date(dateRange.startDate).toISOString(),
            endDateTime: new Date(dateRange.endDate).toISOString(),
            sites: visibleSites,
            pollutants: [pollutant],
            frequency,
            device_category: 'lowcost',
            datatype: datatype?.value,
            downloadType: 'csv',
            outputFormat: 'airqo-standard',
            metaDataFields: ['latitude', 'longitude'],
            weatherFields: ['temperature', 'humidity'],
            minimum: true,
          },
          { signal: controller.signal },
        );
        clearTimeout(timeout);
        const csv = csvFromResponse(res);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        if (blob.size < 10)
          throw new Error(
            'No records found for your selected criteria. Please adjust your filters and try again.',
          );
        saveAs(
          blob,
          formatFileName({
            visibleSites,
            allSites,
            pollutant,
            startDate: new Date(dateRange.startDate),
            endDate: new Date(dateRange.endDate),
          }),
        );
        CustomToast({
          message: `Download complete for ${visibleSites.length} site(s)!`,
          type: 'success',
        });
      } catch (err) {
        setError(err.name === 'AbortError' ? 'Download canceled' : err.message);
      } finally {
        setLoading(false);
      }
    },
    [visibleSites, allSites, dateRange, pollutant, frequency, fetchData],
  );

  return { download, loading, error };
}
