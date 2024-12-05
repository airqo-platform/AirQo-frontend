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
        if (response.success && response.maintenance?.length > 0) {
          // Get the first active maintenance
          const activeMaintenance = response.maintenance.find((m) => m.isActive);
          setMaintenance(activeMaintenance || null);
        } else {
          setMaintenance(null);
        }
      } catch (err) {
        setError(err);
        setMaintenance(null);
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
