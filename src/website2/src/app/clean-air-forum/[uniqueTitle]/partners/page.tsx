import { Metadata } from 'next';

import PartnersPage from '@/views/cleanairforum/partners/PartnersPage';

export const metadata: Metadata = {
  title: 'Partners & Collaborators',
  description:
    'Meet the organizations, institutions, and partners collaborating with AirQo to make the Clean Air Forum possible. Discover our shared commitment to improving air quality in Africa.',
  keywords:
    'Clean Air Forum partners, conference collaborators, air quality partnerships, environmental collaborations, forum sponsors, AirQo partners',
  alternates: {
    canonical: 'https://airqo.net/clean-air-forum/partners',
  },
  openGraph: {
    title: 'Partners & Collaborators | Clean Air Forum 2024',
    description:
      'Organizations and institutions partnering with AirQo to advance air quality monitoring in Africa.',
  },
};

const Page = () => {
  return <PartnersPage />;
};

export default Page;
