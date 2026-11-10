import dynamic from 'next/dynamic';

import {
  generateMetadata as createMetadata,
  getForumPageMetadata,
} from '@/lib/metadata';

const AboutPage = dynamic(
  () => import('@/features/clean-air-forum/about/AboutPage'),
  { ssr: false },
);

export function generateMetadata({
  params,
}: {
  params: { uniqueTitle: string };
}) {
  return createMetadata(
    getForumPageMetadata(params.uniqueTitle, 'About', 'about'),
  );
}

const Page = () => {
  return (
    <div>
      <AboutPage />
    </div>
  );
};

export default Page;
