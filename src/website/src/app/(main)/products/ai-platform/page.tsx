import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import AIPlatformPage from '@/views/products/AIPlatformPage';

export const metadata = createMetadata(METADATA_CONFIGS.aiPlatform);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <AIPlatformPage />
    </div>
  );
};

export default page;
