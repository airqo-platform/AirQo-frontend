import { Metadata } from 'next';

import CleanAirPage from '@/views/cleanAirNetwork/about/CleanAirPage';

export const metadata: Metadata = {
  title: 'About Clean Air Network | AirQo',
  description:
    'Discover Clean Air Network – our mission, vision, and the collaborative efforts we undertake to drive innovation and improve air quality through community and stakeholder engagement.',
};

const Page = () => {
  return (
    <div>
      <CleanAirPage />
    </div>
  );
};

export default Page;
