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
    { limit: 500.5, category: 'Invalid' },
    { limit: 225.5, category: 'Hazardous' },
    { limit: 125.5, category: 'VeryUnhealthy' },
    { limit: 55.5, category: 'Unhealthy' },
    { limit: 35.5, category: 'UnhealthyForSensitiveGroups' },
    { limit: 9.1, category: 'ModerateAir' },
    { limit: 0.0, category: 'GoodAir' },
  ],
  pm10: [
    { limit: 604.1, category: 'Invalid' },
    { limit: 424.1, category: 'Hazardous' },
    { limit: 354.1, category: 'VeryUnhealthy' },
    { limit: 254.1, category: 'Unhealthy' },
    { limit: 154.1, category: 'UnhealthyForSensitiveGroups' },
    { limit: 54.1, category: 'ModerateAir' },
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
