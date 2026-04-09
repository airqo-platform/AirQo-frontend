import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import ProgramsPage from '@/views/cleanairforum/sessions-programs/ProgramsPage';

export const metadata = createMetadata(METADATA_CONFIGS.cleanAirForumSessions);

const Page = () => {
  return <ProgramsPage />;
};

export default Page;
