import { Metadata } from 'next';

import ProgramsPage from '@/views/cleanairforum/sessions-programs/ProgramsPage';

export const metadata: Metadata = {
  title: 'Conference Sessions & Schedule',
  description:
    'Explore the Clean Air Forum sessions, workshops, and schedule. Plan your attendance at key presentations and discussions on air quality monitoring, policy, and solutions.',
  keywords:
    'Clean Air Forum sessions, conference schedule, air quality workshops, environmental presentations, conference agenda, forum timeline',
  alternates: {
    canonical: 'https://airqo.net/clean-air-forum/sessions',
  },
  openGraph: {
    title: 'Sessions & Schedule | Clean Air Forum 2024',
    description:
      'View the complete schedule of presentations, workshops, and discussions at the Clean Air Forum.',
  },
};

const Page = () => {
  return <ProgramsPage />;
};

export default Page;
