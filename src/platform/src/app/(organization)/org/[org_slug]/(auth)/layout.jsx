'use client';

import { useParams } from 'next/navigation';
import { OrganizationProvider } from '@/app/providers/OrganizationProvider';

export default function OrganizationAuthLayout({ children }) {
  const params = useParams();
  const orgSlug = params?.org_slug || '';
  return (
    <OrganizationProvider orgSlug={orgSlug}>{children}</OrganizationProvider>
  );
}
