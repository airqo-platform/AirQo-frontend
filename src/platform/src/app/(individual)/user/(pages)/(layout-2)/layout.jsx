import MapLayout from '@/layouts/MapLayout';

export default function MapRouteLayout({ children }) {
  return <MapLayout forceMapView={true}>{children}</MapLayout>;
}
