import type { Metadata } from 'next';

import NetworkCoverageDeferred from '@/features/solutions/network-coverage/NetworkCoverageDeferred';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

// Generate metadata using the centralized utility
const baseMetadata = createMetadata(METADATA_CONFIGS.solutionsNetworkCoverage);

export const metadata: Metadata = {
  ...baseMetadata,
  title: { absolute: 'Africa Network Map | Air Quality Monitoring Landscape' },
};
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <NetworkCoverageDeferred />
    </div>
  );
};

export default page;
