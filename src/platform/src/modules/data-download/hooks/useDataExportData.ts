import { useMemo, useEffect } from 'react';
import {
  useActiveGroupCohortSites,
  useActiveGroupCohortDevices,
  useGridsSummary,
} from '@/shared/hooks';
import {
  CohortSitesResponse,
  CohortDevicesResponse,
  CohortSitesParams,
  CohortDevicesParams,
  GridsSummaryResponse,
  GridsSummaryParams,
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
  processGridsData,
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

  // Countries params
  const countriesParams = useMemo(() => {
    const params: GridsSummaryParams = {
      skip: (tabStates.countries.page - 1) * tabStates.countries.pageSize,
      limit: tabStates.countries.pageSize,
      admin_level: 'country',
    };
    if (tabStates.countries.search.trim()) {
      params.search = tabStates.countries.search;
    }
    return params;
  }, [
    tabStates.countries.page,
    tabStates.countries.pageSize,
    tabStates.countries.search,
  ]);

  // Cities params
  const citiesParams = useMemo(() => {
    const params: GridsSummaryParams = {
      skip: (tabStates.cities.page - 1) * tabStates.cities.pageSize,
      limit: tabStates.cities.pageSize,
      admin_level: 'city,state,district,province',
    };
    if (tabStates.cities.search.trim()) {
      params.search = tabStates.cities.search;
    }
    return params;
  }, [
    tabStates.cities.page,
    tabStates.cities.pageSize,
    tabStates.cities.search,
  ]);

  // Fetch sites data
  const sitesHook = useActiveGroupCohortSites(sitesParams);

  // Fetch devices data
  const devicesHook = useActiveGroupCohortDevices(devicesParams);

  // Fetch countries data
  const countriesHook = useGridsSummary(countriesParams);

  // Fetch cities data
  const citiesHook = useGridsSummary(citiesParams);

  const currentHook =
    activeTab === 'sites'
      ? sitesHook
      : activeTab === 'devices'
        ? devicesHook
        : activeTab === 'countries'
          ? countriesHook
          : citiesHook;

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

  const processedCountriesData = useMemo(
    () => processGridsData((countriesHook.data as GridsSummaryResponse)?.grids),
    [countriesHook.data]
  );

  const processedCitiesData = useMemo(
    () => processGridsData((citiesHook.data as GridsSummaryResponse)?.grids),
    [citiesHook.data]
  );

  const tableData =
    activeTab === 'sites'
      ? processedSitesData
      : activeTab === 'devices'
        ? processedDevicesData
        : activeTab === 'countries'
          ? processedCountriesData
          : processedCitiesData;

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
    countriesHook,
    citiesHook,
    currentHook,
    tableData,
    processedSitesData,
    processedDevicesData,
    processedCountriesData,
    processedCitiesData,
    sitesParams,
    devicesParams,
    countriesParams,
    citiesParams,
  };
};
