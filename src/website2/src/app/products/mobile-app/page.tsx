import type { Metadata } from 'next';

import MobilePage from '@/views/products/MobilePage';

export const metadata: Metadata = {
  title: 'AirQo Mobile App | Discover the Quality of Air You Breathe',
  description:
    'Download the AirQo mobile app to stay informed about air quality in your area. Get real-time pollution data, health recommendations, and air quality forecasts for cities across Africa. Available on iOS and Android.',
  keywords:
    'AirQo mobile app, air quality app download, pollution monitoring app, air quality health app, African air quality app, real-time pollution alerts, clean air mobile application, iOS Android air quality',
  alternates: {
    canonical: 'https://airqo.net/products/mobile-app',
  },
  openGraph: {
    type: 'website',
    title: 'AirQo Mobile App | Discover the Quality of Air You Breathe',
    description:
      'Download the AirQo mobile app to stay informed about air quality in your area. Get real-time pollution data and health recommendations.',
    url: 'https://airqo.net/products/mobile-app',
    images: [
      {
        url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1742911840/website/photos/OurProducts/MobileApp/Home___Light_mode_aw3ysg.png',
        width: 1200,
        height: 630,
        alt: 'AirQo Mobile App Interface',
      },
    ],
    siteName: 'AirQo',
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
