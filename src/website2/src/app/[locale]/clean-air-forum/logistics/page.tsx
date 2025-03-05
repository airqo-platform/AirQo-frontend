import { Metadata } from 'next';

import LogisticsPage from '@/views/cleanairforum/logistics/LogisticsPage';

export const metadata: Metadata = {
  title: 'Logistics | Clean Air Forum',
  description:
    'Get all the essential logistics information for attending the Clean Air Forum, including travel, accommodation, event schedules, and practical tips for participants.',
};

const Page = () => {
  return <LogisticsPage />;
};

export default Page;
