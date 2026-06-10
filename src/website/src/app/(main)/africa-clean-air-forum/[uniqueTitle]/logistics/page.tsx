import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import LogisticsPage from '@/views/cleanairforum/logistics/LogisticsPage';

export function generateMetadata({
  params,
}: {
  params: { uniqueTitle: string };
}) {
  const encodedTitle = encodeURIComponent(params.uniqueTitle);
  return createMetadata({
    ...METADATA_CONFIGS.cleanAirForumLogistics,
    url: `/africa-clean-air-forum/${encodedTitle}/logistics`,
  });
}

const Page = () => {
  return <LogisticsPage />;
};

export default Page;
