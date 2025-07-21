import type { Metadata } from 'next';

import ResearchPage from '@/views/solutions/research/ResearchPage';

export const metadata: Metadata = {
  title: 'Air Quality Research Solutions | Scientific Innovation for Africa',
  description:
    "Access AirQo's cutting-edge research and data solutions for air quality studies across Africa. We provide scientific-grade data, research partnerships, and innovative methodologies for environmental research.",
  keywords:
    'air quality research, environmental research Africa, pollution research data, air quality innovation, scientific air monitoring, research partnerships, African air quality studies, environmental data research, academic air quality collaboration',
  alternates: {
    canonical: 'https://airqo.net/solutions/research',
  },
  openGraph: {
    type: 'website',
    title: 'Air Quality Research Solutions | AirQo',
    description:
      'Access cutting-edge research and data solutions for air quality studies across Africa. Scientific-grade data and research partnerships.',
    url: 'https://airqo.net/solutions/research',
    images: [
      {
        url: 'https://airqo.net/icon.png',
        width: 1200,
        height: 630,
        alt: 'AirQo Research Solutions',
      },
    ],
    siteName: 'AirQo',
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
