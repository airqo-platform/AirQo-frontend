import type { AirQualityReading } from '../components/map/MapNodes';

/**
 * Data provider utilities for the map.
 *
 * The API reports the monitoring data provider on `siteDetails.data_provider`
 * with inconsistent casing ("AIRQO", "AirQo", "airqo") and combined values
 * ("AIRGRADIENT / AIRQO") for sites co-managed by multiple providers. Every
 * helper here normalizes those values to a canonical uppercase key so the map
 * filter behaves predictably regardless of the raw payload.
 */

export const DATA_PROVIDER_ALL = 'all';

const DATA_PROVIDER_LABELS: Record<string, string> = {
  AIRQO: 'AirQo',
  AIRGRADIENT: 'AirGradient',
};

/**
 * Split a raw data_provider value into canonical provider keys.
 * Handles combined values such as "AIRGRADIENT / AIRQO" and trims/deduplicates.
 */
export const normalizeDataProvider = (raw?: string | null): string[] => {
  if (!raw || typeof raw !== 'string') return [];

  return Array.from(
    new Set(
      raw
        .split(/[/,&]/)
        .map(part => part.trim().toUpperCase())
        .filter(Boolean)
    )
  );
};

/**
 * Human-readable label for a canonical provider key, e.g. "AIRQO" → "AirQo".
 */
export const getDataProviderDisplayLabel = (provider: string): string => {
  const canonical = provider.trim().toUpperCase();
  return (
    DATA_PROVIDER_LABELS[canonical] ??
    canonical.charAt(0).toUpperCase() + canonical.slice(1).toLowerCase()
  );
};

/**
 * Extract the canonical provider keys present in a set of normalized readings.
 * Order is stable: AirQo first, then AirGradient, then any others alphabetically.
 */
export const extractDataProviders = (
  readings: AirQualityReading[]
): string[] => {
  const providers = new Set<string>();
  readings.forEach(reading => {
    const raw = reading.fullReadingData?.siteDetails?.data_provider;
    normalizeDataProvider(raw).forEach(provider => providers.add(provider));
  });

  const ORDER: Record<string, number> = { AIRQO: 0, AIRGRADIENT: 1 };
  return Array.from(providers).sort(
    (a, b) => (ORDER[a] ?? 2) - (ORDER[b] ?? 2) || a.localeCompare(b)
  );
};

/**
 * Whether a normalized reading belongs to the selected provider.
 * Combined readings (e.g. "AIRGRADIENT / AIRQO") match either selection.
 */
export const readingMatchesDataProvider = (
  reading: AirQualityReading,
  provider: string
): boolean => {
  if (provider === DATA_PROVIDER_ALL) return true;

  const raw = reading.fullReadingData?.siteDetails?.data_provider;
  return normalizeDataProvider(raw).includes(provider.trim().toUpperCase());
};
