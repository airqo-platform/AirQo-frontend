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
  return createMetadata({
    ...METADATA_CONFIGS.cleanAirForumLogistics,
    url: `/clean-air-forum/${params.uniqueTitle}/logistics`,
  });
}

const Page = () => {
  return <LogisticsPage />;
};

export default Page;
