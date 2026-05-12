import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import CookiesPolicyPage from '@/views/legal/CookiesPolicyPage';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.cookiesPolicy);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <CookiesPolicyPage />
    </div>
  );
};

export default page;
