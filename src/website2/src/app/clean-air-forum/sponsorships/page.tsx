import { Metadata } from 'next';

import SponsorshipPage from '../../../views/cleanAirForum/sponsorship/SponsorshipPage';

export const metadata: Metadata = {
  title: 'Sponsorship | Clean Air Forum | AirQo',
  description:
    'Discover sponsorship opportunities for Clean Air Forum. Learn about tailored sponsorship packages designed to support innovation and community engagement in air quality management.',
};

const Page = () => {
  return <SponsorshipPage />;
};

export default Page;
