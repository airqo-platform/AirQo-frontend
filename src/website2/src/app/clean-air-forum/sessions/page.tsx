import { Metadata } from 'next';

import ProgramsPage from '../../../views/cleanAirForum/sessions-programs/ProgramsPage';

export const metadata: Metadata = {
  title: 'Sessions & Programs | Clean Air Forum | AirQo',
  description:
    'Explore the schedule and detailed program information for Clean Air Forum. Find out about the sessions, topics, and speakers shaping the future of air quality management.',
};

const Page = () => {
  return <ProgramsPage />;
};

export default Page;
