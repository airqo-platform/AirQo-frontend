import type { Metadata } from 'next';

import AnalyticsPage from '@/views/products/AnalyticsPage';

export const metadata: Metadata = {
  title: 'Air Quality Analytics Platform',
  description:
    "Transform raw air quality data into actionable insights with AirQo's advanced analytics platform. Visualize trends, identify pollution hotspots, and make data-driven decisions for cleaner air in African cities.",
  keywords:
    'air quality analytics, pollution data visualization, air quality trends, environmental data analysis, AirQo analytics platform, air pollution insights, African air quality data',
  alternates: {
    canonical: 'https://airqo.net/products/analytics',
  },
  openGraph: {
    title: 'Air Quality Analytics Platform | AirQo Products',
    description:
      "Transform raw air quality data into actionable insights with AirQo's advanced analytics platform.",
    url: 'https://airqo.net/products/analytics',
    images: [
      {
        url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132441/website/photos/OurProducts/Analytics/analytics-dashboard_qijm7k.webp',
        width: 1200,
        height: 630,
        alt: 'AirQo Analytics Platform Dashboard',
      },
    ],
  },
};

const page = () => {
  return (
    <div>
      <AnalyticsPage />
    </div>
  );
};

export default page;
