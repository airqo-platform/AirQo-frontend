import type { Metadata } from 'next';

import AnalyticsPage from '@/views/products/AnalyticsPage';

export const metadata: Metadata = {
  title: 'Air Quality Analytics Platform | Interactive Data Visualization',
  description:
    "Access and visualize real-time and historical air quality information across Africa through AirQo's easy-to-use analytics dashboard. Transform raw pollution data into actionable insights for cleaner air in African cities.",
  keywords:
    'air quality analytics, pollution data visualization, air quality dashboard, environmental data analysis, AirQo analytics platform, real-time air quality data, African air quality insights, pollution trends Africa',
  alternates: {
    canonical: 'https://airqo.net/products/analytics',
  },
  openGraph: {
    type: 'website',
    title: 'Air Quality Analytics Platform | AirQo Products',
    description:
      "Access and visualize real-time and historical air quality information across Africa through AirQo's easy-to-use analytics dashboard.",
    url: 'https://airqo.net/products/analytics',
    images: [
      {
        url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132441/website/photos/OurProducts/Analytics/analytics-dashboard_qijm7k.webp',
        width: 1200,
        height: 630,
        alt: 'AirQo Analytics Platform Dashboard',
      },
    ],
    siteName: 'AirQo',
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
