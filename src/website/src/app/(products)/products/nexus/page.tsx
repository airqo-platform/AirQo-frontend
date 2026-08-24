import ProductJsonLd from '@/components/ProductJsonLd';
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
      <ProductJsonLd config={METADATA_CONFIGS.nexus} />
      <AnalyticsPage />
    </div>
  );
};

export default page;
