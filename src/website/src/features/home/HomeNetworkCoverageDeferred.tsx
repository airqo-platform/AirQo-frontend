'use client';

import dynamic from 'next/dynamic';

const HomeNetworkCoverage = dynamic(() => import('./HomeNetworkCoverage'), {
  ssr: false,
  loading: () => (
    <div className="mx-auto min-h-[26rem] max-w-7xl animate-pulse rounded-2xl bg-[#0B1B3A]/10 px-4" />
  ),
});

export default HomeNetworkCoverage;
