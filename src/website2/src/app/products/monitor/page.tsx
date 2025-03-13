import type { Metadata } from 'next';

import MonitorPage from '@/views/products/MonitorPage';

export const metadata: Metadata = {
  title: 'Air Quality Monitoring Devices',
  description:
    "Deploy AirQo's cost-effective, reliable air quality monitoring devices designed specifically for African urban environments. Our monitors provide accurate, hyperlocal data to identify pollution sources and trends.",
  keywords:
    'air quality monitors, pollution sensors, AirQo monitoring devices, environmental monitoring equipment, African air quality sensors, urban pollution monitors, air quality measurement devices',
  alternates: {
    canonical: 'https://airqo.net/products/monitor',
  },
  openGraph: {
    title: 'Air Quality Monitoring Devices | AirQo Products',
    description:
      "Deploy AirQo's cost-effective, reliable air quality monitoring devices designed specifically for African urban environments.",
    url: 'https://airqo.net/products/monitor',
    images: [
      {
        url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1741870808/website/photos/OurProducts/Monitor/image14_agtyes.jpg',
        width: 1200,
        height: 630,
        alt: 'AirQo Air Quality Monitoring Device',
      },
    ],
  },
};

const page = () => {
  return (
    <div>
      <MonitorPage />
    </div>
  );
};

export default page;
