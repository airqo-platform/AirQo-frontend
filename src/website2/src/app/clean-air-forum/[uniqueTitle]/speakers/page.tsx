import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import SpeakersPage from '@/views/cleanairforum/speakers/SpeakersPage';

export const metadata = createMetadata(METADATA_CONFIGS.cleanAirForumSpeakers);

const Page = () => {
  return <SpeakersPage />;
};

export default Page;
