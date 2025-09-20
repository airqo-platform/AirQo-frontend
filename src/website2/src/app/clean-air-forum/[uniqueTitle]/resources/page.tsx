import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import ResourcesPage from '@/views/cleanairforum/resources/ResourcesPage';

export function generateMetadata({
  params,
}: {
  params: { uniqueTitle: string };
}) {
  return createMetadata({
    ...METADATA_CONFIGS.cleanAirForumResources,
    url: `/clean-air-forum/${params.uniqueTitle}/resources`,
  });
}

const Page = () => {
  return <ResourcesPage />;
};

export default Page;
