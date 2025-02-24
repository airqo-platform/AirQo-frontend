import { useState, useEffect } from 'react';
import { getMaintenanceStatus } from '../apis/Account';

const POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes

const useMaintenanceStatus = () => {
  const [maintenance, setMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMaintenanceStatus = async () => {
    try {
      const response = await getMaintenanceStatus();
      if (response.success && response.maintenance?.length > 0) {
        setMaintenance(response.maintenance[0]);
      } else {
        setMaintenance(null);
      }
      setError(null);
    } catch (err) {
      setError(err);
      console.error('Error fetching maintenance status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceStatus();
    const interval = setInterval(fetchMaintenanceStatus, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return { maintenance, loading, error };
};

export default useMaintenanceStatus;
