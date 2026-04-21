import React from 'react';
import { AqMonitor03, AqMarkerPin03, AqGlobe01 } from '@airqo/icons-react';
import { ColumnConfig, TabConfig, TabType } from '../types/dataExportTypes';
import { DEVICE_CATEGORY_OPTIONS } from '../constants/dataExportConstants';

/**
 * Sites table columns configuration
 */
export const getSitesColumns = (): ColumnConfig[] => [
  {
    key: 'name',
    label: 'Location',
    minWidth: '320px',
    maxWidth: '420px',
    cellClassName: 'whitespace-normal break-normal',
    render: (value: unknown) => (
      <div className="flex items-start gap-2 max-w-[420px] min-w-0">
        <span className="bg-gray-100 rounded-full p-1 mt-0.5 shrink-0">
          <AqMarkerPin03 className="h-4 w-4 shrink-0 text-primary" />
        </span>
        <span className="min-w-0 whitespace-normal break-normal leading-5">
          {value as string}
        </span>
      </div>
    ),
  },
  {
    key: 'city',
    label: 'City',
    minWidth: '120px',
    cellClassName: 'whitespace-nowrap',
  },
  {
    key: 'country',
    label: 'Country',
    minWidth: '140px',
    cellClassName: 'whitespace-nowrap',
  },
  { key: 'data_provider', label: 'Owner' },
  {
    key: 'coordinates',
    label: 'Coordinates',
    render: (value: unknown) => (
      <span className="font-mono text-sm whitespace-nowrap">
        {value as string}
      </span>
    ),
  },
];

/**
 * Devices table columns configuration
 */
export const getDevicesColumns = (): ColumnConfig[] => [
  {
    key: 'name',
    label: 'Device name',
    cellClassName: 'whitespace-nowrap',
    render: (value: unknown) => (
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className="bg-gray-100 rounded-full p-1">
          <AqMonitor03 className="h-4 w-4 shrink-0 text-primary" />
        </span>
        <span>{value as string}</span>
      </div>
    ),
  },
  { key: 'network', label: 'Network' },
  {
    key: 'category',
    label: 'Category',
    render: (value: unknown) => {
      const category = value as string;
      const option = DEVICE_CATEGORY_OPTIONS.find(
        opt => opt.value === category
      );
      return <span>{option?.label || category}</span>;
    },
  },
  {
    key: 'coordinates',
    label: 'Coordinates',
    cellClassName: 'whitespace-nowrap',
    render: (value: unknown) => (
      <span className="font-mono text-sm whitespace-nowrap">
        {value as string}
      </span>
    ),
  },
];

/**
 * Countries table columns configuration
 */
export const getCountriesColumns = (): ColumnConfig[] => [
  {
    key: 'name',
    label: 'Country',
    cellClassName: 'whitespace-nowrap',
    render: (value: unknown) => (
      <div className="flex items-center capitalize gap-2 whitespace-nowrap">
        <span className="bg-gray-100 rounded-full p-1">
          <AqGlobe01 className="h-4 w-4 shrink-0 text-primary" />
        </span>
        <span>{value as string}</span>
      </div>
    ),
  },
  {
    key: 'network',
    label: 'Network',
    render: (value: unknown) => (
      <span className="uppercase">{value as string}</span>
    ),
  },
  { key: 'numberOfSites', label: 'Sites Count' },
];

/**
 * Cities table columns configuration
 */
export const getCitiesColumns = (): ColumnConfig[] => [
  {
    key: 'name',
    label: 'City',
    cellClassName: 'whitespace-nowrap',
    render: (value: unknown) => (
      <div className="flex items-center capitalize gap-2 whitespace-nowrap">
        <span className="bg-gray-100 rounded-full p-1">
          <AqMarkerPin03 className="h-4 w-4 shrink-0 text-primary" />
        </span>
        <span>{value as string}</span>
      </div>
    ),
  },
  {
    key: 'network',
    label: 'Network',
    render: (value: unknown) => (
      <span className="uppercase">{value as string}</span>
    ),
  },
  { key: 'numberOfSites', label: 'Sites Count' },
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
    countries: {
      columns: getCountriesColumns(),
      title: 'Countries',
      hasCategory: false,
    },
    cities: {
      columns: getCitiesColumns(),
      title: 'Cities',
      hasCategory: false,
    },
  };

  return configs[tab];
};
