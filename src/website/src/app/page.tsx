import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

import HomePage from './(main)/home/page';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.home);
export const viewport = generateViewport();

export default function Home() {
  return <HomePage />;
}
