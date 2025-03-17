import { Metadata } from 'next';

import ResourcePage from '@/views/cleanAirNetwork/resources/ResourcePage';

export const metadata: Metadata = {
  title: 'Network Resources & Tools',
  description:
    'Access exclusive Clean Air Network resources, tools, and materials for air quality improvement. Find guides, research, best practices, and collaborative resources for network members.',
  keywords:
    'Clean Air Network resources, air quality tools, environmental resources, network materials, air quality guides, environmental best practices, member resources',
  alternates: {
    canonical: 'https://airqo.net/clean-air-network/resources',
  },
  openGraph: {
    title: 'Network Resources & Tools | Clean Air Network',
    description:
      'Access exclusive resources and tools for improving air quality across Africa. Available to network members.',
  },
};

const Page = () => {
  return (
    <div>
      <ResourcePage />
    </div>
  );
};

export default Page;
