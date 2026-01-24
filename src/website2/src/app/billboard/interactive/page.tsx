import type { Metadata } from 'next';
import { Suspense } from 'react';

import AirQualityBillboard from '@/components/sections/AirQualityBillboard';
import BillboardSkeleton from '@/components/skeletons/BillboardSkeleton';

export const metadata: Metadata = {
  title: 'Air Quality Billboard with Controls | AirQo',
  description:
    'Interactive air quality monitoring display with manual selection controls',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BillboardInteractivePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      <Suspense fallback={<BillboardSkeleton centered={true} />}>
        <AirQualityBillboard
          hideControls={false}
          autoRotate={true}
          centered={true}
        />
      </Suspense>
    </main>
  );
}
