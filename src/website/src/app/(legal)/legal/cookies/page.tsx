import CookiesPolicyPage from '@/features/legal/CookiesPolicyPage';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

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
