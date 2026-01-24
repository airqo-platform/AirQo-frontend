import type { Metadata } from 'next';
import { Suspense } from 'react';

import AirQualityBillboard from '@/components/sections/AirQualityBillboard';
import BillboardSkeleton from '@/components/skeletons/BillboardSkeleton';

interface GridBillboardPageProps {
  params: {
    name: string;
  };
}

export async function generateMetadata({
  params,
}: GridBillboardPageProps): Promise<Metadata> {
  const gridName = params.name;

  return {
    title: `Air Quality Billboard - ${gridName} | AirQo`,
    description: `Real-time air quality monitoring display for ${gridName}`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function GridBillboardPage({ params }: GridBillboardPageProps) {
  const gridName = params.name;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      <Suspense fallback={<BillboardSkeleton centered={true} />}>
        <AirQualityBillboard
          hideControls={false}
          autoRotate={false}
          itemName={gridName}
          centered={true}
          hideDropdown={true}
        />
      </Suspense>
    </main>
  );
}
