import type { CountryData } from '../../../shared/types/api';

/**
 * Country interface for display in the UI
 */
export interface Country {
  code: string;
  name: string;
  flag: string;
}

/**
 * Location interface for display in the UI
 */
export interface Location {
  id: string;
  title: string;
  location: string;
}

/**
 * Transforms API country data to UI display format
 * Adds "All" option first, sorts with Uganda prioritized, and formats country codes
 */
export function normalizeCountries(countriesData: CountryData[]): Country[] {
  const transformedCountries: Country[] = [
    { code: 'all', name: 'All', flag: '🌍' },
  ];

  if (countriesData) {
    // Sort countries with Uganda first
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

/**
 * Transforms API sites data to UI location format
 * Extracts relevant fields for display in the locations list
 */
export function normalizeLocations(
  sites: Record<string, unknown>[]
): Location[] {
  return sites.map(site => ({
    id: site._id as string,
    title: (site.search_name || site.name || site.formatted_name) as string,
    location: (site.location_name || `${site.city}, ${site.country}`) as string,
  }));
}

/**
 * Capitalizes the first letter of each word in a string
 * Used for formatting country names and other display text
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Converts a country code (with underscores) back to a properly formatted country name
 * Used when passing country parameters to APIs that expect capitalized names
 */
export function formatCountryForApi(countryCode: string): string {
  if (!countryCode || countryCode === 'all') return '';

  return countryCode
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Filters locations based on a search query
 * Searches in both title and location fields
 */
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

/**
 * Limits the number of locations displayed initially
 * Used for pagination in the UI
 */
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
import type { WAQICityResponse } from '../types/waqi';
import type { ForecastData } from '../../../shared/types/api';
import {
  getAirQualityLevel,
  getAirQualityColor,
} from '../../../shared/utils/airQuality';

/**
 * Pollutant type for dynamic selection
 */
export type PollutantType = 'pm2_5' | 'pm10';

/**
 * Configuration for pollutant display
 */
export interface PollutantConfig {
  type: PollutantType;
  label: string;
  unit: string;
}

/**
 * Available pollutant configurations
 */
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

/**
 * Default pollutant for display
 */
export const DEFAULT_POLLUTANT: PollutantType = 'pm2_5';

/**
 * Normalizes API map readings to UI air quality readings format
 * Converts MapReading[] to AirQualityReading[] with dynamic pollutant support
 */
export function normalizeMapReadings(
  readings: MapReading[],
  pollutantType: PollutantType = DEFAULT_POLLUTANT
): AirQualityReading[] {
  return readings
    .filter(reading => {
      // Filter out readings without required data
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

      return {
        id: reading.site_id || reading._id,
        siteId: reading.site_id,
        longitude: reading.siteDetails.approximate_longitude,
        latitude: reading.siteDetails.approximate_latitude,
        pm25Value: reading.pm2_5?.value || 0,
        pm10Value: reading.pm10?.value || 0,
        locationName:
          reading.siteDetails.search_name ||
          reading.siteDetails.formatted_name ||
          reading.siteDetails.name ||
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
        provider: reading.siteDetails.data_provider || 'AirQo',
        status: reading.is_reading_primary ? 'active' : 'inactive',
        isPrimary: reading.is_reading_primary,
        aqiCategory: reading.aqi_category,
        aqiColor: reading.aqi_color,
        pollutantValue,
        pollutantType,
        fullReadingData: reading,
      } as AirQualityReading & {
        aqiCategory: string;
        aqiColor: string;
        pollutantValue: number;
        pollutantType: PollutantType;
        fullReadingData: MapReading;
      };
    });
}

/**
 * Normalizes WAQI city data to UI air quality readings format
 */
export function normalizeWAQIReadings(
  waqiData: Array<{ city: string; data: WAQICityResponse['data'] }>
): AirQualityReading[] {
  const seenIds = new Set<string>();

  return waqiData
    .filter(item => item.data && item.data.city && item.data.city.url)
    .map(item => {
      const data = item.data;
      const pm25 = data.iaqi.pm25?.v || 0;
      const pm10 = data.iaqi.pm10?.v || 0;

      // Use PM2.5 for AQI calculation
      const level = getAirQualityLevel(pm25, 'pm2_5');
      const color = getAirQualityColor(level);

      // Convert WAQI forecast to AirQo forecast format if available
      let forecastData: ForecastData[] = [];
      if (data.forecast?.daily?.pm25) {
        forecastData = data.forecast.daily.pm25.map(f => ({
          time: f.day,
          pm2_5: f.avg,
          aqi_category: getAirQualityLevel(f.avg, 'pm2_5'),
          aqi_color: getAirQualityColor(getAirQualityLevel(f.avg, 'pm2_5')),
          aqi_color_name: getAirQualityLevel(f.avg, 'pm2_5'),
        }));
      }

      // Safely parse the date
      let lastUpdated: Date;
      try {
        lastUpdated = data.time?.s ? new Date(data.time.s) : new Date();
        // Check if the date is valid
        if (isNaN(lastUpdated.getTime())) {
          lastUpdated = new Date(); // Fallback to current date
        }
      } catch (error) {
        console.warn('Invalid date from WAQI API:', data.time?.s, error);
        lastUpdated = new Date(); // Fallback to current date
      }

      // Generate unique ID from URL to prevent duplicates
      const rawId = `waqi-${data.city.url.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
      // Ensure uniqueness by appending counter if needed
      let uniqueId = rawId;
      let counter = 1;
      while (seenIds.has(uniqueId)) {
        uniqueId = `${rawId}-${counter}`;
        counter++;
      }
      seenIds.add(uniqueId);

      return {
        id: uniqueId,
        siteId: uniqueId,
        longitude: parseFloat(data.city.geo[1]),
        latitude: parseFloat(data.city.geo[0]),
        pm25Value: pm25,
        pm10Value: pm10,
        locationName: data.city.name,
        lastUpdated,
        provider: 'WAQI',
        status: 'active',
        isPrimary: false,
        aqiCategory: level,
        aqiColor: color,
        pollutantValue: pm25, // Default to PM2.5
        pollutantType: 'pm2_5',
        // Add WAQI-specific data including forecast
        waqiData: data,
        forecastData: forecastData.length > 0 ? forecastData : undefined,
      };
    });
}
