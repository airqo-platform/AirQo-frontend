import MainLayout from '@/components/layout/MainLayout';
import PressPage from '@/features/press/PressPage';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.press);
export const viewport = generateViewport();

const Page = () => {
  return (
    <MainLayout>
      <PressPage />
    </MainLayout>
  );
};

export default Page;
