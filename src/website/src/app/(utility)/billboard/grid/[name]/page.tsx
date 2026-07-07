import type { Metadata } from 'next';
import { Suspense } from 'react';

import AirQualityBillboard from '@/components/sections/AirQualityBillboard';
import BillboardSkeleton from '@/components/sections/AirQualityBillboard/skeletons/BillboardSkeleton';

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
    title: `${gridName} Air Quality Billboard | Live PM2.5 Display - AirQo`,
    description: `Real-time air quality billboard for ${gridName}. Watch live PM2.5 data, pollution levels, and health recommendations update automatically. Interactive display for African cities air quality monitoring.`,
    keywords: [
      `${gridName} air quality`,
      `${gridName} pollution display`,
      'air quality billboard',
      'live air monitor',
      'real-time PM2.5',
      'Africa air quality',
    ],
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${gridName} Live Air Quality Billboard`,
      description: `Watch real-time air quality data for ${gridName}`,
      type: 'website',
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
