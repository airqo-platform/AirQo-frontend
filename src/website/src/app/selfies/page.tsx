import type { Metadata } from 'next';

import SelfiesWallPage from '@/views/selfies/SelfiesWallPage';

// Internal venue display — not meant to be indexed or linked publicly.
export const metadata: Metadata = {
  title: 'Clean Air Forum Wall | AirQo',
  robots: { index: false, follow: false },
};

export default function SelfiesPage() {
  return <SelfiesWallPage />;
}
