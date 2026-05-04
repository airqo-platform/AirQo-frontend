import { Suspense } from 'react';

import {
  generateMetadata as createMetadata,
  generateViewport,
  METADATA_CONFIGS,
} from '@/lib/metadata';
import BlogsPage from '@/views/blogs/BlogsPage';

export const metadata = createMetadata(METADATA_CONFIGS.blogs);
export const viewport = generateViewport();

const Page = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <BlogsPage />
      </Suspense>
    </div>
  );
};

export default Page;
