import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import EventPage from '@/views/events/EventPage';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.events);
export const viewport = generateViewport();

const Page = () => {
  return (
    <div>
      <EventPage />
    </div>
  );
};

export default Page;
