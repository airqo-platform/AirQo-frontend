import type { Metadata } from 'next';
import { Suspense } from 'react';

import AirQualityBillboard from '@/components/sections/AirQualityBillboard';
import BillboardSkeleton from '@/components/sections/AirQualityBillboard/skeletons/BillboardSkeleton';

export const metadata: Metadata = {
  title:
    'Live Air Quality Billboard Uganda, Kenya, Nigeria | Interactive Monitor - AirQo',
  description:
    'Real-time interactive air quality billboard displaying live PM2.5 data from Kampala, Nairobi, Lagos, Accra and 16+ African cities. Watch pollution levels update live across Uganda, Kenya, Nigeria, Ghana, Rwanda, Tanzania, Senegal, South Africa, Zambia, Burundi, Cameroon, Ethiopia, Gambia. Free interactive tool.',
  keywords: [
    'air quality billboard',
    'live air quality display',
    'real-time pollution monitor',
    'interactive air quality',
    'Kampala air quality live',
    'Nairobi pollution display',
    'Lagos air quality monitor',
    'Africa air quality billboard',
    'Uganda live air data',
    'Kenya pollution display',
    'Nigeria air quality screen',
    'digital air quality board',
    'PM2.5 live display',
    'African cities air monitor',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title:
      "Live Air Quality Billboard - Watch Africa's Air Quality in Real-time",
    description:
      'Interactive billboard showing live PM2.5 data from 16+ African cities including Kampala, Nairobi, Lagos, Accra',
    type: 'website',
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
