import { Metadata } from 'next';

import AboutPage from '@/views/cleanairforum/about/AboutPage';

export const metadata: Metadata = {
  title: 'About the Clean Air Forum',
  description:
    'Learn about the Clean Air Forum, its mission, objectives, and impact in advancing air quality monitoring and management across Africa. Discover why this conference is crucial for environmental health.',
  keywords:
    'about Clean Air Forum, air quality conference mission, environmental conference objectives, AirQo forum goals, clean air initiatives Africa',
  alternates: {
    canonical: 'https://airqo.net/clean-air-forum/about',
  },
  openGraph: {
    title: 'About the Clean Air Forum | AirQo Conference',
    description:
      "Discover the mission and objectives of Africa's premier air quality conference.",
  },
};

const Page = () => {
  return (
    <div>
      <AboutPage />
    </div>
  );
};

export default Page;
