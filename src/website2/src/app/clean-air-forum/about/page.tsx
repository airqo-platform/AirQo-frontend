import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import AboutPage from '@/views/cleanairforum/about/AboutPage';

export const metadata = createMetadata(METADATA_CONFIGS.cleanAirForum);

const Page = () => {
  return (
    <div>
      <AboutPage />
    </div>
  );
};

export default Page;
