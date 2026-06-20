import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import BeaconPage from '@/views/products/BeaconPage';

export const metadata = createMetadata(METADATA_CONFIGS.beacon);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <BeaconPage />
    </div>
  );
};

export default page;
