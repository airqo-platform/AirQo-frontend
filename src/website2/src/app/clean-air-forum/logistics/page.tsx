import { Metadata } from 'next';

import LogisticsPage from '@/views/cleanairforum/logistics/LogisticsPage';

export const metadata: Metadata = {
  title: 'Venue & Travel Information',
  description:
    'Find essential information about the Clean Air Forum venue, accommodation, travel arrangements, and local transportation in Kampala, Uganda.',
  keywords:
    'Clean Air Forum venue, conference location, accommodation, travel information, Kampala conference, forum logistics, event directions',
  alternates: {
    canonical: 'https://airqo.net/clean-air-forum/logistics',
  },
  openGraph: {
    title: 'Venue & Travel Information | Clean Air Forum 2024',
    description:
      'Essential information for attending the Clean Air Forum in Kampala, Uganda.',
  },
};

const Page = () => {
  return <LogisticsPage />;
};

export default Page;
