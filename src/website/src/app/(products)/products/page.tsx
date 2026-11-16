import ProductsPage from '@/features/products/ProductsPage';
import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';

export const metadata = createMetadata(METADATA_CONFIGS.products);

const page = () => <ProductsPage />;

export default page;
