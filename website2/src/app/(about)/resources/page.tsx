import { Metadata } from 'next';

import ResourcePage from './ResourcePage';

export const metadata: Metadata = {
  title: 'Resources | Air Quality Data and Tools by AirQo',
  description:
    'Access AirQo’s air quality data, research, and tools to help monitor and improve environmental health in Africa. Explore our datasets and resources.',
  keywords:
    'AirQo resources, air quality data, environmental data, air pollution, AirQo tools, air quality research, air quality reports',
  openGraph: {
    title: 'AirQo Resources - Air Quality Data and Tools',
    description:
      'Explore AirQo’s comprehensive air quality datasets, research, and tools for monitoring air pollution in Africa. Access valuable resources for environmental improvement.',
    url: 'https://yourdomain.com/resources',
    siteName: 'AirQo',
    images: [
      {
        url: 'https://yourdomain.com/static/resources-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AirQo Resources - Air Quality Data and Tools',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AirQo',
    title: 'AirQo Resources - Air Quality Data and Tools',
    description:
      'Discover AirQo’s air quality datasets, tools, and research to help monitor and combat air pollution in Africa.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://yourdomain.com/resources',
  },
};

const page = () => {
  return (
    <div>
      <ResourcePage />
    </div>
  );
};

export default page;
