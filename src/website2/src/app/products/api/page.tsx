import type { Metadata } from 'next';

import ApiPage from '@/views/products/ApiPage';

export const metadata: Metadata = {
  title: 'Air Quality Data API | Amplify Your Impact with Open Data',
  description:
    "Leverage AirQo's open air quality data through our comprehensive API. Access real-time and historical pollution measurements across African cities to build impactful applications and drive air quality solutions.",
  keywords:
    'air quality API, pollution data API, environmental data access, AirQo API, air quality integration, African air data, real-time pollution API, open air quality data, developer API',
  alternates: {
    canonical: 'https://airqo.net/products/api',
  },
  openGraph: {
    type: 'website',
    title: 'Air Quality Data API | AirQo Products',
    description:
      "Leverage AirQo's open air quality data through our comprehensive API. Access real-time and historical pollution measurements across African cities.",
    url: 'https://airqo.net/products/api',
    images: [
      {
        url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1729071534/website/photos/wrapper_zpnvdw.png',
        width: 1200,
        height: 630,
        alt: 'AirQo Air Quality API Interface',
      },
    ],
    siteName: 'AirQo',
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
