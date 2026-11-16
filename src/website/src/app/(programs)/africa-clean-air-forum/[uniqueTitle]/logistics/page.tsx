import LogisticsPage from '@/features/clean-air-forum/logistics/LogisticsPage';
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
    getForumPageMetadata(params.uniqueTitle, 'Venue and travel', 'logistics'),
  );
}

const Page = () => {
  return <LogisticsPage />;
};

export default Page;
