import { MapLayout } from '@/shared/layouts/MapLayout';
import { HomeShortcutGuide } from '@/modules/home/components/HomeShortcutGuide';

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
