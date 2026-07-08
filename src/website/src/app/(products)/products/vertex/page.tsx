import VertexPage from '@/features/products/VertexPage';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

export const metadata = createMetadata(METADATA_CONFIGS.vertex);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <VertexPage />
    </div>
  );
};

export default page;
