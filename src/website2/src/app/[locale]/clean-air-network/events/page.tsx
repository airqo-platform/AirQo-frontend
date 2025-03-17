import { Metadata } from 'next';

import EventsPage from '@/views/cleanAirNetwork/events/EventsPage';

export const metadata: Metadata = {
  title: 'Network Events & Activities',
  description:
    'Explore upcoming Clean Air Network events, workshops, and activities. Join our community gatherings, training sessions, and collaborative initiatives for better air quality in Africa.',
  keywords:
    'Clean Air Network events, air quality workshops, environmental activities, network meetings, air quality training, environmental workshops Africa, clean air initiatives',
  alternates: {
    canonical: 'https://airqo.net/clean-air-network/events',
  },
  openGraph: {
    title: 'Network Events & Activities | Clean Air Network',
    description:
      'Join our community events and activities focused on improving air quality across Africa.',
  },
};

const Page = () => {
  return (
    <div>
      <EventsPage />
    </div>
  );
};

export default Page;
