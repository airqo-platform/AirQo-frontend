import type { Metadata } from 'next';

import ResearchPage from '@/views/solutions/research/ResearchPage';

export const metadata: Metadata = {
  title: 'Air Quality Research and Innovation',
  description:
    "Access AirQo's cutting-edge research and innovations in air quality monitoring for Africa. Our scientific approach combines local expertise with global best practices to develop effective solutions.",
  keywords:
    'air quality research, environmental research Africa, pollution research, air quality innovation, scientific air monitoring, research partnerships, African air quality studies',
  alternates: {
    canonical: 'https://airqo.net/solutions/research',
  },
  openGraph: {
    title: 'Air Quality Research and Innovation | AirQo',
    description:
      'Cutting-edge research and innovations in air quality monitoring for Africa by AirQo.',
    url: 'https://airqo.net/solutions/research',
  },
};
const page = () => {
  return (
    <div>
      <ResearchPage />
    </div>
  );
};

export default page;
