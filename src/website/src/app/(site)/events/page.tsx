import MainLayout from '@/components/layout/MainLayout';
import EventPage from '@/features/events/EventPage';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.events);
export const viewport = generateViewport();

const Page = () => {
  return (
    <MainLayout>
      <EventPage />
    </MainLayout>
  );
};

export default Page;
