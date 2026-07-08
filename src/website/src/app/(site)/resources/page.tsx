import { Suspense } from 'react';

import MainLayout from '@/components/layout/MainLayout';
import ResourcePage from '@/features/resources/ResourcePage';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.resources);
export const viewport = generateViewport();

const Page = () => {
  return (
    <MainLayout>
      <Suspense fallback={null}>
        <ResourcePage />
      </Suspense>
    </MainLayout>
  );
};

export default Page;
