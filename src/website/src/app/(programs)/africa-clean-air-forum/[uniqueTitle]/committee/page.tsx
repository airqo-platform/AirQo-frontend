import CommitteePage from '@/features/clean-air-forum/program-committee/CommitteePage';
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
    getForumPageMetadata(params.uniqueTitle, 'Program committee', 'committee'),
  );
}

const Page = () => {
  return <CommitteePage />;
};

export default Page;
