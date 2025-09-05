import dynamic from 'next/dynamic';

import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';

const AboutPage = dynamic(
  () => import('@/views/cleanairforum/about/AboutPage'),
  { ssr: false },
);

export const metadata = createMetadata(METADATA_CONFIGS.cleanAirForum);

const Page = () => {
  return (
    <div>
      <AboutPage />
    </div>
  );
};

export default Page;
