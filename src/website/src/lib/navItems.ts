export type NavMenuItem = {
  title: string;
  description?: string;
  href: string;
  newTab?: boolean;
};

export type NavMenuSection = Record<string, NavMenuItem[]>;

export const NAV_ITEMS: NavMenuSection = {
  Products: [
    {
      title: 'Binos Monitor',
      description: 'Built in Africa for African cities',
      href: '/products/monitor',
    },
    {
      title: 'Analytics Dashboard',
      description: 'Air quality analytics for African cities',
      href: '/products/analytics',
    },
    {
      title: 'Mobile App',
      description: 'Discover the quality of air around you',
      href: '/products/mobile-app',
    },
    {
      title: 'Air Quality API',
      description: 'Access raw and calibrated data',
      href: '/products/api',
    },
    {
      title: 'AirQalibrate',
      description: 'Calibrate your low-cost sensor data',
      href: '/products/calibrate',
    },
  ],
  Solutions: [
    {
      title: 'For African Cities',
      description: 'Advancing air quality management in African Cities',
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
      title: 'Kampala Air Quality Study',
      description: 'Join our real-time air pollution research study',
      href: '/solutions/kampala-study',
    },
    {
      title: 'Network Coverage',
      description:
        'Explore air quality monitoring infrastructure across Africa',
      href: '/solutions/network-coverage',
      newTab: true,
    },
  ],
  About: [
    { title: 'About Us', href: '/about-us' },
    { title: 'Resources', href: '/resources' },
    { title: 'Careers', href: '/careers' },
    { title: 'Contact Us', href: '/contact' },
    { title: 'Events', href: '/events' },
    { title: 'Press', href: '/press' },
    { title: 'FAQs', href: '/faqs' },
    { title: 'Africa Clean Air Forum', href: '/africa-clean-air-forum' },
  ],
  Developers: [
    {
      title: 'Packages',
      description: 'Open source libraries and developer tools',
      href: '/packages',
    },
    {
      title: 'Documentation',
      description: 'API guides and technical resources',
      href: 'https://docs.airqo.net/airqo-rest-api-documentation/',
      newTab: true,
    },
    {
      title: 'GitHub',
      description: 'Explore our open source projects',
      href: 'https://github.com/airqo-platform',
      newTab: true,
    },
  ],
};

export default NAV_ITEMS;
