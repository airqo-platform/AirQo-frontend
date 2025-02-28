import { Metadata } from 'next';

import PartnersPage from '../../../views/cleanAirForum/partners/PartnersPage';

export const metadata: Metadata = {
  title: 'Partners | Clean Air Forum | AirQo',
  description:
    'Discover the partners collaborating with Clean Air Forum to advance clean air solutions and improve air quality through innovation and community engagement.',
};

const Page = () => {
  return <PartnersPage />;
};

export default Page;
