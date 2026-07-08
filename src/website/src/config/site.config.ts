export type SiteConfig = {
  templateName: string;
  homePageUrl: string;
  containerClass: string;
  name: string;
  title: string;
  description: string;
  url: string;
  ogImage: string;
};

const siteConfig: SiteConfig = {
  templateName: 'AirQo Website',
  homePageUrl: '/home',
  containerClass: 'max-w-5xl mx-auto w-full',
  name: 'AirQo',
  title: 'AirQo - Air Quality Monitoring and Analytics',
  description:
    'AirQo provides air quality monitoring, analytics, and solutions for cleaner air across African cities.',
  url: process.env.NEXT_PUBLIC_SITE_URL?.split(',')[0] || 'https://airqo.org',
  ogImage: '/og-image.png',
};

export default siteConfig;
