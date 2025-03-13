import { Metadata } from 'next';

import CleanAirPage from '@/views/cleanAirNetwork/about/CleanAirPage';

export const metadata: Metadata = {
  title: 'About the Clean Air Network',
  description:
    "Learn about AirQo's Clean Air Network mission, vision, and impact in improving air quality across Africa. Discover how our network brings together stakeholders for environmental change.",
  keywords:
    'Clean Air Network mission, air quality initiative, environmental collaboration, AirQo network, air quality goals, African environmental network, clean air mission',
  alternates: {
    canonical: 'https://airqo.net/clean-air-network/about',
  },
  openGraph: {
    title: 'About the Clean Air Network | AirQo',
    description:
      "Discover how AirQo's Clean Air Network is uniting stakeholders to improve air quality across Africa.",
  },
};

const Page = () => {
  return (
    <div>
      <CleanAirPage />
    </div>
  );
};

export default Page;
