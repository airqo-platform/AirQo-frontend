import React from 'react';
import { AqMonitor03, AqMarkerPin03 } from '@airqo/icons-react';
import { ColumnConfig, TabConfig, TabType } from '../types/dataExportTypes';

/**
 * Sites table columns configuration
 */
export const getSitesColumns = (): ColumnConfig[] => [
  {
    key: 'name',
    label: 'Location',
    render: (value: unknown) => (
      <div className="flex items-center capitalize gap-2">
        <span className="bg-gray-100 rounded-full p-1">
          <AqMarkerPin03 className="h-4 w-4 shrink-0 text-primary" />
        </span>
        <span>{value as string}</span>
      </div>
    ),
  },
  { key: 'city', label: 'City' },
  { key: 'country', label: 'Country' },
  { key: 'data_provider', label: 'Owner' },
];

/**
 * Devices table columns configuration
 */
export const getDevicesColumns = (): ColumnConfig[] => [
  {
    key: 'name',
    label: 'Device name',
    render: (value: unknown) => (
      <div className="flex items-center capitalize gap-2">
        <span className="bg-gray-100 rounded-full p-1">
          <AqMonitor03 className="h-4 w-4 shrink-0 text-primary" />
        </span>
        <span>{value as string}</span>
      </div>
    ),
  },
  { key: 'network', label: 'Network' },
  { key: 'category', label: 'Category' },
];

/**
 * Tab configuration
 */
export const getTabConfig = (tab: TabType): TabConfig => {
  const configs = {
    sites: {
      columns: getSitesColumns(),
      title: 'Sites',
      hasCategory: false,
    },
    devices: {
      columns: getDevicesColumns(),
      title: 'Devices',
      hasCategory: false,
    },
  };

  return configs[tab];
};
