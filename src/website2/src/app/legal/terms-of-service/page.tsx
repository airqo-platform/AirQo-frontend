import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import TOSPage from '@/views/legal/TOSPage';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.termsOfService);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <TOSPage />
    </div>
  );
};

export default page;
