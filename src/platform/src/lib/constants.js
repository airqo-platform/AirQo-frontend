import {
  NEXT_PUBLIC_GRIDS,
  NEXT_PUBLIC_DEFAULT_CHART_SITES,
} from './envConstants';

export const GRIDS = NEXT_PUBLIC_GRIDS;
export const DEFAULT_CHART_SITES = NEXT_PUBLIC_DEFAULT_CHART_SITES;
export const TIME_OPTIONS = ['hourly', 'daily', 'weekly', 'monthly'];
export const POLLUTANT_OPTIONS = [
  { id: 'pm2_5', name: 'PM2.5' },
  { id: 'pm10', name: 'PM10' },
];
export const CHART_TYPE = [
  { id: 'bar', name: 'Bar' },
  { id: 'line', name: 'Line' },
];

// UI Labels
export const ORGANIZATION_LABEL = 'Organization';

export const AIRQO_GROUP_IDS = {
  production: '64f54e4621d9b90013925a08',
  staging: '653b00efb657380014328b54',
};

export const getAirqoGroupId = () => {
  return process.env.NODE_ENV === 'production' 
    ? AIRQO_GROUP_IDS.production 
    : AIRQO_GROUP_IDS.staging;
};
