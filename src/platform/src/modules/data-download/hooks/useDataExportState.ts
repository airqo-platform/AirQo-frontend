import { useState, useCallback } from 'react';
import { DateRange } from '@/shared/components/calendar/types';
import { areArraysEqual } from '@/shared/utils/arrays';
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

type StringArrayField =
  | 'selectedPollutants'
  | 'selectedSites'
  | 'selectedDevices'
  | 'selectedSiteIds'
  | 'selectedDeviceIds'
  | 'selectedGridIds';

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

  const updateStringArrayField = useCallback(
    (field: StringArrayField, values: string[]) => {
      setState(prev => {
        if (areArraysEqual(prev[field], values)) {
          return prev;
        }

        return {
          ...prev,
          [field]: values,
        } as DataExportState;
      });
    },
    []
  );

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
      setState(prev => {
        const nextPollutants =
          typeof pollutants === 'function'
            ? pollutants(prev.selectedPollutants)
            : pollutants;

        if (areArraysEqual(prev.selectedPollutants, nextPollutants)) {
          return prev;
        }

        return {
          ...prev,
          selectedPollutants: nextPollutants,
        };
      });
    },
    []
  );

  const setSelectedSites = useCallback(
    (sites: string[]) => {
      updateStringArrayField('selectedSites', sites);
    },
    [updateStringArrayField]
  );

  const setSelectedDevices = useCallback(
    (devices: string[]) => {
      updateStringArrayField('selectedDevices', devices);
    },
    [updateStringArrayField]
  );

  const setSelectedSiteIds = useCallback(
    (ids: string[]) => {
      updateStringArrayField('selectedSiteIds', ids);
    },
    [updateStringArrayField]
  );

  const setSelectedDeviceIds = useCallback(
    (ids: string[]) => {
      updateStringArrayField('selectedDeviceIds', ids);
    },
    [updateStringArrayField]
  );

  const setSelectedGridIds = useCallback(
    (ids: string[]) => {
      updateStringArrayField('selectedGridIds', ids);
    },
    [updateStringArrayField]
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

  const resetGroupScopedState = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeTab: 'sites',
      previewOpen: false,
      selectedSites: [],
      selectedDevices: [],
      selectedSiteIds: [],
      selectedDeviceIds: [],
      selectedGridIds: [],
      selectedGridSites: {},
      enableSiteSelection: false,
      selectedGridSiteIds: {},
      tabStates: {
        sites: { ...DEFAULT_TAB_STATE },
        devices: { ...DEFAULT_TAB_STATE },
        countries: { ...DEFAULT_TAB_STATE },
        cities: { ...DEFAULT_TAB_STATE },
      },
    }));
  }, []);

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
    resetGroupScopedState,
    handleTabChange,
    handleClearSelections,
  };
};
