import { Metadata } from 'next';

import SpeakersPage from '@/views/cleanairforum/speakers/SpeakersPage';

export const metadata: Metadata = {
  title: 'Speakers & Presenters',
  description:
    'Meet our distinguished speakers and presenters at the Clean Air Forum. Leading experts in air quality, environmental science, and policy sharing insights on addressing air pollution in Africa.',
  keywords:
    'Clean Air Forum speakers, air quality experts, environmental scientists, conference presenters, air pollution experts, African environmental leaders',
  alternates: {
    canonical: 'https://airqo.net/clean-air-forum/speakers',
  },
  openGraph: {
    title: 'Speakers & Presenters | Clean Air Forum 2024',
    description:
      "Leading experts in air quality and environmental science sharing insights at Africa's premier air quality conference.",
  },
};

const Page = () => {
  return <SpeakersPage />;
};

export default Page;
