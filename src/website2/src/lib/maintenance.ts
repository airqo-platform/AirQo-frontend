import { getMaintenances } from '@/services/externalService';

interface MaintenanceStatus {
  isActive: boolean;
  message: string;
}

let maintenanceStatus: MaintenanceStatus | null = null;

/**
 * Checks the maintenance status.
 * In development mode, it skips the API call and returns a default inactive status.
 * @returns {Promise<MaintenanceStatus>} The maintenance status object.
 */
export async function checkMaintenance(): Promise<MaintenanceStatus> {
  // Return cached status if available
  if (maintenanceStatus !== null) {
    return maintenanceStatus;
  }

  // Skip API call in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('Skipping maintenance check in development mode.');
    maintenanceStatus = { isActive: false, message: '' };
    return maintenanceStatus;
  }

  try {
    const response = await getMaintenances();

    if (response?.success && response.maintenance?.length > 0) {
      const activeMaintenance = response.maintenance[0];
      maintenanceStatus = {
        isActive: activeMaintenance.isActive,
        message: activeMaintenance.message,
      };
    } else {
      maintenanceStatus = { isActive: false, message: '' };
    }
  } catch (error) {
    console.error('Failed to fetch maintenance status:', error);
    maintenanceStatus = { isActive: false, message: '' };
  }

  return maintenanceStatus;
}
