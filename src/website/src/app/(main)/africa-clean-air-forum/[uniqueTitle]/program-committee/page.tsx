import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import CommitteePage from '@/views/cleanairforum/program-committee/CommitteePage';

export const metadata = createMetadata(
  METADATA_CONFIGS.cleanAirForumProgramCommittee,
);

const Page = () => {
  return <CommitteePage />;
};

export default Page;
