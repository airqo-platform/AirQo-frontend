/**
 * Utility functions for normalizing site data from API responses
 */

// Raw site data from API response
export interface RawSiteData {
  _id: string;
  search_name?: string;
  location_name?: string;
  formatted_name?: string;
  name?: string;
  city?: string;
  country?: string;
  data_provider?: string;
  [key: string]: unknown;
}

/**
 * Resolves the display label for a site/location using the shared precedence.
 */
export const getSiteDisplayName = (
  site: Pick<
    RawSiteData,
    'search_name' | 'location_name' | 'name' | 'formatted_name'
  >
): string => {
  return (
    site.search_name?.trim() ||
    site.location_name?.trim() ||
    site.name?.trim() ||
    site.formatted_name?.trim() ||
    'Unknown Location'
  );
};

// Normalized site data for table display
export interface NormalizedSiteData {
  id: string;
  location: string;
  city: string;
  country: string;
  owner: string;
  // Include raw data for access to other properties if needed
  _raw?: RawSiteData;
  // Add index signature to make it compatible with TableItem
  [key: string]: unknown;
}

/**
 * Normalizes a single site object for table display
 * @param site Raw site data from API
 * @returns Normalized site data
 */
export const normalizeSiteData = (site: RawSiteData): NormalizedSiteData => {
  // Extract location name with fallback priority
  const location = getSiteDisplayName(site);

  return {
    id: site._id,
    location: location,
    city: site.city || 'Unknown City',
    country: site.country || 'Unknown Country',
    owner: site.data_provider || 'Unknown Owner',
    _raw: site, // Keep original data for reference
  };
};

/**
 * Normalizes an array of sites for table display
 * @param sites Array of raw site data from API
 * @returns Array of normalized site data
 */
export const normalizeSitesData = (
  sites: RawSiteData[]
): NormalizedSiteData[] => {
  return sites.map(normalizeSiteData);
};

/**
 * Utility to get display value for a site property with fallbacks
 * @param site Raw site data
 * @param property Property to extract
 * @returns Display value with appropriate fallback
 */
export const getSiteDisplayValue = (
  site: RawSiteData,
  property: 'location' | 'city' | 'country' | 'owner'
): string => {
  switch (property) {
    case 'location':
      return getSiteDisplayName(site);
    case 'city':
      return site.city || 'Unknown City';
    case 'country':
      return site.country || 'Unknown Country';
    case 'owner':
      return site.data_provider || 'Unknown Owner';
    default:
      return 'Unknown';
  }
};

/**
 * Type guard to check if an object has the required site properties
 * @param obj Object to check
 * @returns True if object has required site properties
 */
export const isValidSiteData = (obj: unknown): obj is RawSiteData => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '_id' in obj &&
    typeof (obj as RawSiteData)._id === 'string'
  );
};
