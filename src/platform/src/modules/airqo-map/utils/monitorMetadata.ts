import type { DeviceCategories } from '@/shared/types/api';

const CATEGORY_LABEL_OVERRIDES: Record<string, string> = {
  airqo: 'AirQo',
  bam: 'BAM',
  lowcost: 'Low Cost',
  low_cost: 'Low Cost',
  us: 'US',
  uk: 'UK',
};

export interface MonitorMetadata {
  provider: string;
  ownershipCategory: string | null;
  primaryCategory: string | null;
  deploymentCategory: string | null;
}

interface MonitorAwareReading {
  provider?: string;
  siteDetails?: {
    data_provider?: string;
  };
  device_categories?: DeviceCategories;
  deviceCategories?: DeviceCategories;
  fullReadingData?: {
    siteDetails?: {
      data_provider?: string;
    };
    device_categories?: DeviceCategories;
  };
}

export const formatDeviceCategoryLabel = (
  value?: string | null
): string | null => {
  if (!value) return null;

  const normalized = value
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();

  if (!normalized) return null;

  if (CATEGORY_LABEL_OVERRIDES[normalized]) {
    return CATEGORY_LABEL_OVERRIDES[normalized];
  }

  return normalized.replace(/\b\w/g, char => char.toUpperCase());
};

export const getDeviceCategories = (
  reading?: MonitorAwareReading | null
): DeviceCategories | undefined => {
  if (!reading) return undefined;

  return (
    reading.device_categories ??
    reading.deviceCategories ??
    reading.fullReadingData?.device_categories
  );
};

export const getMonitorMetadata = (
  reading?: MonitorAwareReading | null,
  fallbackProvider = 'AirQo'
): MonitorMetadata => {
  const categories = getDeviceCategories(reading);

  const ownershipCategory = formatDeviceCategoryLabel(
    categories?.ownership_category
  );
  const primaryCategory = formatDeviceCategoryLabel(
    categories?.primary_category
  );
  const deploymentCategory = formatDeviceCategoryLabel(
    categories?.deployment_category
  );

  const providerFallback =
    reading?.provider ||
    reading?.siteDetails?.data_provider ||
    reading?.fullReadingData?.siteDetails?.data_provider ||
    fallbackProvider;

  const hasPrimaryCategory = Boolean(categories?.primary_category?.trim());
  const provider = hasPrimaryCategory
    ? ownershipCategory || providerFallback || fallbackProvider
    : providerFallback || ownershipCategory || fallbackProvider;

  return {
    provider,
    ownershipCategory,
    primaryCategory,
    deploymentCategory,
  };
};
