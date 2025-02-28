import { Metadata } from 'next';

import EventsPage from '@/views/cleanAirNetwork/events/EventsPage';

export const metadata: Metadata = {
  title: 'Events | Clean Air Network | AirQo',
  description:
    'Explore upcoming and past events hosted by Clean Air Network. Stay informed about conferences, webinars, and networking opportunities designed to advance clean air initiatives.',
};

const Page = () => {
  return (
    <div>
      <EventsPage />
    </div>
  );
};

export default Page;
