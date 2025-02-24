import { useEffect, useState, useCallback } from 'react';
import { getSitesSummaryApi } from '../apis/Analytics';

const useSitesSummary = () => {
  const [sitesSummaryData, setSitesSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (signal) => {
    try {
      const response = await getSitesSummaryApi({ signal });
      if (response.success) {
        setSitesSummaryData(response.sites);
        setLoading(false);
      } else {
        setLoading(false);
        throw new Error('Failed to fetch data');
      }
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setLoading(false);
        setError(err);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchData(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchData]);

  return { sitesSummaryData, loading, error };
};

export default useSitesSummary;
