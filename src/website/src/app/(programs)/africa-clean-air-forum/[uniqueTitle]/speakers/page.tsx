import SpeakersPage from '@/features/clean-air-forum/speakers/SpeakersPage';
import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';

export function generateMetadata({
  params,
}: {
  params: { uniqueTitle: string };
}) {
  const encodedTitle = encodeURIComponent(params.uniqueTitle);
  return createMetadata({
    ...METADATA_CONFIGS.cleanAirForumSpeakers,
    url: `/africa-clean-air-forum/${encodedTitle}/speakers`,
  });
}

const Page = () => {
  return <SpeakersPage />;
};

export default Page;
