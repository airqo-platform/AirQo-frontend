import { Metadata } from 'next';

import AboutPage from '@/views/about/AboutPage';

export const metadata: Metadata = {
  title: 'About Us | AirQo',
  description:
    'Discover AirQo’s mission to monitor and improve air quality in Africa. Learn more about our work, partnerships, and impact.',
  keywords:
    'AirQo, about AirQo, air quality, Africa, pollution monitoring, environmental monitoring',
};

const page = () => {
  return (
    <div>
      <AboutPage />
    </div>
  );
};

export default page;
