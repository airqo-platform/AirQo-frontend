import { Metadata } from 'next';

import SpeakersPage from '@/views/cleanairforum/speakers/SpeakersPage';

const currentYear = new Date().getFullYear();
export const metadata: Metadata = {
  title: `Speakers & Presenters | CLEAN-Air Forum ${currentYear} Nairobi`,
  description: `Meet our distinguished speakers and presenters at the CLEAN-Air Forum ${currentYear} in Nairobi. Leading experts in air quality, environmental science, and policy sharing insights on partnerships for clean air solutions in Africa.`,
  keywords: `CLEAN-Air Forum speakers, air quality experts, environmental scientists, conference presenters, air pollution experts, African environmental leaders, Nairobi ${currentYear}, clean air partnerships`,
  alternates: {
    canonical: 'https://airqo.net/clean-air-forum/speakers',
  },
  openGraph: {
    type: 'website',
    title: `Speakers & Presenters | CLEAN-Air Forum ${currentYear}`,
    description: `Leading experts in air quality and environmental science sharing insights on partnerships for clean air solutions at the Nairobi forum in ${currentYear}.`,
    url: 'https://airqo.net/clean-air-forum/speakers',
    siteName: 'AirQo',
  },
};

const Page = () => {
  return <SpeakersPage />;
};

export default Page;
