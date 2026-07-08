import PartnersPage from '@/features/clean-air-forum/partners/PartnersPage';
import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';

export const metadata = createMetadata(METADATA_CONFIGS.cleanAirForumPartners);

const Page = () => {
  return <PartnersPage />;
};

export default Page;
