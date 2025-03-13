import type { Metadata } from 'next';

import ApiPage from '@/views/products/ApiPage';

export const metadata: Metadata = {
  title: 'Air Quality Data API',
  description:
    "Access real-time and historical air quality data across African cities through AirQo's comprehensive API. Integrate accurate pollution measurements into your applications, research, or services.",
  keywords:
    'air quality API, pollution data API, environmental data access, AirQo API, air quality integration, African air data, real-time pollution API',
  alternates: {
    canonical: 'https://airqo.net/products/api',
  },
  openGraph: {
    title: 'Air Quality Data API | AirQo Products',
    description:
      "Access real-time and historical air quality data across African cities through AirQo's comprehensive API.",
    url: 'https://airqo.net/products/api',
  },
};

const page = () => {
  return (
    <div>
      <ApiPage />
    </div>
  );
};

export default page;
