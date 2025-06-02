'use client';

import { useParams } from 'next/navigation';
import { OrganizationProvider } from '@/common/components/Organization/OrganizationProvider';
import OrganizationLayout from '@/common/layouts/OrganizationLayout';

export default function OrganizationPagesLayout({ children }) {
  const params = useParams();
  const orgSlug = params?.org_slug || params?.org_slug?.join('/') || '';

  return (
    <OrganizationProvider orgSlug={orgSlug}>
      <OrganizationLayout>{children}</OrganizationLayout>
    </OrganizationProvider>
  );
}
