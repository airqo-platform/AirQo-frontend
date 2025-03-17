import type { Metadata } from 'next';

import MobilePage from '@/views/products/MobilePage';

export const metadata: Metadata = {
  title: 'Air Quality Mobile Application',
  description:
    "Stay informed about the air you breathe with AirQo's user-friendly mobile app. Access real-time air quality information, personalized health recommendations, and pollution forecasts for African cities.",
  keywords:
    'air quality app, pollution monitoring app, AirQo mobile app, air quality health app, African air quality app, real-time pollution alerts, clean air mobile application',
  alternates: {
    canonical: 'https://airqo.net/products/mobile-app',
  },
  openGraph: {
    title: 'Air Quality Mobile Application | AirQo Products',
    description:
      "Stay informed about the air you breathe with AirQo's user-friendly mobile app for African cities.",
    url: 'https://airqo.net/products/mobile-app',
    images: [
      {
        url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1741695567/website/photos/OurProducts/MobileApp/image7_fjjnl0.jpg',
        width: 1200,
        height: 630,
        alt: 'AirQo Mobile App Interface',
      },
    ],
  },
};

const page = () => {
  return (
    <div>
      <MobilePage />
    </div>
  );
};

export default page;
