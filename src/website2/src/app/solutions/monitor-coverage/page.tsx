import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import MonitorCoveragePage from '@/views/solutions/MonitorCoverage/MonitorCoveragePage';

// Generate metadata using the centralized utility
export const metadata = createMetadata(
  METADATA_CONFIGS.solutionsMonitorCoverage,
);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <MonitorCoveragePage />
    </div>
  );
};

export default page;
