import { useState, useEffect } from 'react';
import { getMaintenanceStatusApi } from 'views/apis/authService';

export const useMaintenanceStatus = () => {
  const [maintenance, setMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkMaintenanceStatus = async () => {
      try {
        const response = await getMaintenanceStatusApi();
        setMaintenance(response.maintenance);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenanceStatus();
    // Check every 5 minutes
    const interval = setInterval(checkMaintenanceStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { maintenance, loading, error };
};
