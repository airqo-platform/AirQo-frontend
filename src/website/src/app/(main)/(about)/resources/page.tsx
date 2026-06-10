import { Suspense } from 'react';

import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import ResourcePage from '@/views/publications/ResourcePage';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.resources);
export const viewport = generateViewport();

const Page = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <ResourcePage />
      </Suspense>
    </div>
  );
};

export default Page;
