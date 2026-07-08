import AirQoDataPage from '@/features/legal/AirQoDataPage';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

export const metadata = createMetadata(METADATA_CONFIGS.airqoDataPolicy);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <AirQoDataPage />
    </div>
  );
};

export default page;
