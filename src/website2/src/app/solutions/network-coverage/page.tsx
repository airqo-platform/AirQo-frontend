import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import NetworkCoveragePage from '@/views/solutions/NetworkCoverage/NetworkCoveragePage';

// Generate metadata using the centralized utility
export const metadata = createMetadata(
  METADATA_CONFIGS.solutionsNetworkCoverage,
);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <NetworkCoveragePage />
    </div>
  );
};

export default page;
