import NetworkCoverageDeferred from '@/features/solutions/network-coverage/NetworkCoverageDeferred';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

// Generate metadata using the centralized utility
export const metadata = createMetadata(
  METADATA_CONFIGS.solutionsNetworkCoverage,
);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <NetworkCoverageDeferred />
    </div>
  );
};

export default page;
