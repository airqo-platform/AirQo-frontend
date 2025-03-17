import type { Metadata } from 'next';

import CareerPage from '@/views/careers/CareerPage';

export const metadata: Metadata = {
  title: 'Careers at AirQo | Join Our Mission for Clean Air in Africa',
  description:
    'Explore exciting career opportunities at AirQo. Join our diverse team of innovators, researchers, and technologists working to combat air pollution and improve air quality across African cities.',
  keywords:
    'AirQo careers, AirQo jobs, air quality jobs, environmental careers, work at AirQo, AirQo employment, air quality monitoring careers, environmental technology jobs, clean air jobs Africa, AirQo team, tech jobs Africa',
  alternates: {
    canonical: 'https://airqo.net/careers',
  },
  openGraph: {
    type: 'website',
    url: 'https://airqo.net/careers',
    title: 'Careers at AirQo | Join Our Mission for Clean Air in Africa',
    description:
      "Join AirQo's diverse team of innovators and researchers working to combat air pollution across African cities. Explore our current openings and growth opportunities.",
  },
};

const Page = () => {
  return (
    <div>
      <CareerPage />
    </div>
  );
};

export default Page;
