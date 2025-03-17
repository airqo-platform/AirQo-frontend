import type { Metadata } from 'next';

import AfricanCityPage from '@/views/solutions/AfricanCities/AfricanCityPage';

export const metadata: Metadata = {
  title: 'Urban Air Quality Solutions for African Cities',
  description:
    'Comprehensive air quality monitoring and management solutions designed specifically for African cities. From data collection to policy implementation, we help cities combat air pollution effectively.',
  keywords:
    'urban air quality, city air monitoring, African cities pollution, urban environmental solutions, city air quality management, municipal air quality, urban pollution control',
  alternates: {
    canonical: 'https://airqo.net/solutions/african-cities',
  },
  openGraph: {
    title: 'Urban Air Quality Solutions for African Cities | AirQo',
    description:
      'Comprehensive air quality monitoring and management solutions for African cities.',
    url: 'https://airqo.net/solutions/african-cities',
  },
};

const page = () => {
  return (
    <div>
      <AfricanCityPage />
    </div>
  );
};

export default page;
