import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import VertexPage from '@/views/products/VertexPage';

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
