import type { Metadata } from 'next';

import AirQualityBillboard from '@/components/sections/AirQualityBillboard';

interface CohortBillboardPageProps {
  params: {
    name: string;
  };
}

export async function generateMetadata({
  params,
}: CohortBillboardPageProps): Promise<Metadata> {
  const cohortName = decodeURIComponent(params.name);

  return {
    title: `Air Quality Billboard - ${cohortName} | AirQo`,
    description: `Real-time air quality monitoring display for ${cohortName}`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function CohortBillboardPage({
  params,
}: CohortBillboardPageProps) {
  const cohortName = decodeURIComponent(params.name);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      <AirQualityBillboard
        hideControls={true}
        autoRotate={false}
        dataType="cohort"
        itemName={cohortName}
      />
    </main>
  );
}
