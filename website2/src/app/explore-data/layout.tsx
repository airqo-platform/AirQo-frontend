import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Air Quality Data | AirQo Analytics and Mobile App',
  description:
    'Explore real-time air quality data and analytics with AirQo’s powerful tools. Access data via our mobile app, web platform, and advanced analytics to monitor and improve air quality in Africa.',
  keywords:
    'Explore air quality data, AirQo analytics, AirQo mobile app, air pollution data, air quality analytics, real-time air quality data, AirQo tools, environmental data Africa',
};

export default function ExploreDataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
