import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import KampalaStudyPage from '@/views/solutions/kampala-study/KampalaStudyPage';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.solutionsKampalaStudy);
export const viewport = generateViewport();

const page = () => {
  return <KampalaStudyPage />;
};

export default page;
