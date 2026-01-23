import type { Metadata } from 'next';

import AirQualityBillboard from '@/components/sections/AirQualityBillboard';

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
      <AirQualityBillboard hideControls={false} autoRotate={true} />
    </main>
  );
}
