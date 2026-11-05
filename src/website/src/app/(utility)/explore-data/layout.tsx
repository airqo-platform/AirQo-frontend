import { Metadata } from 'next';

import MainLayout from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'Explore Air Quality Data and Tools | AirQo',
  description:
    'Explore AirQo data, maps, monitoring products, developer tools, research, and practical resources for understanding and improving air quality across Africa.',
  keywords:
    'Explore air quality data, AirQo Nexus, AirQo mobile app, AirQo API, air pollution data, live air quality map, AirQo tools, environmental data Africa',
};

export default function ExploreDataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout showMarketingSections={false} showNewsletter={false}>
      {children}
    </MainLayout>
  );
}
