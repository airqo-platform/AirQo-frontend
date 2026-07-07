import AnalyticsPage from '@/features/products/AnalyticsPage';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

export const metadata = createMetadata(METADATA_CONFIGS.nexus);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <AnalyticsPage />
    </div>
  );
};

export default page;
