import SpeakersPage from '@/features/clean-air-forum/speakers/SpeakersPage';
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
    getForumPageMetadata(params.uniqueTitle, 'Speakers', 'speakers'),
  );
}

const Page = () => {
  return <SpeakersPage />;
};

export default Page;
