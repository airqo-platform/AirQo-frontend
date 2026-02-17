import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import SponsorshipPage from '@/views/cleanairforum/sponsorship/SponsorshipPage';

export const metadata = createMetadata(
  METADATA_CONFIGS.cleanAirForumSponsorships,
);

const Page = () => {
  return <SponsorshipPage />;
};

export default Page;
