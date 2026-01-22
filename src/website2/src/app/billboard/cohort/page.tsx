import type { Metadata } from 'next';

import AirQualityBillboard from '@/components/sections/AirQualityBillboard';

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
      <AirQualityBillboard
        hideControls={true}
        autoRotate={true}
        dataType="cohort"
      />
    </main>
  );
}
