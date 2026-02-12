import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import PRP_Page from '@/views/legal/PRP_Page';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.paymentRefundPolicy);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <PRP_Page />
    </div>
  );
};

export default page;
