import MapLayout from '@/common/layouts/pages/MapLayout';

export default function MapRouteLayout({ children }) {
  return <MapLayout forceMapView={true}>{children}</MapLayout>;
}
