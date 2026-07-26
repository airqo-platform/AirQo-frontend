export type EnvConfig = {
  apiUrl: string;
  apiToken: string;
  mapboxAccessToken: string;
  gaMeasurementId: string;
  opencageApiKey: string;
  isDev: boolean;
  isProd: boolean;
};

const envConfig: EnvConfig = {
  apiUrl: process.env.API_URL || '',
  apiToken: process.env.API_TOKEN || '',
  mapboxAccessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  opencageApiKey: process.env.OPENCAGE_API_KEY || '',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
};

export default envConfig;
