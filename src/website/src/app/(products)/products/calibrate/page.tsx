import CalibratePage from '@/features/products/CalibratePage';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

export const metadata = createMetadata(METADATA_CONFIGS.calibrate);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <CalibratePage />
    </div>
  );
};

export default page;
