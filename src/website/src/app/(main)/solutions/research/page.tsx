import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import ResearchPage from '@/views/solutions/research/ResearchPage';

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
