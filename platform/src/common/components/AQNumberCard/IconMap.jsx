import GoodAir from '@/icons/Charts/GoodAir';
import Hazardous from '@/icons/Charts/Hazardous';
import Moderate from '@/icons/Charts/Moderate';
import Unhealthy from '@/icons/Charts/Unhealthy';
import UnhealthySG from '@/icons/Charts/UnhealthySG';
import VeryUnhealthy from '@/icons/Charts/VeryUnhealthy';
import UnknownAQ from '@/icons/Charts/Invalid';
import WindIcon from '@/icons/Common/wind.svg';
import TrendDownIcon from '@/icons/Analytics/trendDownIcon';

export const IconMap = {
  good: GoodAir,
  moderate: Moderate,
  'unhealthy-sensitive': UnhealthySG,
  unhealthy: Unhealthy,
  'very-unhealthy': VeryUnhealthy,
  hazardous: Hazardous,
  unknown: UnknownAQ,
  wind: WindIcon,
  trend: TrendDownIcon,
};
