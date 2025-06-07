'use client';

import { useParams } from 'next/navigation';
import { OrganizationProvider } from '@/app/providers/OrganizationProvider';
import OrganizationMapLayout from '@/common/layouts/OrganizationMapLayout';

export default function OrganizationMapLayoutWrapper({ children }) {
  const params = useParams();
  const orgSlug = params?.org_slug || '';

  return (
    <OrganizationProvider orgSlug={orgSlug}>
      <OrganizationMapLayout forceMapView={true}>
        {children}
      </OrganizationMapLayout>
    </OrganizationProvider>
  );
}
