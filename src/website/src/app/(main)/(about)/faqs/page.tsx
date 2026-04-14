import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import { FAQPage } from '@/views/faqs';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.faqs);
export const viewport = generateViewport();

const Page = () => {
  return (
    <div>
      <FAQPage />
    </div>
  );
};

export default Page;
