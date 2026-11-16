import ResourcesPage from '@/features/clean-air-forum/resources/ResourcesPage';
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
    getForumPageMetadata(params.uniqueTitle, 'Resources', 'resources'),
  );
}

const Page = () => {
  return <ResourcesPage />;
};

export default Page;
