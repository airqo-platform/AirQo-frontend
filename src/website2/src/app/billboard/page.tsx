import type { Metadata } from 'next';

import AirQualityBillboard from '@/components/sections/AirQualityBillboard';

export const metadata: Metadata = {
  title: 'Air Quality Billboard | AirQo',
  description:
    'Real-time air quality monitoring display for organizations and public spaces',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BillboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
      <AirQualityBillboard hideControls={true} autoRotate={true} />
    </main>
  );
}
