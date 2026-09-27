'use client';

import { useParams } from 'next/navigation';
import { AnalyticsExplorerPage } from '@/modules/analytics/components/AnalyticsExplorerPage';

export default function OrganizationAnalyticsPage() {
  const params = useParams();
  const organizationSlug = (params.org_slug as string) ?? '';

  return (
    <AnalyticsExplorerPage
      isOrganizationFlow
      organizationSlug={organizationSlug}
    />
  );
}
