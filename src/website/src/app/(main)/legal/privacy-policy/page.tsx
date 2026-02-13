import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import PP_Page from '@/views/legal/PP_Page';

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
