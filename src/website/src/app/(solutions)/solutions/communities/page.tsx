import CommunitiesPage from '@/features/solutions/communities/CommunityPage';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.solutionsCommunities);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <CommunitiesPage />
    </div>
  );
};

export default page;
