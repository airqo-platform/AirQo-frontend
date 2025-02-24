import { Metadata } from 'next';

import ResourcePage from '@/views/publications/ResourcePage';

export const metadata: Metadata = {
  title: 'Resources | Air Quality Data and Tools by AirQo',
  description:
    'Access AirQo’s air quality data, research, and tools to help monitor and improve environmental health in Africa. Explore our datasets and resources.',
  keywords:
    'AirQo resources, air quality data, environmental data, air pollution, AirQo tools, air quality research, air quality reports',
};

const page = () => {
  return (
    <div>
      <ResourcePage />
    </div>
  );
};

export default page;
