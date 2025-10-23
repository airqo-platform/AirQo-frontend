import { useMemo, useEffect } from 'react';
import {
  useActiveGroupCohortSites,
  useActiveGroupCohortDevices,
} from '@/shared/hooks';
import {
  CohortSitesResponse,
  CohortDevicesResponse,
  CohortSitesParams,
  CohortDevicesParams,
} from '@/shared/types/api';
import {
  TabType,
  TabState,
  DeviceCategory,
  TableItem,
} from '../types/dataExportTypes';
import {
  processSitesData,
  processDevicesData,
  mapDeviceIdsToNames,
} from '../utils/dataExportUtils';

/**
 * Custom hook for data fetching and processing
 */
export const useDataExportData = (
  activeTab: TabType,
  tabStates: Record<TabType, TabState>,
  deviceCategory: DeviceCategory,
  selectedDeviceIds: string[],
  devicesData: TableItem[],
  setSelectedDevices: (devices: string[]) => void
) => {
  // Sites params
  const sitesParams = useMemo(() => {
    const params: CohortSitesParams = {
      skip: (tabStates.sites.page - 1) * tabStates.sites.pageSize,
      limit: tabStates.sites.pageSize,
    };
    if (tabStates.sites.search.trim()) {
      params.search = tabStates.sites.search;
    }
    return params;
  }, [tabStates.sites.page, tabStates.sites.pageSize, tabStates.sites.search]);

  // Devices params
  const devicesParams = useMemo(() => {
    const params: CohortDevicesParams = {
      skip: (tabStates.devices.page - 1) * tabStates.devices.pageSize,
      limit: tabStates.devices.pageSize,
      status: 'deployed',
    };
    if (tabStates.devices.search.trim()) {
      params.search = tabStates.devices.search;
    }
    if (deviceCategory && deviceCategory !== 'lowcost') {
      params.category = deviceCategory;
    }
    return params;
  }, [
    tabStates.devices.page,
    tabStates.devices.pageSize,
    tabStates.devices.search,
    deviceCategory,
  ]);

  // Fetch sites data
  const sitesHook = useActiveGroupCohortSites(sitesParams);

  // Fetch devices data
  const devicesHook = useActiveGroupCohortDevices(devicesParams);

  const currentHook = activeTab === 'sites' ? sitesHook : devicesHook;

  // Process data for table display
  const processedSitesData = useMemo(
    () => processSitesData((sitesHook.data as CohortSitesResponse)?.sites),
    [sitesHook.data]
  );

  const processedDevicesData = useMemo(
    () =>
      processDevicesData((devicesHook.data as CohortDevicesResponse)?.devices),
    [devicesHook.data]
  );

  const tableData =
    activeTab === 'sites' ? processedSitesData : processedDevicesData;

  // Update selected devices when device IDs change
  useEffect(() => {
    if (activeTab === 'devices' && selectedDeviceIds.length > 0) {
      const selectedDeviceNames = mapDeviceIdsToNames(
        selectedDeviceIds,
        processedDevicesData
      );
      setSelectedDevices(selectedDeviceNames);
    }
  }, [activeTab, selectedDeviceIds, processedDevicesData, setSelectedDevices]);

  // Reset device pagination when category changes
  useEffect(() => {
    // This effect is handled in the parent component
  }, [deviceCategory]);

  return {
    sitesHook,
    devicesHook,
    currentHook,
    tableData,
    processedSitesData,
    processedDevicesData,
    sitesParams,
    devicesParams,
  };
};
