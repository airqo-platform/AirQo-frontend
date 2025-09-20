import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import ResourcesPage from '@/views/cleanairforum/resources/ResourcesPage';

export const metadata = createMetadata(METADATA_CONFIGS.cleanAirForumResources);

const Page = () => {
  return <ResourcesPage />;
};

export default Page;
