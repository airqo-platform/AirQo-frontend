import ResourcesPage from '@/features/clean-air-forum/resources/ResourcesPage';
import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';

export function generateMetadata({
  params,
}: {
  params: { uniqueTitle: string };
}) {
  const encodedTitle = encodeURIComponent(params.uniqueTitle);
  return createMetadata({
    ...METADATA_CONFIGS.cleanAirForumResources,
    url: `/africa-clean-air-forum/${encodedTitle}/resources`,
  });
}

const Page = () => {
  return <ResourcesPage />;
};

export default Page;
