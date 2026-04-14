import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import CalibratePage from '@/views/products/CalibratePage';

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
