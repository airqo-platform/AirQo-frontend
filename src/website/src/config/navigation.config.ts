export type NavItem = {
  label: string;
  href: string;
  isExternal?: boolean;
};

export type NavigationConfig = {
  mainNav: NavItem[];
  footerNav: {
    products: NavItem[];
    solutions: NavItem[];
    developers: NavItem[];
    company: NavItem[];
  };
};

const navigationConfig: NavigationConfig = {
  mainNav: [
    { label: 'Products', href: '/explore-data' },
    { label: 'Solutions', href: '/solutions/african-cities' },
    {
      label: 'Developers',
      href: 'https://platform.airqo.net/docs/api/intro/',
      isExternal: true,
    },
    { label: 'About', href: '/about-us' },
    { label: 'Blogs', href: 'https://blog.airqo.net/', isExternal: true },
    { label: 'FAQs', href: '/faqs' },
  ],
  footerNav: {
    products: [
      { label: 'Monitor', href: '/products/monitor' },
      { label: 'AirQo Nexus', href: '/products/nexus' },
      { label: 'Calibrate', href: '/products/calibrate' },
      { label: 'Mobile', href: '/products/mobile-app' },
      { label: 'API', href: '/products/api' },
    ],
    solutions: [
      { label: 'Communities', href: '/solutions/communities' },
      { label: 'African Cities', href: '/solutions/african-cities' },
    ],
    developers: [
      { label: 'Packages', href: '/packages' },
      { label: 'DevCon', href: '/developers/airqo-devcon' },
    ],
    company: [
      { label: 'About', href: '/about-us' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Contact', href: '/contact' },
      { label: 'Partners', href: '/about-us#partners' },
    ],
  },
};

export default navigationConfig;
