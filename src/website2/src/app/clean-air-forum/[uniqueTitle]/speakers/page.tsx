import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import SpeakersPage from '@/views/cleanairforum/speakers/SpeakersPage';

export function generateMetadata({
  params,
}: {
  params: { uniqueTitle: string };
}) {
  return createMetadata({
    ...METADATA_CONFIGS.cleanAirForumSpeakers,
    url: `/clean-air-forum/${params.uniqueTitle}/speakers`,
  });
}

const Page = () => {
  return <SpeakersPage />;
};

export default Page;
