import { pollutantRanges, categoryDetails } from '../constants';
// Export categoryDetails for use in tooltips and other components
export { categoryDetails };

// helper: returns the category key (e.g. "GoodAir") for a given value & pollutant
export const getAQICategoryKey = (value, pollutant = 'pm2_5') => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'Invalid';

  const ranges = pollutantRanges[pollutant];
  if (!ranges) return 'Invalid';

  for (const { limit, category } of ranges) {
    if (value >= limit) return category;
  }
  return 'Invalid';
};
