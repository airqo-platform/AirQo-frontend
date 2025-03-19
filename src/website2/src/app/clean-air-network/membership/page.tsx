import { Metadata } from 'next';

import MemberPage from '@/views/cleanAirNetwork/membership/MemberPage';

export const metadata: Metadata = {
  title: 'Join the Network | Membership',
  description:
    'Become a member of the Clean Air Network and contribute to improving air quality in Africa. Learn about membership benefits, opportunities, and how to get involved.',
  keywords:
    'Clean Air Network membership, join environmental network, air quality collaboration, network participation, environmental membership, clean air partnership, network benefits',
  alternates: {
    canonical: 'https://airqo.net/clean-air-network/membership',
  },
  openGraph: {
    title: 'Join the Clean Air Network | Membership Benefits',
    description:
      "Become part of Africa's leading network dedicated to improving air quality. Discover membership benefits and opportunities.",
  },
};

const Page = () => {
  return (
    <div>
      <MemberPage />
    </div>
  );
};

export default Page;
