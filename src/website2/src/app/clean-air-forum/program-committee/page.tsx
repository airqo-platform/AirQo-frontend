import { Metadata } from 'next';

import CommitteePage from '../../../views/cleanAirForum/program-committee/CommitteePage';

export const metadata: Metadata = {
  title: 'Program Committee | Clean Air Forum | AirQo',
  description:
    'Meet the expert program committee of Clean Air Forum. Learn about the thought leaders and industry experts driving innovative strategies for better air quality.',
};

const Page = () => {
  return <CommitteePage />;
};

export default Page;
