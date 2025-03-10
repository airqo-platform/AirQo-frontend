import { Metadata } from 'next';

import MemberPage from '@/views/cleanAirNetwork/membership/MemberPage';

export const metadata: Metadata = {
  title: 'Membership | Clean Air Network | AirQo',
  description:
    'Join Clean Air Network – connect with professionals dedicated to advancing air quality. Learn about membership benefits, exclusive resources, and opportunities for collaboration.',
};

const Page = () => {
  return (
    <div>
      <MemberPage />
    </div>
  );
};

export default Page;
