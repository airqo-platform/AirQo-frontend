import { API_CONSOLE_URL } from '@/config/console.config';
import {
  PRODUCT_FAMILIES,
  type ProductFamily,
  type ProductFamilyLabel,
  PRODUCTS,
} from '@/config/products.config';

export type { ProductFamily, ProductFamilyLabel };

export type NavMenuItem = {
  title: string;
  description?: string;
  href: string;
  newTab?: boolean;
  group?: ProductFamilyLabel;
};

export type NavMenuSection = Record<string, NavMenuItem[]>;

export const AFRICA_CLEAN_AIR_FORUM_URL =
  'https://cleanairafrica.org/about-the-annual-forum/';

const familyLabelById: Record<ProductFamily, ProductFamilyLabel> =
  PRODUCT_FAMILIES.reduce(
    (labels, family) => {
      labels[family.id] = family.label;
      return labels;
    },
    {} as Record<ProductFamily, ProductFamilyLabel>,
  );

const productNavItems: NavMenuItem[] = PRODUCTS.map((product) => ({
  title: product.name,
  description: product.tagline,
  href: product.href,
  group: familyLabelById[product.family],
}));

export const NAV_ITEMS: NavMenuSection = {
  Products: productNavItems,
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
      title: 'Air Quality API data access',
      description: 'Guidance on finding and using AirQo air quality data',
      href: 'https://platform.airqo.net/docs/api/intro/',
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
  About: [
    { title: 'About AirQo', href: '/about-us' },
    { title: 'Partners', href: '/about-us#partners' },
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

/**
 * Hub destination for each primary navigation section. Used by the navbar
 * dropdowns and footer to give every section a clear "view all" target.
 */
export const NAV_MENU_LINKS = {
  Products: '/products',
  Solutions: '/solutions',
  Developers: '/packages',
  Resources: '/resources',
  About: '/about-us',
} as const;

export default NAV_ITEMS;
