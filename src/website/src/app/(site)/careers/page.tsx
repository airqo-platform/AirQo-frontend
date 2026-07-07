import MainLayout from '@/components/layout/MainLayout';
import CareerPage from '@/features/careers/CareerPage';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.careers);
export const viewport = generateViewport();

const Page = () => {
  return (
    <MainLayout>
      <CareerPage />
    </MainLayout>
  );
};

export default Page;
