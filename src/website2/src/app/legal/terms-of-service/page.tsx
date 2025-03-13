import type { Metadata } from 'next';

import TOSPage from '@/views/legal/TOSPage';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    "Review AirQo's Terms of Service agreement. Understand your rights, responsibilities, and our service commitments for using AirQo's air quality monitoring platform and tools.",
  keywords:
    'AirQo terms of service, service agreement, user terms, legal terms, service conditions, platform usage terms, air quality service terms',
  alternates: {
    canonical: 'https://airqo.net/legal/terms-of-service',
  },
  openGraph: {
    title: 'AirQo Terms of Service',
    description:
      "Review our service terms and conditions for using AirQo's air quality monitoring platform and tools.",
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
