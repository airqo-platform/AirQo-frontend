import { Metadata } from 'next';

import ResourcePage from '@/views/cleanAirNetwork/resources/ResourcePage';

export const metadata: Metadata = {
  title: 'Resources | Clean Air Network | AirQo',
  description:
    'Access a wide range of resources and insights on air quality management from Clean Air Network. Explore reports, case studies, and research to stay ahead in clean air initiatives.',
};

const Page = () => {
  return (
    <div>
      <ResourcePage />
    </div>
  );
};

export default Page;
