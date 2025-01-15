import { Metadata } from 'next';

import PressPage from '@/views/press/PressPage';

export const metadata: Metadata = {
  title: 'Press | AirQo in the News',
  description:
    'Stay updated with the latest news and media coverage about AirQo’s efforts to monitor and improve air quality in Africa.',
  keywords:
    'AirQo press, AirQo news, air quality news, AirQo media, air pollution in Africa, AirQo coverage',
  openGraph: {
    title: 'AirQo in the News',
    description:
      'Read about the latest news and media coverage on AirQo’s work in monitoring air quality across Africa.',
    url: 'https://yourdomain.com/press',
    siteName: 'AirQo',
    images: [
      {
        url: 'https://yourdomain.com/static/press-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AirQo Press - News and Media Coverage',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AirQo',
    title: 'AirQo Press - News and Media Coverage',
    description:
      'Stay informed with the latest press releases and media coverage of AirQo’s work in air quality monitoring.',
  },
  robots: {
    index: true, // Allows search engines to index the page
    follow: true, // Allows search engine bots to follow the links on the page
  },
  alternates: {
    canonical: 'https://yourdomain.com/press', // Replace with your actual domain
  },
};

const page = () => {
  return (
    <div>
      <PressPage />
    </div>
  );
};

export default page;
