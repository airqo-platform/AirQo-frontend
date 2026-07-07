import MainLayout from '@/components/layout/MainLayout';
import { FAQPage } from '@/features/faqs';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.faqs);
export const viewport = generateViewport();

const Page = () => {
  return (
    <MainLayout>
      <FAQPage />
    </MainLayout>
  );
};

export default Page;
