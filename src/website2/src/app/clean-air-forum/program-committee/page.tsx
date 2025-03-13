import { Metadata } from 'next';

import CommitteePage from '@/views/cleanairforum/program-committee/CommitteePage';

export const metadata: Metadata = {
  title: 'Program Committee',
  description:
    'Meet the distinguished program committee members organizing the Clean Air Forum. Learn about the experts shaping the conference agenda and content.',
  keywords:
    'Clean Air Forum committee, program organizers, conference committee, air quality experts, forum planning team, scientific committee',
  alternates: {
    canonical: 'https://airqo.net/clean-air-forum/program-committee',
  },
  openGraph: {
    title: 'Program Committee | Clean Air Forum 2024',
    description:
      'Meet the experts organizing and shaping the Clean Air Forum conference program.',
  },
};

const Page = () => {
  return <CommitteePage />;
};

export default Page;
