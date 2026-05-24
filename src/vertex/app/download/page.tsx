import type { Metadata } from 'next';

import DownloadHero from '@/components/features/download/DownloadHero';
import PlatformInfo from '@/components/features/download/PlatformInfo';

export const metadata: Metadata = {
  title: 'Download Vertex Desktop',
  description:
    'Download the AirQo Vertex Desktop application for Windows and manage device deployment workflows from your desktop.',
};

export default function DownloadPage() {
  return (
    <main className="h-screen overflow-y-auto bg-background text-foreground">
      <DownloadHero />
      <PlatformInfo />
    </main>
  );
}
