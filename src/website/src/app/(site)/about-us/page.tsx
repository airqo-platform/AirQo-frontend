import MainLayout from '@/components/layout/MainLayout';
import AboutPage from '@/features/about/AboutPage';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

export const metadata = createMetadata(METADATA_CONFIGS.about);
export const viewport = generateViewport();

const Page = () => {
  return (
    <MainLayout>
      <AboutPage />
    </MainLayout>
  );
};

export default Page;
