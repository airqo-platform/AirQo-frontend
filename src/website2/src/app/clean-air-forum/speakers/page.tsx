import { Metadata } from 'next';

import SpeakersPage from '@/views/cleanAirForum/speakers/SpeakersPage';

export const metadata: Metadata = {
  title: 'Speakers | Clean Air Forum | AirQo',
  description:
    'Meet the distinguished speakers at Clean Air Forum. Learn from industry leaders and experts who are driving change in air quality and environmental management.',
};

const Page = () => {
  return <SpeakersPage />;
};

export default Page;
