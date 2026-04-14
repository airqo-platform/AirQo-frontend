import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import AnalyticsPage from '@/views/products/AnalyticsPage';

export const metadata = createMetadata(METADATA_CONFIGS.analytics);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <AnalyticsPage />
    </div>
  );
};

export default page;
