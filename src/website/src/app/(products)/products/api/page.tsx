import ApiPage from '@/features/products/ApiPage';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

export const metadata = createMetadata(METADATA_CONFIGS.api);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <ApiPage />
    </div>
  );
};

export default page;
