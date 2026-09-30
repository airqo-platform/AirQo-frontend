import { MapLayout } from '@/shared/layouts/MapLayout';
import { HomeShortcutGuide } from '@/modules/home/HomeShortcutGuide';

export default function MapPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MapLayout>
      <HomeShortcutGuide />
      {children}
    </MapLayout>
  );
}
