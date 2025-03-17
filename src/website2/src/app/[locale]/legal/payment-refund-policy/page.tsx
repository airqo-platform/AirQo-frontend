import type { Metadata } from 'next';

import PRP_Page from '@/views/legal/PRP_Page';

export const metadata: Metadata = {
  title: 'Payment & Refund Policy',
  description:
    "Understand AirQo's payment terms, refund conditions, and billing policies for our air quality monitoring services and products.",
  keywords:
    'AirQo payment policy, refund policy, billing terms, payment terms, service charges, refund conditions, payment methods',
  alternates: {
    canonical: 'https://airqo.net/legal/payment-refund-policy',
  },
  openGraph: {
    title: 'AirQo Payment & Refund Policy',
    description:
      'Learn about our payment terms, refund conditions, and billing policies for AirQo services.',
  },
};

const page = () => {
  return (
    <div>
      <PRP_Page />
    </div>
  );
};

export default page;
