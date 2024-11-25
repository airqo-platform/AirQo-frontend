import { getMaintenances } from '@/services/externalService';

interface MaintenanceStatus {
  isActive: boolean;
  message: string;
}

let maintenanceStatus: MaintenanceStatus | null = null;

export async function checkMaintenance(): Promise<MaintenanceStatus> {
  // Return cached status if available
  if (maintenanceStatus !== null) {
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
