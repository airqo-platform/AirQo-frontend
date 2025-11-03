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
