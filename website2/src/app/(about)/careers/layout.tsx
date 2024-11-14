import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers | Join the AirQo Team',
  description:
    'Explore career opportunities at AirQo and join us in improving air quality across Africa. See how you can contribute to our mission and make an impact.',
  keywords:
    'AirQo careers, jobs at AirQo, air quality jobs, environmental jobs, AirQo team, work at AirQo',
  openGraph: {
    title: 'Careers at AirQo - Join Our Team',
    description:
      'Find career opportunities at AirQo, a leading organization in air quality monitoring. Help us improve the environment and make a lasting impact in Africa.',
    url: 'https://yourdomain.com/careers',
    siteName: 'AirQo',
    images: [
      {
        url: 'https://yourdomain.com/static/careers-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AirQo Careers - Join Our Team',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AirQo',
    title: 'Careers at AirQo - Make an Impact',
    description:
      'Explore exciting career opportunities at AirQo and become part of a team dedicated to improving air quality in Africa.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://yourdomain.com/careers',
  },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
