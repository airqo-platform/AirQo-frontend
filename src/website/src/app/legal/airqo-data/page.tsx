import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import AirQoDataPage from '@/views/legal/AirQoDataPage';

// Generate metadata using the centralized utility
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
