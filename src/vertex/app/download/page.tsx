import type { Metadata } from 'next';

import DownloadHero from '@/components/features/download/DownloadHero';
import PlatformInfo from '@/components/features/download/PlatformInfo';
import DownloadTopbar from '@/components/layout/DownloadTopbar';

export const metadata: Metadata = {
  title: 'Download Vertex Desktop',
  description:
    'Download the AirQo Vertex Desktop application for macOS, Windows, and Linux. Manage device deployment workflows from your desktop.',
};

export default function DownloadPage() {
  return (
    <div className="h-screen overflow-y-auto bg-background text-foreground">
      <DownloadTopbar />
      <main>
        <DownloadHero />
        <PlatformInfo />
      </main>
    </div>
  );
}
