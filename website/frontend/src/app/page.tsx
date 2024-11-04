import { Metadata } from 'next';

import HomePage from './home/page';

// Define metadata with additional SEO properties
export const metadata: Metadata = {
  title: 'Home | AirQo',
  description: 'Explore the air quality monitoring data and tools by AirQo.',
  keywords: 'air quality, pollution, monitoring, AirQo, environment',
  openGraph: {
    title: 'AirQo - Air Quality Monitoring',
    description:
      'Discover real-time air quality monitoring tools and resources from AirQo.',
    url: 'https://yourdomain.com/home',
    siteName: 'AirQo',
    images: [
      {
        url: 'https://yourdomain.com/static/og-image.jpg',
        width: 800,
        height: 600,
        alt: 'AirQo Air Quality Monitoring',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AirQo',
    title: 'AirQo - Air Quality Monitoring',
    description: 'Real-time air quality monitoring and resources from AirQo.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://yourdomain.com/home', // Canonical URL to avoid duplicate content issues
  },
};

export default function Home() {
  return <HomePage />;
}
