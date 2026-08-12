'use client';

import { AnalyticsExplorerPage } from '@/modules/analytics/components/AnalyticsExplorerPage';

interface PageProps {
  params: {
    org_slug: string;
  };
}

export default function AnalyticsPage({ params }: PageProps) {
  return (
    <AnalyticsExplorerPage
      isOrganizationFlow
      organizationSlug={params.org_slug}
    />
  );
}
