import React from 'react';

import MainLayout from '@/components/layouts/MainLayout';
import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import HomePage from '@/views/home/HomePage';

// Generate metadata using the centralized utility
export const metadata = createMetadata(METADATA_CONFIGS.home);
export const viewport = generateViewport();

const page = () => {
  return (
    <MainLayout>
      <HomePage />
    </MainLayout>
  );
};

export default page;
