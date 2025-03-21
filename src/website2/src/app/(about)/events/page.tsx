import type { Metadata } from 'next';

import EventPage from '@/views/events/EventPage';

export const metadata: Metadata = {
  title: 'Air Quality Events & Webinars | AirQo',
  description:
    "Join AirQo's air quality events, workshops, webinars, and conferences focused on improving air quality across African cities. Connect with experts, researchers, and community leaders addressing air pollution challenges.",
  keywords:
    'air quality events, AirQo webinars, air pollution conferences, environmental workshops, clean air events Africa, air quality seminars, AirQo events, air pollution talks, environmental conferences Africa',
  alternates: {
    canonical: 'https://airqo.net/events',
  },
  openGraph: {
    type: 'website',
    url: 'https://airqo.net/events',
    title: 'Air Quality Events & Webinars | AirQo',
    description:
      "Join AirQo's air quality events, workshops, webinars, and conferences focused on improving air quality across African cities.",
    siteName: 'AirQo',
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
