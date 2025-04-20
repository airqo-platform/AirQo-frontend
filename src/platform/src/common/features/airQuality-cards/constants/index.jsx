import GoodAir from '@/icons/Charts/GoodAir';
import Hazardous from '@/icons/Charts/Hazardous';
import Moderate from '@/icons/Charts/Moderate';
import Unhealthy from '@/icons/Charts/Unhealthy';
import UnhealthySG from '@/icons/Charts/UnhealthySG';
import VeryUnhealthy from '@/icons/Charts/VeryUnhealthy';
import UnknownAQ from '@/icons/Charts/Invalid';
import WindIcon from '@/icons/Common/wind.svg';
import TrendDownIcon from '@/icons/Analytics/trendDownIcon';
import TrendUpIcon from '@/icons/Analytics/trendUpIcon';

export const IconMap = {
  good: GoodAir,
  moderate: Moderate,
  'unhealthy-sensitive': UnhealthySG,
  unhealthy: Unhealthy,
  'very-unhealthy': VeryUnhealthy,
  hazardous: Hazardous,
  unknown: UnknownAQ,
  wind: WindIcon,
  trend1: TrendDownIcon,
  trend2: TrendUpIcon,
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
