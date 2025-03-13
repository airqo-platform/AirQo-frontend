import type { Metadata } from 'next';

import CommunitiesPage from '@/views/solutions/communities/CommunityPage';

export const metadata: Metadata = {
  title: 'Community Air Quality Solutions',
  description:
    "Empower your community with AirQo's grassroots air quality monitoring solutions. Our community-focused approach combines local engagement, education, and practical tools for air quality improvement.",
  keywords:
    'community air quality, local air monitoring, community environmental solutions, grassroots air quality, community pollution control, local air quality management, community engagement',
  alternates: {
    canonical: 'https://airqo.net/solutions/communities',
  },
  openGraph: {
    title: 'Community Air Quality Solutions | AirQo',
    description:
      'Empower your community with grassroots air quality monitoring solutions from AirQo.',
    url: 'https://airqo.net/solutions/communities',
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
