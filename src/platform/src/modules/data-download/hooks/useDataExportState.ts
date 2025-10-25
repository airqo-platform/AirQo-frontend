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
    deviceCategory: 'lowcost',
    dateRange: getDefaultDateRange(),
    tabStates: {
      sites: { ...DEFAULT_TAB_STATE },
      devices: { ...DEFAULT_TAB_STATE },
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
    (tab: TabType) => {
      setActiveTab(tab);
      setSelectedSites([]);
      setSelectedDevices([]);
      setSelectedSiteIds([]);
      setSelectedDeviceIds([]);
    },
    [
      setActiveTab,
      setSelectedSites,
      setSelectedDevices,
      setSelectedSiteIds,
      setSelectedDeviceIds,
    ]
  );

  // Handle clearing all selections
  const handleClearSelections = useCallback(() => {
    setSelectedSites([]);
    setSelectedDevices([]);
    setSelectedSiteIds([]);
    setSelectedDeviceIds([]);
  }, [
    setSelectedSites,
    setSelectedDevices,
    setSelectedSiteIds,
    setSelectedDeviceIds,
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
    setDeviceCategory,
    setDateRange,
    updateTabState,
    handleTabChange,
    handleClearSelections,
  };
};
