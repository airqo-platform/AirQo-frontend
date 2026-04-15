// NOTE: This page currently renders the glossary content directly.
// If you later change this route to redirect to the canonical
// `/africa-clean-air-forum` endpoint, prefer `permanentRedirect`
// from `next/navigation` (308) instead of `redirect` (307).
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
