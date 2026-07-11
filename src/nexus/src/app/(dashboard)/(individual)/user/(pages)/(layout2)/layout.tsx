import { MapLayout } from '@/shared/layouts/MapLayout';

export default function MapPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MapLayout>{children}</MapLayout>;
}
