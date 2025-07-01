import type { Metadata } from 'next';

import TOSPage from '@/views/legal/TOSPage';

export const metadata: Metadata = {
  title: 'Terms of Service | AirQo Legal Agreement',
  description:
    "Review AirQo's Terms of Service agreement. Understand your rights, responsibilities, and our service commitments for using AirQo's air quality monitoring platform, API, mobile app, and data services.",
  keywords:
    'AirQo terms of service, service agreement, user terms, legal terms, service conditions, platform usage terms, air quality service terms, API terms, mobile app terms',
  alternates: {
    canonical: 'https://airqo.net/legal/terms-of-service',
  },
  openGraph: {
    type: 'website',
    title: 'AirQo Terms of Service',
    description:
      "Review our service terms and conditions for using AirQo's air quality monitoring platform and data services.",
    url: 'https://airqo.net/legal/terms-of-service',
    siteName: 'AirQo',
  },
  robots: {
    index: true,
    follow: false,
  },
};

const page = () => {
  return (
    <div>
      <TOSPage />
    </div>
  );
};

export default page;
