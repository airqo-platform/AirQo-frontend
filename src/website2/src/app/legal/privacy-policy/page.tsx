import type { Metadata } from 'next';

import PP_Page from '@/views/legal/PP_Page';

export const metadata: Metadata = {
  title: 'Privacy Policy | AirQo Data Protection & User Privacy',
  description:
    'Learn how AirQo collects, uses, and protects your personal information. Our Privacy Policy outlines our commitment to data protection and user privacy across our air quality monitoring platform, mobile app, and API services.',
  keywords:
    'AirQo privacy policy, data protection, personal information handling, privacy terms, user data policy, air quality data privacy, GDPR compliance, mobile app privacy, API data privacy',
  alternates: {
    canonical: 'https://airqo.net/legal/privacy-policy',
  },
  openGraph: {
    type: 'website',
    title: 'AirQo Privacy Policy',
    description:
      'Learn how AirQo protects your personal information and handles data across our air quality monitoring services.',
    url: 'https://airqo.net/legal/privacy-policy',
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
      <PP_Page />
    </div>
  );
};

export default page;
