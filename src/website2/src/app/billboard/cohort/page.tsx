import type { Metadata } from 'next';
import { Suspense } from 'react';

import AirQualityBillboard from '@/components/sections/AirQualityBillboard';
import BillboardSkeleton from '@/components/skeletons/BillboardSkeleton';

export const metadata: Metadata = {
  title: 'Air Quality Billboard - Cohort | AirQo',
  description: 'Real-time air quality monitoring display for cohorts',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CohortBillboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      <Suspense fallback={<BillboardSkeleton centered={true} />}>
        <AirQualityBillboard
          hideControls={true}
          autoRotate={true}
          dataType="cohort"
        />
      </Suspense>
    </main>
  );
}
