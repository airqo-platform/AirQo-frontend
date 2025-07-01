import type { Metadata } from 'next';

import EventPage from '@/views/events/EventPage';

export const metadata: Metadata = {
  title: 'Air Quality Events & Webinars | AirQo Community Engagement',
  description:
    "Join AirQo's air quality events, workshops, webinars, and conferences focused on improving air quality across African cities. Connect with experts, researchers, and community leaders addressing air pollution challenges. Stay updated on the latest environmental initiatives.",
  keywords:
    'air quality events, AirQo webinars, air pollution conferences, environmental workshops, clean air events Africa, air quality seminars, AirQo events, air pollution talks, environmental conferences Africa, CLEAN-Air Forum, community engagement, networking events',
  alternates: {
    canonical: 'https://airqo.net/events',
  },
  openGraph: {
    type: 'website',
    url: 'https://airqo.net/events',
    title: 'Air Quality Events & Webinars | AirQo',
    description:
      "Join AirQo's air quality events, workshops, webinars, and conferences focused on improving air quality across African cities.",
    images: [
      {
        url: 'https://airqo.net/icon.png',
        width: 1200,
        height: 630,
        alt: 'AirQo Events and Community Engagement',
      },
    ],
    siteName: 'AirQo',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AirQoProject',
    title: 'Air Quality Events & Webinars | AirQo',
    description:
      "Join AirQo's air quality events and conferences focused on improving air quality across African cities.",
    images: ['https://airqo.net/icon.png'],
  },
  category: 'Events',
  other: {
    'revisit-after': '7 days',
  },
};

const Page = () => {
  return (
    <div>
      <EventPage />
    </div>
  );
};

export default Page;
