import ProgramsPage from '@/features/clean-air-forum/sessions-programs/ProgramsPage';
import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';

export const metadata = createMetadata(METADATA_CONFIGS.cleanAirForumSessions);

const Page = () => {
  return <ProgramsPage />;
};

export default Page;
