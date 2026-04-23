export type FooterLink = {
  label: string;
  href: string;
  openInNewTab?: boolean;
};

export type FooterLinkGroup = {
  title: string;
  links: FooterLink[];
};

export type FooterDocument = {
  title: string;
  description: string;
  href: string;
};

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    title: 'Products',
    links: [
      { label: 'Binos Monitor', href: '/products/monitor' },
      { label: 'Analytics Dashboard', href: '/products/analytics' },
      { label: 'Air Quality API', href: '/products/api' },
      { label: 'Mobile App', href: '/products/mobile-app' },
      { label: 'AirQalibrate', href: '/products/calibrate' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'For African Cities', href: '/solutions/african-cities' },
      { label: 'For Communities', href: '/solutions/communities' },
      { label: 'For Research', href: '/solutions/research' },
      {
        label: 'Network Coverage',
        href: '/solutions/network-coverage',
        openInNewTab: true,
      },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'About AirQo', href: '/about-us' },
      { label: 'Resources', href: '/resources' },
      { label: 'Events', href: '/events' },
      { label: 'FAQs', href: '/faqs' },
      { label: 'Africa Clean Air Forum', href: '/africa-clean-air-forum' },
      { label: 'Press', href: '/press' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Blog', href: 'https://blog.airqo.net/', openInNewTab: true },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Packages', href: '/packages' },
      {
        label: 'Documentation',
        href: 'https://docs.airqo.net/airqo-rest-api-documentation/',
        openInNewTab: true,
      },
      {
        label: 'GitHub',
        href: 'https://github.com/airqo-platform',
        openInNewTab: true,
      },
    ],
  },
];

export const footerDocuments: FooterDocument[] = [
  {
    title: 'Researchers Guide',
    description: 'How researchers and partners can work with AirQo data.',
    href: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1776942291/website/docs/v1.0.3_-_AirQo_Researchers_Guide_jkmvkm.pdf',
  },
  {
    title: 'Air Quality Data Access Guide',
    description: 'How to request, access, and use AirQo air quality data.',
    href: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1776942291/website/docs/AirQo_Air_Quality_Data_Access_Guide_faswo5.pdf',
  },
  {
    title: 'Fair Usage Policy',
    description: 'Responsible, open, and sustainable use of AirQo data.',
    href: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1776942291/website/docs/AirQo_Fair_Usage_Policy_ox4o6b.pdf',
  },
];
