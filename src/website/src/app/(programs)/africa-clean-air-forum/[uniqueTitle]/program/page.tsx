import ProgramsPage from '@/features/clean-air-forum/sessions-programs/ProgramsPage';
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
    getForumPageMetadata(params.uniqueTitle, 'Sessions and agenda', 'program'),
  );
}

const Page = () => {
  return <ProgramsPage />;
};

export default Page;
