import ResearchPage from '@/features/solutions/research/ResearchPage';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.solutionsResearch);
export const viewport = generateViewport();
const page = () => {
  return (
    <div>
      <ResearchPage />
    </div>
  );
};

export default page;
