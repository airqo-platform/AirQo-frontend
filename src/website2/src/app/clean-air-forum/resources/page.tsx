import { Metadata } from 'next';

import ResourcesPage from '@/views/cleanairforum/resources/ResourcesPage';

export const metadata: Metadata = {
  title: 'Resources | Clean Air Forum | AirQo',
  description:
    'Access comprehensive resources, presentations, and documents from Clean Air Forum to stay informed about the latest trends and innovations in air quality management.',
};

const Page = () => {
  return <ResourcesPage />;
};

export default Page;
