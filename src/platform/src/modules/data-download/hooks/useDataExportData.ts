import { useMemo, useEffect } from 'react';
import {
  useActiveGroupCohorts,
  useActiveGroupCohortSitesWithState,
  useActiveGroupCohortDevicesWithState,
  useGridsSummary,
  useGridsSummaryWithToken,
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
  isOrgFlow: boolean,
  deviceCategory: DeviceCategory,
  selectedDeviceIds: string[],
  selectedDevicesData: TableItem[],
  setSelectedDevices: (devices: string[]) => void,
  enabled = true
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
      admin_level: 'city,state,county,district,province',
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

  // Sites and devices both depend on the active group's cohort ids.
  // The user flow defaults the active group to AirQo in Redux, so the same
  // cached cohort path works without an env-specific fallback.
  const activeGroupCohorts = useActiveGroupCohorts(
    enabled && (activeTab === 'sites' || activeTab === 'devices')
  );

  const sitesHook = useActiveGroupCohortSitesWithState(
    sitesParams,
    enabled && activeTab === 'sites',
    activeGroupCohorts
  );

  const devicesHook = useActiveGroupCohortDevicesWithState(
    devicesParams,
    enabled && activeTab === 'devices',
    activeGroupCohorts
  );

  const orgCountriesHook = useGridsSummary(
    countriesParams,
    undefined,
    enabled && isOrgFlow && activeTab === 'countries'
  );

  const publicCountriesHook = useGridsSummaryWithToken(
    countriesParams,
    undefined,
    enabled && !isOrgFlow && activeTab === 'countries'
  );

  const orgCitiesHook = useGridsSummary(
    citiesParams,
    undefined,
    enabled && isOrgFlow && activeTab === 'cities'
  );

  const publicCitiesHook = useGridsSummaryWithToken(
    citiesParams,
    undefined,
    enabled && !isOrgFlow && activeTab === 'cities'
  );

  const countriesHook = isOrgFlow ? orgCountriesHook : publicCountriesHook;
  const citiesHook = isOrgFlow ? orgCitiesHook : publicCitiesHook;

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
      // Use cached selected rows across pages when available.
      const deviceLookupSource =
        selectedDevicesData.length > 0
          ? selectedDevicesData
          : processedDevicesData;
      const selectedDeviceNames = mapDeviceIdsToNames(
        selectedDeviceIds,
        deviceLookupSource
      );
      setSelectedDevices(selectedDeviceNames);
    } else if (activeTab === 'devices' && selectedDeviceIds.length === 0) {
      setSelectedDevices([]);
    }
  }, [
    activeTab,
    selectedDeviceIds,
    selectedDevicesData,
    processedDevicesData,
    setSelectedDevices,
  ]);

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
