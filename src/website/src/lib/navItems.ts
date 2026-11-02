import { API_CONSOLE_URL } from '@/config/console.config';

export type NavMenuItem = {
  title: string;
  description?: string;
  href: string;
  newTab?: boolean;
};

export type NavMenuSection = Record<string, NavMenuItem[]>;

export const AFRICA_CLEAN_AIR_FORUM_URL =
  'https://cleanairafrica.org/about-the-annual-forum/';

export const NAV_ITEMS: NavMenuSection = {
  Products: [
    {
      title: 'Binos Monitor',
      description: 'Locally built air quality monitoring hardware',
      href: '/products/monitor',
    },
    {
      title: 'AirQo Beacon',
      description: 'Monitor device health and network performance',
      href: '/products/beacon',
    },
    {
      title: 'AirQalibrate',
      description: 'Calibrate low-cost sensor data',
      href: '/products/calibrate',
    },
    {
      title: 'AirQo Nexus',
      description: 'Real-time air quality data for African cities',
      href: '/products/nexus',
    },
    {
      title: 'AirQo Vertex',
      description: 'Open air quality data sharing platform',
      href: '/products/vertex',
    },
    {
      title: 'AirQo AI Platform',
      description: 'Forecast, locate, categorize, and automate reporting',
      href: '/products/ai-platform',
    },
    {
      title: 'AirQo Mobile App',
      description: 'Discover the quality of air around you',
      href: '/products/mobile-app',
    },
    {
      title: 'Air Quality API',
      description: 'Access raw and calibrated data',
      href: '/products/api',
    },
  ],
  Solutions: [
    {
      title: 'For African Cities',
      description: 'Advancing air quality management in African cities',
      href: '/solutions/african-cities',
    },
    {
      title: 'For Communities',
      description: 'Empowering communities with air quality information',
      href: '/solutions/communities',
    },
    {
      title: 'For Research',
      description: 'Advancing knowledge and evidence on air quality issues',
      href: '/solutions/research',
    },
    {
      title: 'Network Coverage',
      description:
        'Explore air quality monitoring infrastructure across Africa',
      href: '/solutions/network-coverage',
    },
  ],
  Developers: [
    {
      title: 'API documentation',
      description: 'Build with AirQo air quality data',
      href: 'https://platform.airqo.net/docs/api/intro/',
      newTab: true,
    },
    {
      title: 'API Console',
      description: 'Manage clients, tokens, usage, and plans',
      href: API_CONSOLE_URL,
      newTab: true,
    },
    {
      title: 'Packages & SDKs',
      description: 'Open-source libraries and developer tools',
      href: '/packages',
    },
    {
      title: 'GitHub',
      description: 'Explore AirQo open-source projects',
      href: 'https://github.com/airqo-platform',
      newTab: true,
    },
    {
      title: 'Developer events',
      description: 'Join AirQo DevCon and technical events',
      href: '/developers/airqo-devcon',
    },
  ],
  Resources: [
    {
      title: 'Technical documentation',
      description: 'Specifications and implementation material',
      href: '/resources?tab=technical',
    },
    {
      title: 'Research & publications',
      description: 'Evidence and findings from AirQo',
      href: '/resources?tab=research',
    },
    {
      title: 'Guides & manuals',
      description: 'Practical guidance for AirQo tools and hardware',
      href: '/resources?tab=guide,manual',
    },
    {
      title: 'Policy documents',
      description: 'Policy briefs and air quality management resources',
      href: '/resources?tab=policy',
    },
    {
      title: 'Data access & usage',
      description: 'Guidance for researchers and data users',
      href: 'https://platform.airqo.net/docs/data-access/researchers-guide/',
      newTab: true,
    },
    {
      title: 'Blog & insights',
      description: 'News, perspectives, and stories from AirQo',
      href: 'https://blog.airqo.net/',
      newTab: true,
    },
    {
      title: 'Events & programmes',
      description: 'Studies, forums, and clean-air initiatives',
      href: '/events',
    },
    {
      title: 'Help & FAQs',
      description: 'Answers to common questions about AirQo',
      href: '/faqs',
    },
  ],
  'About AirQo': [
    { title: 'About AirQo', href: '/about-us' },
    { title: 'Partners', href: '/partners' },
    { title: 'Press & media', href: '/press' },
    { title: 'Careers', href: '/careers' },
    { title: 'Contact Us', href: '/contact' },
    {
      title: 'Africa Clean Air Forum',
      description: 'Learn about the Africa Clean Air Network annual forum',
      href: AFRICA_CLEAN_AIR_FORUM_URL,
      newTab: true,
    },
  ],
};

export default NAV_ITEMS;
