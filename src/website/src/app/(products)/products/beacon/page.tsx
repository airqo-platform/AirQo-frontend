import ProductJsonLd from '@/components/ProductJsonLd';
import BeaconPage from '@/features/products/BeaconPage';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

export const metadata = createMetadata(METADATA_CONFIGS.beacon);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <ProductJsonLd config={METADATA_CONFIGS.beacon} />
      <BeaconPage />
    </div>
  );
};

export default page;
