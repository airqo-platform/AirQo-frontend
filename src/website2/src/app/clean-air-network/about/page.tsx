import { Metadata } from 'next';

import CleanAirPage from '@/views/cleanAirNetwork/about/CleanAirPage';

export const metadata: Metadata = {
  title: 'About the CLEAN-Air Network | African-led Air Quality Community',
  description:
    'Join the CLEAN-Air Network - an African-led, multi-regional network bringing together a community of practice for air quality solutions and management across Africa. Connect with air quality professionals and advocates.',
  keywords:
    'CLEAN-Air Network, African air quality network, air quality community of practice, environmental collaboration Africa, AirQo network, air quality professionals, African environmental network, clean air advocacy',
  alternates: {
    canonical: 'https://airqo.net/clean-air-network/about',
  },
  openGraph: {
    type: 'website',
    title: 'About the CLEAN-Air Network | AirQo',
    description:
      'Join an African-led, multi-regional network bringing together a community of practice for air quality solutions across Africa.',
    url: 'https://airqo.net/clean-air-network/about',
    images: [
      {
        url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132390/website/cleanAirForum/images/section1_usfuoj.webp',
        width: 1200,
        height: 630,
        alt: 'CLEAN-Air Network Community',
      },
    ],
    siteName: 'AirQo',
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
