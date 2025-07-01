import type { Metadata } from 'next';

import AfricanCityPage from '@/views/solutions/AfricanCities/AfricanCityPage';

export const metadata: Metadata = {
  title: 'Air Quality Solutions for African Cities | Clean Air Management',
  description:
    'Comprehensive air quality monitoring and management solutions designed specifically for African cities. AirQo helps municipal governments understand and tackle air pollution through hyperlocal data and policy engagement.',
  keywords:
    'African cities air quality, urban air monitoring, city pollution solutions, municipal air quality management, urban environmental solutions, city air quality policy, African urban pollution control, smart city air monitoring',
  alternates: {
    canonical: 'https://airqo.net/solutions/african-cities',
  },
  openGraph: {
    type: 'website',
    title: 'Air Quality Solutions for African Cities | AirQo',
    description:
      'Comprehensive air quality monitoring and management solutions designed specifically for African cities. Help your city understand and tackle air pollution.',
    url: 'https://airqo.net/solutions/african-cities',
    images: [
      {
        url: 'https://airqo.net/icon.png',
        width: 1200,
        height: 630,
        alt: 'AirQo Solutions for African Cities',
      },
    ],
    siteName: 'AirQo',
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
