import { useState, useCallback } from 'react';
import { DateRange } from '@/shared/components/calendar/types';
import {
  DataExportState,
  TabType,
  TabState,
  DeviceCategory,
  DataType,
  Frequency,
  FileType,
} from '../types/dataExportTypes';
import {
  DEFAULT_SELECTED_POLLUTANTS,
  DEFAULT_TAB_STATE,
} from '../constants/dataExportConstants';
import { getDefaultDateRange } from '../utils/dataExportUtils';

/**
 * Custom hook for managing data export state
 */
export const useDataExportState = () => {
  // Initialize state with default values
  const [state, setState] = useState<DataExportState>({
    activeTab: 'sites',
    sidebarOpen: false,
    previewOpen: false,
    fileTitle: '',
    dataType: 'raw',
    frequency: 'daily',
    fileType: 'csv',
    selectedPollutants: [...DEFAULT_SELECTED_POLLUTANTS],
    selectedSites: [],
    selectedDevices: [],
    selectedSiteIds: [],
    selectedDeviceIds: [],
    selectedGridIds: [],
    selectedGridSites: {},
    enableSiteSelection: false,
    selectedGridSiteIds: {},
    deviceCategory: 'lowcost',
    dateRange: getDefaultDateRange(),
    tabStates: {
      sites: { ...DEFAULT_TAB_STATE },
      devices: { ...DEFAULT_TAB_STATE },
      countries: { ...DEFAULT_TAB_STATE },
      cities: { ...DEFAULT_TAB_STATE },
    },
  });

  // State update functions
  const updateState = useCallback((updates: Partial<DataExportState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setActiveTab = useCallback(
    (tab: TabType) => {
      updateState({ activeTab: tab });
    },
    [updateState]
  );

  const setSidebarOpen = useCallback(
    (open: boolean) => {
      updateState({ sidebarOpen: open });
    },
    [updateState]
  );

  const setPreviewOpen = useCallback(
    (open: boolean) => {
      updateState({ previewOpen: open });
    },
    [updateState]
  );

  const setFileTitle = useCallback(
    (title: string) => {
      updateState({ fileTitle: title });
    },
    [updateState]
  );

  const setDataType = useCallback(
    (type: DataType) => {
      updateState({ dataType: type });
    },
    [updateState]
  );

  const setFrequency = useCallback(
    (freq: Frequency) => {
      updateState({ frequency: freq });
    },
    [updateState]
  );

  const setFileType = useCallback(
    (type: FileType) => {
      updateState({ fileType: type });
    },
    [updateState]
  );

  const setSelectedPollutants = useCallback(
    (pollutants: string[] | ((prev: string[]) => string[])) => {
      if (typeof pollutants === 'function') {
        setState(prev => ({
          ...prev,
          selectedPollutants: pollutants(prev.selectedPollutants),
        }));
      } else {
        updateState({ selectedPollutants: pollutants });
      }
    },
    [updateState]
  );

  const setSelectedSites = useCallback(
    (sites: string[]) => {
      updateState({ selectedSites: sites });
    },
    [updateState]
  );

  const setSelectedDevices = useCallback(
    (devices: string[]) => {
      updateState({ selectedDevices: devices });
    },
    [updateState]
  );

  const setSelectedSiteIds = useCallback(
    (ids: string[]) => {
      updateState({ selectedSiteIds: ids });
    },
    [updateState]
  );

  const setSelectedDeviceIds = useCallback(
    (ids: string[]) => {
      updateState({ selectedDeviceIds: ids });
    },
    [updateState]
  );

  const setSelectedGridIds = useCallback(
    (ids: string[]) => {
      updateState({ selectedGridIds: ids });
    },
    [updateState]
  );

  const setSelectedGridSites = useCallback(
    (
      sites:
        | Record<string, string[]>
        | ((prev: Record<string, string[]>) => Record<string, string[]>)
    ) => {
      if (typeof sites === 'function') {
        setState(prev => ({
          ...prev,
          selectedGridSites: sites(prev.selectedGridSites),
        }));
      } else {
        updateState({ selectedGridSites: sites });
      }
    },
    [updateState]
  );

  const setEnableSiteSelection = useCallback(
    (enable: boolean) => {
      updateState({ enableSiteSelection: enable });
    },
    [updateState]
  );

  const setSelectedGridSiteIds = useCallback(
    (
      ids:
        | Record<string, string[]>
        | ((prev: Record<string, string[]>) => Record<string, string[]>)
    ) => {
      if (typeof ids === 'function') {
        setState(prev => ({
          ...prev,
          selectedGridSiteIds: ids(prev.selectedGridSiteIds),
        }));
      } else {
        updateState({ selectedGridSiteIds: ids });
      }
    },
    [updateState]
  );

  const setDeviceCategory = useCallback(
    (category: DeviceCategory) => {
      updateState({ deviceCategory: category });
    },
    [updateState]
  );

  const setDateRange = useCallback(
    (range: DateRange | undefined) => {
      updateState({ dateRange: range });
    },
    [updateState]
  );

  const updateTabState = useCallback(
    (tab: TabType, updates: Partial<TabState>) => {
      setState(prev => ({
        ...prev,
        tabStates: {
          ...prev.tabStates,
          [tab]: { ...prev.tabStates[tab], ...updates },
        },
      }));
    },
    []
  );

  // Handle tab switching - clear selections to avoid conflicts
  const handleTabChange = useCallback(
    (tab: TabType, isOrgFlow = false) => {
      // Prevent switching to countries or cities tabs in org flow
      if (isOrgFlow && (tab === 'countries' || tab === 'cities')) {
        return;
      }
      setActiveTab(tab);
      setSelectedSites([]);
      setSelectedDevices([]);
      setSelectedSiteIds([]);
      setSelectedDeviceIds([]);
      setSelectedGridIds([]);
      setSelectedGridSites({});
      setEnableSiteSelection(false);
      setSelectedGridSiteIds({});
    },
    [
      setActiveTab,
      setSelectedSites,
      setSelectedDevices,
      setSelectedSiteIds,
      setSelectedDeviceIds,
      setSelectedGridIds,
      setSelectedGridSites,
      setEnableSiteSelection,
      setSelectedGridSiteIds,
    ]
  );

  // Handle clearing all selections
  const handleClearSelections = useCallback(() => {
    setSelectedSites([]);
    setSelectedDevices([]);
    setSelectedSiteIds([]);
    setSelectedDeviceIds([]);
    setSelectedGridIds([]);
    setSelectedGridSites({});
    setEnableSiteSelection(false);
    setSelectedGridSiteIds({});
  }, [
    setSelectedSites,
    setSelectedDevices,
    setSelectedSiteIds,
    setSelectedDeviceIds,
    setSelectedGridIds,
    setSelectedGridSites,
    setEnableSiteSelection,
    setSelectedGridSiteIds,
  ]);

  return {
    ...state,
    updateState,
    setActiveTab,
    setSidebarOpen,
    setPreviewOpen,
    setFileTitle,
    setDataType,
    setFrequency,
    setFileType,
    setSelectedPollutants,
    setSelectedSites,
    setSelectedDevices,
    setSelectedSiteIds,
    setSelectedDeviceIds,
    setSelectedGridIds,
    setSelectedGridSites,
    setEnableSiteSelection,
    setSelectedGridSiteIds,
    setDeviceCategory,
    setDateRange,
    updateTabState,
    handleTabChange,
    handleClearSelections,
  };
};
