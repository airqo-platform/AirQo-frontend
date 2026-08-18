'use client';

import { useParams } from 'next/navigation';
import { AnalyticsExplorerPage } from '@/modules/analytics/components/AnalyticsExplorerPage';

export default function OrgAnalyticsPage() {
  const params = useParams();
  const org_slug = (params.org_slug as string) ?? '';
  return (
    <AnalyticsExplorerPage
      isOrganizationFlow={true}
      organizationSlug={org_slug}
    />
  );
}
