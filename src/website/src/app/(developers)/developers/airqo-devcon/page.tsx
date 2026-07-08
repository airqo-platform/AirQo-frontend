import MainLayout from '@/components/layout/MainLayout';
import AirQoDevConPage from '@/features/developers/airqo-devcon/AirQoDevConPage';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

export const metadata = createMetadata(METADATA_CONFIGS.airqoDevCon);
export const viewport = generateViewport();

const page = () => {
  return (
    <MainLayout showMarketingSections={false} showNewsletter={false}>
      <AirQoDevConPage />
    </MainLayout>
  );
};

export default page;
