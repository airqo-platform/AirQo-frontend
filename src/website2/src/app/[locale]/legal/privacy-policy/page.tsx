import type { Metadata } from 'next';

import PP_Page from '@/views/legal/PP_Page';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how AirQo collects, uses, and protects your personal information. Our Privacy Policy outlines our commitment to data protection and user privacy in air quality monitoring services.',
  keywords:
    'AirQo privacy policy, data protection, personal information handling, privacy terms, user data policy, air quality data privacy, GDPR compliance',
  alternates: {
    canonical: 'https://airqo.net/legal/privacy-policy',
  },
  openGraph: {
    title: 'AirQo Privacy Policy',
    description:
      'Learn how AirQo protects your personal information and handles data in our air quality monitoring services.',
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
