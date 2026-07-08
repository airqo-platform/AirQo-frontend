import CommitteePage from '@/features/clean-air-forum/program-committee/CommitteePage';
import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';

export const metadata = createMetadata(
  METADATA_CONFIGS.cleanAirForumProgramCommittee,
);

const Page = () => {
  return <CommitteePage />;
};

export default Page;
