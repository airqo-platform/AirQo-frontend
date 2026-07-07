import AfricanCityPage from '@/features/solutions/african-cities/AfricanCityPage';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.solutionsAfricanCities);
export const viewport = generateViewport();

const page = () => {
  return (
    <div>
      <AfricanCityPage />
    </div>
  );
};

export default page;
