import type { CountryData } from '../../../shared/types/api';

export interface Country {
  code: string;
  name: string;
  flag: string;
}

export interface Location {
  id: string;
  title: string;
  location: string;
}

// Transforms API country data to UI format with Uganda prioritized
export function normalizeCountries(countriesData: CountryData[]): Country[] {
  const transformedCountries: Country[] = [
    { code: 'all', name: 'All', flag: '🌍' },
  ];

  if (countriesData && countriesData.length > 0) {
    // Sort with Uganda first
    const sortedCountries = [...countriesData].sort((a, b) => {
      if (a.country.toLowerCase() === 'uganda') return -1;
      if (b.country.toLowerCase() === 'uganda') return 1;
      return a.country.localeCompare(b.country);
    });

    sortedCountries.forEach(countryData => {
      transformedCountries.push({
        code: countryData.country.toLowerCase().replace(/\s+/g, '_'),
        name: countryData.country,
        flag: countryData.flag_url,
      });
    });
  }

  return transformedCountries;
}

export function normalizeLocations(
  sites: Record<string, unknown>[]
): Location[] {
  return sites.map(site => ({
    id: site._id as string,
    title: (site.search_name || site.name || site.formatted_name) as string,
    location: (site.location_name || `${site.city}, ${site.country}`) as string,
  }));
}

