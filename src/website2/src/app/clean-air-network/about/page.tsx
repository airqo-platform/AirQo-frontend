import {
  generateMetadata as createMetadata,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import CleanAirPage from '@/views/cleanAirNetwork/about/CleanAirPage';

export const metadata = createMetadata(METADATA_CONFIGS.cleanAirNetwork);

const Page = () => {
  return (
    <div>
      <CleanAirPage />
    </div>
  );
};

export default Page;
