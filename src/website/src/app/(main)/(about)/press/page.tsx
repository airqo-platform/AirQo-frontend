import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import PressPage from '@/views/press/PressPage';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.press);
export const viewport = generateViewport();

const Page = () => {
  return (
    <div>
      <PressPage />
    </div>
  );
};

export default Page;
