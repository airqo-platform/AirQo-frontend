import PP_Page from '@/features/legal/PP_Page';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.privacyPolicy);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <PP_Page />
    </div>
  );
};

export default page;
