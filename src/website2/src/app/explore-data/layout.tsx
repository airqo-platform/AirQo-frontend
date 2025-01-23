import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Air Quality Data | AirQo Analytics and Mobile App',
  description:
    'Explore real-time air quality data and analytics with AirQo’s powerful tools. Access data via our mobile app, web platform, and advanced analytics to monitor and improve air quality in Africa.',
  keywords:
    'Explore air quality data, AirQo analytics, AirQo mobile app, air pollution data, air quality analytics, real-time air quality data, AirQo tools, environmental data Africa',
  openGraph: {
    title: 'Explore Air Quality Data - AirQo Analytics and Mobile App',
    description:
      'Access real-time air quality data through AirQo’s mobile app and analytics tools. Learn how AirQo’s platforms are helping improve air quality monitoring in Africa.',
    url: 'https://yourdomain.com/explore-data',
    siteName: 'AirQo',
    images: [
      {
        url: 'https://yourdomain.com/static/explore-data-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Explore Air Quality Data - AirQo Analytics and Mobile App',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AirQo',
    title: 'Explore Air Quality Data - AirQo Analytics and Mobile App',
    description:
      'Discover AirQo’s analytics and mobile app for real-time air quality data across Africa. Monitor air pollution and access detailed environmental data.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://yourdomain.com/explore-data',
  },
};

export default function ExploreDataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