// Converts country code to properly formatted name for API
export function formatCountryForApi(countryCode: string): string {
  if (!countryCode || countryCode === 'all') return '';

  return countryCode
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function filterLocations(
  locations: Location[],
  searchQuery: string
): Location[] {
  if (!searchQuery.trim()) return locations;

  const query = searchQuery.toLowerCase();
  return locations.filter(
    location =>
      location.title.toLowerCase().includes(query) ||
      location.location.toLowerCase().includes(query)
  );
}

export function limitLocationsForDisplay(
  locations: Location[],
  isSearching: boolean,
  initialLimit = 6
): { displayed: Location[]; hasMore: boolean } {
  if (isSearching) {
    return { displayed: locations, hasMore: false };
  }

  const displayed = locations.slice(0, initialLimit);
  const hasMore = locations.length > initialLimit;

  return { displayed, hasMore };
}

import type { MapReading } from '../../../shared/types/api';
import type { AirQualityReading } from '../components/map/MapNodes';
import {
  type AirQualityLevel,
  type PollutantType,
  getAirQualityLevel,
  mapAqiCategoryToLevel,
} from '../../../shared/utils/airQuality';
import type { AqiConfig } from '../../../shared/types/aqi';
import { getMonitorMetadata } from './monitorMetadata';

export interface PollutantConfig {
  type: PollutantType;
  label: string;
  unit: string;
}

export const POLLUTANT_CONFIGS: Record<PollutantType, PollutantConfig> = {
  pm2_5: {
    type: 'pm2_5',
    label: 'PM2.5',
    unit: 'µg/m³',
  },
  pm10: {
    type: 'pm10',
    label: 'PM10',
    unit: 'µg/m³',
  },
};

export const DEFAULT_POLLUTANT: PollutantType = 'pm2_5';

// Normalizes API map readings to UI format with dynamic pollutant support
export function normalizeMapReadings(
  readings: MapReading[],
  pollutantType: PollutantType = DEFAULT_POLLUTANT
): AirQualityReading[] {
  return readings
    .filter(reading => {
      const pollutantValue = reading[pollutantType]?.value;
      return (
        pollutantValue !== null &&
        pollutantValue !== undefined &&
        reading.siteDetails?.approximate_latitude !== null &&
        reading.siteDetails?.approximate_latitude !== undefined &&
        reading.siteDetails?.approximate_longitude !== null &&
        reading.siteDetails?.approximate_longitude !== undefined
      );
    })
    .map(reading => {
      const pollutantValue = reading[pollutantType]?.value as number;
      const monitorMetadata = getMonitorMetadata(reading);

      return {
        id: reading.site_id || reading._id,
        siteId: reading.site_id,
        longitude: reading.siteDetails.approximate_longitude,
        latitude: reading.siteDetails.approximate_latitude,
        pm25Value: reading.pm2_5?.value || 0,
        pm10Value: reading.pm10?.value || 0,
        locationName:
          reading.siteDetails.search_name ||
          reading.siteDetails.name ||
          reading.siteDetails.formatted_name ||
          `${reading.siteDetails.city}, ${reading.siteDetails.country}`,
        lastUpdated: (() => {
          try {
            const date = new Date(reading.time || reading.updatedAt);
            return isNaN(date.getTime()) ? new Date() : date;
          } catch (error) {
            console.warn(
              'Invalid date in AirQo reading:',
              reading.time,
              reading.updatedAt,
              error
            );
            return new Date();
          }
        })(),
        provider: monitorMetadata.provider,
        status: reading.is_reading_primary ? 'active' : 'inactive',
        isPrimary: reading.is_reading_primary,
        deviceCategories: reading.device_categories,
        primaryCategory: monitorMetadata.primaryCategory,
        deploymentCategory: monitorMetadata.deploymentCategory,
        aqiCategory: reading.aqi_category,
        aqiColor: reading.aqi_color,
        aqiIndex: reading.aqi_index,
        pollutantValue,
        pollutantType,
        fullReadingData: reading,
      } as AirQualityReading & {
        aqiCategory: string;
        aqiColor: string;
        aqiIndex: number;
        pollutantValue: number;
        pollutantType: PollutantType;
        fullReadingData: MapReading;
      };
    });
}

/**
 * Minimal shape needed to classify what a UI surface displays for one reading.
 * Both raw `MapReading` data and normalized `AirQualityReading` data can be
 * projected onto this shape.
 */
export interface DisplayLevelInput {
  pm25Value?: number;
  pm10Value?: number;
  aqiCategory?: string;
  /** Raw API reading carrying the original `aqi_category`. */
  fullReadingData?: Pick<MapReading, 'aqi_category'>;
}

/** Where a displayed classification came from. */
export type DisplayLevelSource = 'aqi-category' | 'concentration';

export interface ResolvedDisplayLevel {
  level: AirQualityLevel;
  source: DisplayLevelSource;
}

/**
 * Resolve the AQI level to DISPLAY alongside the API's `aqi_index` number.
 *
 * The number shown to users is the backend-computed AQI index, and the
 * backend's own classification of that index is `aqi_category`. Concentration
 * bands (µg/m³) and AQI index bands (0–500) are different scales, so
 * classifying the concentration while displaying the index can contradict the
 * number on screen (e.g. index says "Unhealthy" while the color says
 * "Moderate"). The API category is therefore authoritative whenever it maps to
 * a known level; only when no category exists do we fall back to classifying
 * the concentration through the configured AQI ranges (`getAirQualityLevel`).
 *
 * This is the SINGLE classification path for the map module — tooltips,
 * sidebar cards and map nodes must all go through it so number, color, icon
 * and label always agree.
 */
export function resolveReadingDisplayLevel(
  reading: DisplayLevelInput,
  pollutantType: PollutantType = DEFAULT_POLLUTANT,
  aqiConfig?: AqiConfig | null
): ResolvedDisplayLevel {
  const categoryLevel = mapAqiCategoryToLevel(
    reading.aqiCategory ?? reading.fullReadingData?.aqi_category
  );
  if (categoryLevel !== 'no-value') {
    return { level: categoryLevel, source: 'aqi-category' };
  }

  const value =
    pollutantType === 'pm2_5' ? reading.pm25Value : reading.pm10Value;
  return {
    level: getAirQualityLevel(value, pollutantType, aqiConfig ?? null),
    source: 'concentration',
  };
}

/**
 * Convenience wrapper returning just the resolved level — see
 * {@link resolveReadingDisplayLevel} for the classification priority.
 */
export function getReadingAqiLevel(
  reading: DisplayLevelInput,
  pollutantType: PollutantType = DEFAULT_POLLUTANT,
  aqiConfig?: AqiConfig | null
): AirQualityLevel {
  return resolveReadingDisplayLevel(reading, pollutantType, aqiConfig).level;
}

/** Result of aggregating a cluster's members for display. */
export interface ResolvedClusterDisplay extends ResolvedDisplayLevel {
  /** True when at least one member has a value for the selected pollutant. */
  hasData: boolean;
  /** Mean concentration across members with values (0 when hasData is false). */
  avgConcentration: number;
  /** Mean API AQI index across members reporting one (undefined otherwise). */
  avgAqiIndex?: number;
}

/**
 * Aggregate a cluster's members into one consistent display classification.
 *
 * The cluster has no AQI index of its own — tooltips show the mean member
 * index — so classification prefers the most common member `aqi_category`
 * ({@link getClusterCategoryFallback}), then falls back to classifying the
 * mean concentration via {@link resolveReadingDisplayLevel}.
 */
export function resolveClusterDisplay(
  readings: Array<
    Pick<
      AirQualityReading,
      'pm25Value' | 'pm10Value' | 'aqiCategory' | 'aqiIndex'
    >
  >,
  pollutantType: PollutantType = DEFAULT_POLLUTANT,
  aqiConfig?: AqiConfig | null
): ResolvedClusterDisplay {
  const validReadings = readings.filter(r => {
    const val = pollutantType === 'pm2_5' ? r.pm25Value : r.pm10Value;
    return val !== undefined && !isNaN(val);
  });

  const avgConcentration = validReadings.length
    ? validReadings.reduce(
        (sum, r) =>
          sum + (pollutantType === 'pm2_5' ? r.pm25Value : r.pm10Value),
        0
      ) / validReadings.length
    : 0;

  const aqiValues = readings
    .map(r => r.aqiIndex)
    .filter((v): v is number => typeof v === 'number' && !isNaN(v));
  const avgAqiIndex = aqiValues.length
    ? aqiValues.reduce((sum, v) => sum + v, 0) / aqiValues.length
    : undefined;

  const { level, source } = resolveReadingDisplayLevel(
    {
      pm25Value: avgConcentration,
      pm10Value: avgConcentration,
      aqiCategory: getClusterCategoryFallback(readings),
    },
    pollutantType,
    aqiConfig
  );

  return {
    level,
    source,
    hasData: validReadings.length > 0,
    avgConcentration,
    avgAqiIndex,
  };
}

/**
 * Pick the most common API-provided aqi_category across a cluster's members.
 * Used as the classification fallback for cluster markers/tooltips when the
 * configured AQI ranges are unavailable, so a cluster never shows the generic
 * "no data" state while its members do have categories. Ties are broken by
 * whichever category appears first in member order (the map sorts readings
 * geographically, so this is effectively the most prevalent one).
 */
export function getClusterCategoryFallback(
  readings: Array<Pick<AirQualityReading, 'aqiCategory'>>
): string | undefined {
  const counts = new Map<string, number>();
  readings.forEach(reading => {
    const category = reading.aqiCategory;
    if (category) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  });

  let best: string | undefined;
  let bestCount = 0;
  counts.forEach((count, category) => {
    if (count > bestCount) {
      best = category;
      bestCount = count;
    }
  });
  return best;
}

// Calculates map bounds and center for auto-zoom functionality
export function calculateMapBounds(
  readings: Array<{
    latitude?: number;
    longitude?: number;
    siteDetails?: {
      approximate_latitude?: number;
      approximate_longitude?: number;
    };
  }>
): {
  center: { longitude: number; latitude: number };
  zoom: number;
} | null {
  if (!readings || readings.length === 0) {
    return null;
  }

  const coordinates = readings
    .map(reading => {
      if (
        reading.latitude !== undefined &&
        reading.latitude !== null &&
        reading.longitude !== undefined &&
        reading.longitude !== null
      ) {
        return { lat: reading.latitude, lng: reading.longitude };
      }
      if (
        reading.siteDetails?.approximate_latitude !== undefined &&
        reading.siteDetails?.approximate_latitude !== null &&
        reading.siteDetails?.approximate_longitude !== undefined &&
        reading.siteDetails?.approximate_longitude !== null
      ) {
        return {
          lat: reading.siteDetails.approximate_latitude,
          lng: reading.siteDetails.approximate_longitude,
        };
      }
      return null;
    })
    .filter((coord): coord is { lat: number; lng: number } => coord !== null);

  if (coordinates.length === 0) {
    return null;
  }

  if (coordinates.length === 1) {
    return {
      center: {
        longitude: coordinates[0].lng,
        latitude: coordinates[0].lat,
      },
      zoom: 16,
    };
  }

  const lngs = coordinates.map(c => c.lng);
  const lats = coordinates.map(c => c.lat);

  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const centerLng = (minLng + maxLng) / 2;
  const centerLat = (minLat + maxLat) / 2;

  const lngSpan = maxLng - minLng;
  const latSpan = maxLat - minLat;
  const maxSpan = Math.max(lngSpan, latSpan);

  // Mapbox zoom levels: 0 (world) to 22 (building level)
  let zoom: number;
  if (maxSpan < 0.01) zoom = 17;
  else if (maxSpan < 0.05) zoom = 15;
  else if (maxSpan < 0.2) zoom = 13;
  else if (maxSpan < 0.5) zoom = 12;
  else if (maxSpan < 1) zoom = 11;
  else zoom = 10;

  return {
    center: {
      longitude: centerLng,
      latitude: centerLat,
    },
    zoom,
  };
}
