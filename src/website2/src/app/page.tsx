import { Metadata } from 'next';

import HomePage from './home/page';

// Define metadata with additional SEO properties
export const metadata: Metadata = {
  title: 'AirQo | Bridging the Air Quality Data Gap in Africa',
  description:
    'AirQo empowers African communities with accurate, hyperlocal, and timely air quality data to drive pollution mitigation actions. We deploy low-cost sensors and provide real-time insights where 9 out of 10 people breathe polluted air.',
  keywords:
    'AirQo, air quality monitoring Africa, air pollution data, hyperlocal air quality, African cities air quality, real-time pollution data, low-cost air sensors, clean air Africa, air quality analytics, pollution mitigation, environmental monitoring Africa, PM2.5 Africa, air quality index Africa',
  alternates: {
    canonical: 'https://airqo.net',
  },
  openGraph: {
    type: 'website',
    url: 'https://airqo.net',
    title: 'AirQo | Bridging the Air Quality Data Gap in Africa',
    description:
      'Empowering African communities with accurate, hyperlocal, and timely air quality data to drive pollution mitigation actions.',
    images: [
      {
        url: 'https://airqo.net/icon.png',
        width: 1200,
        height: 630,
        alt: 'AirQo - Clean Air for All African Cities',
      },
    ],
    siteName: 'AirQo',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AirQoProject',
    title: 'AirQo | Bridging the Air Quality Data Gap in Africa',
    description:
      'Empowering African communities with accurate, hyperlocal, and timely air quality data to drive pollution mitigation actions.',
    images: ['https://airqo.net/icon.png'],
  },
};

export default function Home() {
  return <HomePage />;
}
