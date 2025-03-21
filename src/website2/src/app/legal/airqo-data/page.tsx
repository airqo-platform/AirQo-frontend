import type { Metadata } from 'next';

import AirQoDataPage from '@/views/legal/AirQoDataPage';

export const metadata: Metadata = {
  title: 'Data Usage Policy',
  description:
    "Learn about AirQo's data collection, usage, sharing, and retention policies. Understand how we handle air quality data and ensure data integrity and transparency.",
  keywords:
    'AirQo data policy, air quality data usage, data collection policy, data sharing terms, data retention policy, environmental data handling',
  alternates: {
    canonical: 'https://airqo.net/legal/airqo-data',
  },
  openGraph: {
    title: 'AirQo Data Usage Policy',
    description:
      'Understand how AirQo collects, uses, and shares air quality data while ensuring transparency and integrity.',
  },
};

const page = () => {
  return (
    <div>
      <AirQoDataPage />
    </div>
  );
};

export default page;
