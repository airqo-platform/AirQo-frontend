import MainLayout from '@/components/layout/MainLayout';
import HomePage from '@/features/home/HomePage';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.home);
export const viewport = generateViewport();

const page = () => {
  return (
    <MainLayout>
      <HomePage />
    </MainLayout>
  );
};

export default page;
