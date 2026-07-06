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
  defaultTitle: 'AirQo - Air Quality Monitoring and Analytics',
  defaultDescription:
    'AirQo provides air quality monitoring, analytics, and solutions for cleaner air across African cities.',
  siteName: 'AirQo',
  locale: 'en_US',
  type: 'website',
  twitterHandle: '@AirQoorg',
  ogType: 'website',
};

export default seoConfig;
