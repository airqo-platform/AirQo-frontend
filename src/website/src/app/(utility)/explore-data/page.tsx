import ExplorePage from '@/features/explore-data/ExplorePage';
import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';

export const metadata = createMetadata(METADATA_CONFIGS.exploreData);

const page = () => {
  return (
    <div>
      <ExplorePage />
    </div>
  );
};

export default page;
