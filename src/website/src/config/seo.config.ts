export type SeoConfig = {
  titleTemplate: string;
  defaultTitle: string;
  defaultDescription: string;
  siteName: string;
  locale: string;
  type: string;
  twitterHandle: string;
  ogType: string;
};

const seoConfig: SeoConfig = {
  titleTemplate: '%s | AirQo',
  defaultTitle: 'AirQo | Air quality data and research across Africa',
  defaultDescription:
    'AirQo works with African communities to measure air quality and share data for research, public awareness, and action.',
  siteName: 'AirQo',
  locale: 'en_US',
  type: 'website',
  twitterHandle: '@AirQoProject',
  ogType: 'website',
};

export default seoConfig;
