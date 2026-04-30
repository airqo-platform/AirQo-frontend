'use client';

import dynamic from 'next/dynamic';

const NetworkCoveragePage = dynamic(() => import('./NetworkCoveragePageApi'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[calc(100vh-10rem)] bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" />
        <div className="flex min-h-[70vh] gap-4">
          <div className="hidden w-[350px] animate-pulse rounded-xl border border-slate-200 bg-white lg:block" />
          <div className="flex-1 animate-pulse rounded-xl border border-slate-200 bg-slate-200" />
        </div>
      </div>
    </div>
  ),
});

export default function NetworkCoverageDeferred() {
  return <NetworkCoveragePage />;
}
