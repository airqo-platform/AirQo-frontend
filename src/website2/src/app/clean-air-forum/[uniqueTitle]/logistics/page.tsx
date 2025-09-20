import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import LogisticsPage from '@/views/cleanairforum/logistics/LogisticsPage';

export const metadata = createMetadata(METADATA_CONFIGS.cleanAirForumLogistics);

const Page = () => {
  return <LogisticsPage />;
};

export default Page;
