/**
 * WHO standard values for reference lines.
 */
export const WHO_STANDARD_VALUES = {
  pm2_5: 15,
  pm10: 45,
  no2: 25,
};

// Define the pollutant ranges based on standard AQI breakpoints
const pollutantRanges = {
  pm2_5: [
    { limit: 500.4, category: 'Hazardous' },
    { limit: 250.4, category: 'VeryUnhealthy' },
    { limit: 150.4, category: 'Unhealthy' },
    { limit: 55.4, category: 'UnhealthyForSensitiveGroups' },
    { limit: 35.4, category: 'ModerateAir' },
    { limit: 12.0, category: 'GoodAir' },
  ],
  pm10: [
    { limit: 604.0, category: 'Hazardous' },
    { limit: 404.0, category: 'VeryUnhealthy' },
    { limit: 254.0, category: 'Unhealthy' },
    { limit: 154.0, category: 'UnhealthyForSensitiveGroups' },
    { limit: 54.0, category: 'ModerateAir' },
    { limit: 0.0, category: 'GoodAir' },
  ],
  no2: [
    { limit: 2049.0, category: 'Hazardous' },
    { limit: 1249.0, category: 'VeryUnhealthy' },
    { limit: 649.0, category: 'Unhealthy' },
    { limit: 360.0, category: 'UnhealthyForSensitiveGroups' },
    { limit: 100.0, category: 'ModerateAir' },
    { limit: 0.0, category: 'GoodAir' },
  ],
  o3: [
    { limit: 604.0, category: 'Hazardous' },
    { limit: 504.0, category: 'VeryUnhealthy' },
    { limit: 404.0, category: 'Unhealthy' },
    { limit: 204.0, category: 'UnhealthyForSensitiveGroups' },
    { limit: 154.0, category: 'ModerateAir' },
    { limit: 0.0, category: 'GoodAir' },
  ],
  co: [
    { limit: 50.4, category: 'Hazardous' },
    { limit: 40.4, category: 'VeryUnhealthy' },
    { limit: 30.4, category: 'Unhealthy' },
    { limit: 10.4, category: 'UnhealthyForSensitiveGroups' },
    { limit: 4.4, category: 'ModerateAir' },
    { limit: 0.0, category: 'GoodAir' },
  ],
  so2: [
    { limit: 1004.0, category: 'Hazardous' },
    { limit: 804.0, category: 'VeryUnhealthy' },
    { limit: 604.0, category: 'Unhealthy' },
    { limit: 304.0, category: 'UnhealthyForSensitiveGroups' },
    { limit: 185.0, category: 'ModerateAir' },
    { limit: 0.0, category: 'GoodAir' },
  ],
};

// Define the mapping for categories to icons and colors
const categoryDetails = {
  GoodAir: {
    text: 'Air Quality is Good',
    icon: 'GoodAir',
    color: 'text-green-500',
  },
  ModerateAir: {
    text: 'Air Quality is Moderate',
    icon: 'Moderate',
    color: 'text-yellow-500',
  },
  UnhealthyForSensitiveGroups: {
    text: 'Air Quality is Unhealthy for Sensitive Groups',
    icon: 'UnhealthySG',
    color: 'text-orange-500',
  },
  Unhealthy: {
    text: 'Air Quality is Unhealthy',
    icon: 'Unhealthy',
    color: 'text-red-500',
  },
  VeryUnhealthy: {
    text: 'Air Quality is Very Unhealthy',
    icon: 'VeryUnhealthy',
    color: 'text-purple-500',
  },
  Hazardous: {
    text: 'Air Quality is Hazardous',
    icon: 'Hazardous',
    color: 'text-gray-500',
  },
  Invalid: {
    text: 'Invalid Air Quality Data',
    icon: null,
    color: 'text-gray-300',
  },
};

export { pollutantRanges, categoryDetails };
