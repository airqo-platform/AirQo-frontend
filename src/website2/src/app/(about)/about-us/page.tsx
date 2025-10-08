import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import AboutPage from '@/views/about/AboutPage';

export const metadata = createMetadata(METADATA_CONFIGS.about);
export const viewport = generateViewport();

const Page = () => {
  return (
    <div>
      <AboutPage />
    </div>
  );
};

export default Page;
