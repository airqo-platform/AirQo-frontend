import PRP_Page from '@/features/legal/PRP_Page';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

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
