import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import MonitorPage from '@/views/products/MonitorPage';

export const metadata = createMetadata(METADATA_CONFIGS.monitor);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <MonitorPage />
    </div>
  );
};

export default page;
