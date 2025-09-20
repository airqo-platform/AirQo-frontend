import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import GlossaryPage from '@/views/cleanairforum/glossary/GlossaryPage';

export const metadata = createMetadata(METADATA_CONFIGS.cleanAirForumGlossary);

const Page = () => {
  return <GlossaryPage />;
};

export default Page;
