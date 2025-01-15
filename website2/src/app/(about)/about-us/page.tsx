import { Metadata } from 'next';

import AboutPage from '@/views/about/AboutPage';

export const metadata: Metadata = {
  title: 'About Us | AirQo',
  description:
    'Discover AirQo’s mission to monitor and improve air quality in Africa. Learn more about our work, partnerships, and impact.',
  keywords:
    'AirQo, about AirQo, air quality, Africa, pollution monitoring, environmental monitoring',
  openGraph: {
    title: 'About Us - AirQo',
    description:
      'Learn about AirQo, a leading organization in air quality monitoring in Africa. Discover our mission and how we are working to improve air quality.',
    url: 'https://yourdomain.com/about',
    siteName: 'AirQo',
    images: [
      {
        url: 'https://yourdomain.com/static/about-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AirQo - About Us',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AirQo',
    title: 'About AirQo - Monitoring Air Quality in Africa',
    description:
      'Learn about AirQo’s efforts in air quality monitoring and their mission to improve environmental health in Africa.',
    // image: 'https://yourdomain.com/static/twitter-about-image.jpg',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://yourdomain.com/about', // Ensure you replace this with your actual domain
  },
};

const page = () => {
  return (
    <div>
      <AboutPage />
    </div>
  );
};

export default page;
