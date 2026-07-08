import LogisticsPage from '@/features/clean-air-forum/logistics/LogisticsPage';
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
    ...METADATA_CONFIGS.cleanAirForumLogistics,
    url: `/africa-clean-air-forum/${encodedTitle}/logistics`,
  });
}

const Page = () => {
  return <LogisticsPage />;
};

export default Page;
