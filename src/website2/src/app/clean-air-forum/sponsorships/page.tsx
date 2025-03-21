import { Metadata } from 'next';

import SponsorshipPage from '@/views/cleanairforum/sponsorship/SponsorshipPage';

export const metadata: Metadata = {
  title: 'Sponsorship Opportunities',
  description:
    "Explore sponsorship opportunities for the Clean Air Forum. Support Africa's premier air quality conference and showcase your commitment to environmental sustainability.",
  keywords:
    'Clean Air Forum sponsorship, conference sponsors, environmental sponsorship, air quality conference support, forum partnerships, sponsorship packages',
  alternates: {
    canonical: 'https://airqo.net/clean-air-forum/sponsorships',
  },
  openGraph: {
    title: 'Sponsorship Opportunities | Clean Air Forum 2024',
    description:
      "Support Africa's premier air quality conference and showcase your commitment to environmental sustainability.",
  },
};

const Page = () => {
  return <SponsorshipPage />;
};

export default Page;
