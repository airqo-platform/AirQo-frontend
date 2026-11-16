import SponsorshipPage from '@/features/clean-air-forum/sponsorship/SponsorshipPage';
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
    getForumPageMetadata(
      params.uniqueTitle,
      'Sponsorship opportunities',
      'sponsorship',
    ),
  );
}

const Page = () => {
  return <SponsorshipPage />;
};

export default Page;
