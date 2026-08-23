'use client';

import { useParams } from 'next/navigation';
import { OrgDashboard } from '@/modules/org-dashboard';

export default function OrgDashboardPage() {
  const params = useParams();
  const org_slug = (params.org_slug as string) ?? '';

  return <OrgDashboard organizationSlug={org_slug} />;
}
