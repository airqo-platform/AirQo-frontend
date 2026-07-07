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
    { label: 'Products', href: '/products' },
    { label: 'Solutions', href: '/solutions' },
    { label: 'Developers', href: '/developers' },
    { label: 'About', href: '/about' },
    { label: 'Blogs', href: '/blogs' },
    { label: 'FAQs', href: '/faqs' },
  ],
  footerNav: {
    products: [
      { label: 'Monitor', href: '/products/monitor' },
      { label: 'AirQo Nexus', href: '/products/analytics' },
      { label: 'Calibrate', href: '/products/calibrate' },
      { label: 'Mobile', href: '/products/mobile' },
      { label: 'API', href: '/products/api' },
    ],
    solutions: [
      { label: 'Communities', href: '/solutions/communities' },
      { label: 'African Cities', href: '/solutions/african-cities' },
    ],
    developers: [
      { label: 'Packages', href: '/developers/packages' },
      { label: 'DevCon', href: '/developers/airqo-devcon' },
    ],
    company: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Contact', href: '/contact' },
      { label: 'Partners', href: '/partners' },
    ],
  },
};

export default navigationConfig;
