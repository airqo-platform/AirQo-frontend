import dynamic from 'next/dynamic';

import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';

const AboutPage = dynamic(
  () => import('@/views/cleanairforum/about/AboutPage'),
  { ssr: false },
);

export function generateMetadata({
  params,
}: {
  params: { uniqueTitle: string };
}) {
  return createMetadata({
    ...METADATA_CONFIGS.cleanAirForum,
    url: `/clean-air-forum/${params.uniqueTitle}/about`,
  });
}

const Page = () => {
  return (
    <div>
      <AboutPage />
    </div>
  );
};

export default Page;
