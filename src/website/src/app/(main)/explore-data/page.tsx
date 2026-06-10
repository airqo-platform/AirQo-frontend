import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import ExplorePage from '@/views/ExplorePage';

export const metadata = createMetadata(METADATA_CONFIGS.exploreData);

const page = () => {
  return (
    <div>
      <ExplorePage />
    </div>
  );
};

export default page;
