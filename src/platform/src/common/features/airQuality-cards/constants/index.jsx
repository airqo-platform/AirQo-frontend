import {
  AqGood,
  AqModerate,
  AqUnhealthyForSensitiveGroups,
  AqVeryUnhealthy,
  AqUnhealthy,
  AqHazardous,
  AqNoValue,
  AqTrendDown01,
  AqTrendUp01,
  AqWind01,
} from '@airqo/icons-react';

export const IconMap = {
  good: AqGood,
  moderate: AqModerate,
  'unhealthy-sensitive': AqUnhealthyForSensitiveGroups,
  unhealthy: AqUnhealthy,
  'very-unhealthy': AqVeryUnhealthy,
  hazardous: AqHazardous,
  unknown: AqNoValue,
  wind: AqWind01,
  trend1: AqTrendDown01,
  trend2: AqTrendUp01,
};

export const AQI_CATEGORY_MAP = {
  Good: 'good',
  Moderate: 'moderate',
  'Unhealthy for Sensitive Groups': 'unhealthy-sensitive',
  Unhealthy: 'unhealthy',
  'Very Unhealthy': 'very-unhealthy',
  Hazardous: 'hazardous',
  Unknown: 'unknown',
};

export const MAX_CARDS = 4;

export const generateTrendData = (averages) => {
  if (!averages?.percentageDifference) return null;

  const percentageDifference = Math.abs(averages.percentageDifference);
  const isIncreasing = averages.percentageDifference > 0;

  const trendTooltip = isIncreasing
    ? `The air quality has increased by ${percentageDifference}% compared to the previous week, indicating deteriorating air quality.`
    : averages.percentageDifference < 0
      ? `The air quality has decreased by ${percentageDifference}% compared to the previous week, indicating improving air quality.`
      : 'No significant change in air quality compared to the previous week.';

  return {
    trendIcon: isIncreasing ? 'trend2' : 'trend1',
    trendColor: isIncreasing
      ? 'text-red-700 bg-red-100'
      : 'text-green-700 bg-green-100',
    trendText: `${percentageDifference}%`,
    trendTooltip,
    isIncreasing,
  };
};
