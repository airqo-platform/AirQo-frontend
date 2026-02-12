import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import CareerPage from '@/views/careers/CareerPage';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.careers);
export const viewport = generateViewport();

const Page = () => {
  return (
    <div>
      <CareerPage />
    </div>
  );
};

export default Page;
