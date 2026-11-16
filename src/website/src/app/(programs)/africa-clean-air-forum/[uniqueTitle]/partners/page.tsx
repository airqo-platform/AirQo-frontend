import PartnersPage from '@/features/clean-air-forum/partners/PartnersPage';
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
    getForumPageMetadata(params.uniqueTitle, 'Partners', 'partners'),
  );
}

const Page = () => {
  return <PartnersPage />;
};

export default Page;
