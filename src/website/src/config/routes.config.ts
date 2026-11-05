export type Route = {
  path: string;
  label: string;
  isProtected?: boolean;
};

export type RoutesConfig = {
  home: Route;
  products: {
    monitor: Route;
    nexus: Route;
    calibrate: Route;
    mobile: Route;
    api: Route;
  };
  solutions: {
    communities: Route;
    'african-cities': Route;
  };
  developers: {
    packages: Route;
    'airqo-devcon': Route;
  };
  company: {
    about: Route;
    careers: Route;
    press: Route;
    contact: Route;
    partners: Route;
  };
  legal: {
    terms: Route;
    privacy: Route;
  };
  blogs: {
    index: Route;
  };
  faqs: Route;
};

const routesConfig: RoutesConfig = {
  home: { path: '/home', label: 'Home' },
  products: {
    monitor: { path: '/products/monitor', label: 'Monitor' },
    nexus: { path: '/products/nexus', label: 'AirQo Nexus' },
    calibrate: { path: '/products/calibrate', label: 'Calibrate' },
    mobile: { path: '/products/mobile-app', label: 'Mobile' },
    api: { path: '/products/api', label: 'API' },
  },
  solutions: {
    communities: { path: '/solutions/communities', label: 'Communities' },
    'african-cities': {
      path: '/solutions/african-cities',
      label: 'African Cities',
    },
  },
  developers: {
    packages: { path: '/packages', label: 'Packages' },
    'airqo-devcon': { path: '/developers/airqo-devcon', label: 'AirQo DevCon' },
  },
  company: {
    about: { path: '/about-us', label: 'About' },
    careers: { path: '/careers', label: 'Careers' },
    press: { path: '/press', label: 'Press' },
    contact: { path: '/contact', label: 'Contact' },
    partners: { path: '/about-us#partners', label: 'Partners' },
  },
  legal: {
    terms: { path: '/legal/terms-of-service', label: 'Terms of Service' },
    privacy: { path: '/legal/privacy-policy', label: 'Privacy Policy' },
  },
  blogs: {
    index: { path: '/blogs', label: 'Blogs' },
  },
  faqs: { path: '/faqs', label: 'FAQs' },
};

export default routesConfig;
