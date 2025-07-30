import { Metadata } from 'next';

import ExplorePage from '@/views/ExplorePage';

export const metadata: Metadata = {
  title: 'Explore Air Quality Data | AirQo Analytics Platform',
  description:
    "Explore real-time and historical air quality data across Africa through AirQo's interactive analytics platform. Access hyperlocal pollution insights, trends, and forecasts for African cities.",
  keywords:
    'air quality data explorer, African air quality analytics, real-time pollution data, historical air quality trends, air quality dashboard Africa, PM2.5 data Africa, air pollution insights, environmental data visualization',
  alternates: {
    canonical: 'https://airqo.net/explore-data',
  },
  openGraph: {
    type: 'website',
    url: 'https://airqo.net/explore-data',
    title: 'Explore Air Quality Data | AirQo Analytics Platform',
    description:
      "Explore real-time and historical air quality data across Africa through AirQo's interactive analytics platform.",
    images: [
      {
        url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132441/website/photos/OurProducts/Analytics/analytics-dashboard_qijm7k.webp',
        width: 1200,
        height: 630,
        alt: 'AirQo Air Quality Data Explorer',
      },
    ],
    siteName: 'AirQo',
  },
};

const page = () => {
  return (
    <div>
      <ExplorePage />
    </div>
  );
};

export default page;
