import type { Metadata } from 'next';

import CommunitiesPage from '@/views/solutions/communities/CommunityPage';

export const metadata: Metadata = {
  title: 'Community Air Quality Solutions | Empowering Local Action',
  description:
    "Empower your community with AirQo's grassroots air quality monitoring solutions. We combine local engagement, education, and practical tools to help communities understand and improve their air quality.",
  keywords:
    'community air quality, local air monitoring, community environmental solutions, grassroots air quality, community pollution awareness, local air quality management, community engagement air quality, citizen science air pollution',
  alternates: {
    canonical: 'https://airqo.net/solutions/communities',
  },
  openGraph: {
    type: 'website',
    title: 'Community Air Quality Solutions | AirQo',
    description:
      "Empower your community with AirQo's grassroots air quality monitoring solutions combining local engagement and practical tools.",
    url: 'https://airqo.net/solutions/communities',
    images: [
      {
        url: 'https://airqo.net/icon.png',
        width: 1200,
        height: 630,
        alt: 'AirQo Community Solutions',
      },
    ],
    siteName: 'AirQo',
  },
};

const page = () => {
  return (
    <div>
      <CommunitiesPage />
    </div>
  );
};

export default page;
