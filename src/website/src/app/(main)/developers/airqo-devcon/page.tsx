import MainLayout from '@/components/layouts/MainLayout';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import AirQoDevConPage from '@/views/developers/airqo-devcon/AirQoDevConPage';

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
