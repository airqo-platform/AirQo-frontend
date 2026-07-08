import SponsorshipPage from '@/features/clean-air-forum/sponsorship/SponsorshipPage';
import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';

export const metadata = createMetadata(
  METADATA_CONFIGS.cleanAirForumSponsorships,
);

const Page = () => {
  return <SponsorshipPage />;
};

export default Page;
