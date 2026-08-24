import ProductJsonLd from '@/components/ProductJsonLd';
import MobilePage from '@/features/products/MobilePage';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

export const metadata = createMetadata(METADATA_CONFIGS.mobileApp);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <ProductJsonLd config={METADATA_CONFIGS.mobileApp} />
      <MobilePage />
    </div>
  );
};

export default page;
