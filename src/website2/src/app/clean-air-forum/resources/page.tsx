import { Metadata } from 'next';

import ResourcesPage from '@/views/cleanairforum/resources/ResourcesPage';

export const metadata: Metadata = {
  title: 'Conference Resources & Materials',
  description:
    'Access presentations, papers, and materials from the Clean Air Forum. Download resources about air quality monitoring, research findings, and environmental solutions.',
  keywords:
    'Clean Air Forum resources, conference materials, presentation downloads, air quality research, environmental papers, forum documents',
  alternates: {
    canonical: 'https://airqo.net/clean-air-forum/resources',
  },
  openGraph: {
    title: 'Conference Resources & Materials | Clean Air Forum 2024',
    description:
      "Download presentations and materials from Africa's premier air quality conference.",
  },
};

const Page = () => {
  return <ResourcesPage />;
};

export default Page;
