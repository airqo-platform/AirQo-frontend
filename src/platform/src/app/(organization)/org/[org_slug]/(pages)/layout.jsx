'use client';

import { useParams } from 'next/navigation';
import { OrganizationProvider } from '@/app/providers/OrganizationProvider';

export default function OrganizationPagesLayoutWrapper({ children }) {
  const params = useParams();
  const orgSlug = params?.org_slug || params?.org_slug?.join('/') || '';

  return (
    <OrganizationProvider orgSlug={orgSlug}>{children}</OrganizationProvider>
  );
}
