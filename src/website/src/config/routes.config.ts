export type Route = {
  path: string;
  label: string;
  isProtected?: boolean;
};

export type RoutesConfig = {
  home: Route;
  products: {
    index: Route;
    monitor: Route;
    analytics: Route;
    calibrate: Route;
    mobile: Route;
    api: Route;
  };
  solutions: {
    index: Route;
    communities: Route;
    'african-cities': Route;
  };
  developers: {
    index: Route;
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
    index: { path: '/products', label: 'Products' },
    monitor: { path: '/products/monitor', label: 'Monitor' },
    analytics: { path: '/products/analytics', label: 'Analytics' },
    calibrate: { path: '/products/calibrate', label: 'Calibrate' },
    mobile: { path: '/products/mobile', label: 'Mobile' },
    api: { path: '/products/api', label: 'API' },
  },
  solutions: {
    index: { path: '/solutions', label: 'Solutions' },
    communities: { path: '/solutions/communities', label: 'Communities' },
    'african-cities': {
      path: '/solutions/african-cities',
      label: 'African Cities',
    },
  },
  developers: {
    index: { path: '/developers', label: 'Developers' },
    packages: { path: '/developers/packages', label: 'Packages' },
    'airqo-devcon': { path: '/developers/airqo-devcon', label: 'AirQo DevCon' },
  },
  company: {
    about: { path: '/about', label: 'About' },
    careers: { path: '/careers', label: 'Careers' },
    press: { path: '/press', label: 'Press' },
    contact: { path: '/contact', label: 'Contact' },
    partners: { path: '/partners', label: 'Partners' },
  },
  legal: {
    terms: { path: '/legal/terms', label: 'Terms of Service' },
    privacy: { path: '/legal/privacy', label: 'Privacy Policy' },
  },
  blogs: {
    index: { path: '/blogs', label: 'Blogs' },
  },
  faqs: { path: '/faqs', label: 'FAQs' },
};

export default routesConfig;
