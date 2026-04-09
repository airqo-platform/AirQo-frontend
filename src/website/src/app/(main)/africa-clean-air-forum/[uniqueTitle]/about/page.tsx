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
  const encodedTitle = encodeURIComponent(params.uniqueTitle);
  return createMetadata({
    ...METADATA_CONFIGS.cleanAirForum,
    url: `/africa-clean-air-forum/${encodedTitle}/about`,
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
