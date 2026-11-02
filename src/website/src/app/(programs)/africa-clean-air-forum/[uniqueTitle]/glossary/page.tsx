// NOTE: This page currently renders the glossary content directly.
// If you later change this route to redirect to the canonical
// `/africa-clean-air-forum` endpoint, prefer `permanentRedirect`
// from `next/navigation` (308) instead of `redirect` (307).
import GlossaryPage from '@/features/clean-air-forum/glossary/GlossaryPage';
import {
  generateMetadata as createMetadata,
  getForumPageMetadata,
} from '@/lib/metadata';

export function generateMetadata({
  params,
}: {
  params: { uniqueTitle: string };
}) {
  return createMetadata(
    getForumPageMetadata(params.uniqueTitle, 'Glossary', 'glossary'),
  );
}

const Page = () => {
  return <GlossaryPage />;
};

export default Page;
