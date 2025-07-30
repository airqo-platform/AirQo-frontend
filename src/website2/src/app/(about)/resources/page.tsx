import type { Metadata } from 'next';

import ResourcePage from '@/views/publications/ResourcePage';

export const metadata: Metadata = {
  title:
    'Air Quality Resources & Publications | Research Data & Tools by AirQo',
  description:
    'Access comprehensive air quality resources including research papers, datasets, reports, and tools developed by AirQo to monitor and improve environmental health across African cities. Download publications and explore our open-source materials.',
  keywords:
    'AirQo resources, air quality data, environmental datasets, air pollution research, AirQo tools, air quality publications, air quality reports, environmental research Africa, air monitoring resources, clean air research, air quality white papers, pollution data Africa, AirQo publications, environmental health resources',
  alternates: {
    canonical: 'https://airqo.net/resources',
  },
  openGraph: {
    type: 'website',
    url: 'https://airqo.net/resources',
    title: 'Air Quality Resources & Publications | AirQo',
    description:
      'Access comprehensive air quality resources including research papers, datasets, reports, and tools developed by AirQo for African cities.',
    images: [
      {
        url: 'https://airqo.net/icon.png',
        width: 1200,
        height: 630,
        alt: 'AirQo Resources and Publications',
      },
    ],
    siteName: 'AirQo',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AirQoProject',
    title: 'Air Quality Resources & Publications | AirQo',
    description:
      'Access comprehensive air quality resources including research papers, datasets, and tools for African cities.',
    images: ['https://airqo.net/icon.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    'max-snippet': 170,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  category: 'Resources',
  authors: [{ name: 'AirQo Research Team' }],
  other: {
    'revisit-after': '14 days',
    'dc.publisher': 'AirQo',
    'dc.language': 'en',
    'dc.subject': 'Air Quality Resources, Environmental Data',
    'dc.rights': 'Copyright AirQo, Some Rights Reserved',
  },
};

const Page = () => {
  return (
    <div>
      <ResourcePage />
    </div>
  );
};

export default Page;
