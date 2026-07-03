import type { Metadata } from 'next';

import DownloadHero from '@/components/features/download/DownloadHero';
import PlatformInfo from '@/components/features/download/PlatformInfo';
import DownloadTopbar from '@/components/layout/DownloadTopbar';

export const metadata: Metadata = {
  title: 'Download Vertex Desktop',
  description:
    'Download the AirQo Vertex Desktop application for Windows and manage device deployment workflows from your desktop.',
};

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DownloadTopbar />
      <main>
        <DownloadHero />
        <PlatformInfo />
      </main>
    </div>
  );
}
