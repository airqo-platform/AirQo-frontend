import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import PartnersPage from '@/views/cleanairforum/partners/PartnersPage';

export const metadata = createMetadata(METADATA_CONFIGS.cleanAirForumPartners);

const Page = () => {
  return <PartnersPage />;
};

export default Page;
