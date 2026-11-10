import SolutionsPage from '@/features/solutions/SolutionsPage';
import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';

export const metadata = createMetadata(METADATA_CONFIGS.solutions);

const page = () => <SolutionsPage />;

export default page;
