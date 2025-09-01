import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import MobilePage from '@/views/products/MobilePage';

export const metadata = createMetadata(METADATA_CONFIGS.mobileApp);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <MobilePage />
    </div>
  );
};

export default page;
