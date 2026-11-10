'use client';

import dynamic from 'next/dynamic';

const HomeNetworkCoverage = dynamic(() => import('./HomeNetworkCoverage'), {
  ssr: false,
  loading: () => (
    <div className="px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <div className="mx-auto min-h-[26rem] max-w-7xl animate-pulse rounded-md border border-line bg-surface-muted" />
    </div>
  ),
});

export default HomeNetworkCoverage;
