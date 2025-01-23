import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events | AirQo',
  description:
    'Explore upcoming and past events hosted by AirQo to raise awareness and promote actions for air quality improvement.',
  keywords:
    'AirQo events, air quality events, environmental events, AirQo conferences, air quality workshops',
  openGraph: {
    title: 'AirQo Events',
    description:
      'Stay updated on all upcoming and past events organized by AirQo to promote air quality improvement in Africa.',
    url: 'https://yourdomain.com/events',
    siteName: 'AirQo',
    images: [
      {
        url: 'https://yourdomain.com/static/events-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AirQo Events',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AirQo',
    title: 'AirQo Events',
    description:
      'Explore the events organized by AirQo to promote air quality awareness and improvement in Africa.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://yourdomain.com/events',
  },
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
