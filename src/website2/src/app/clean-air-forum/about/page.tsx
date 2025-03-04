import { Metadata } from 'next';

import AboutPage from '@/views/cleanairforum/about/AboutPage';

export const metadata: Metadata = {
  title: 'About Clean Air Forum | AirQo',
  description:
    'Discover the Clean Air Forum – learn about our mission, vision, and how we foster collaboration to advance clean air solutions and improve air quality.',
};

const Page = () => {
  return (
    <div>
      <AboutPage />
    </div>
  );
};

export default Page;
