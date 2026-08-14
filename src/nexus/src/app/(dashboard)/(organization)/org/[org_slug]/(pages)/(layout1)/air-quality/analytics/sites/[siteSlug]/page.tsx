'use client';

import { SiteDetailsPage } from '@/modules/analytics/components/explorer/SiteDetailsPage';

interface PageProps {
  params: {
    org_slug: string;
    siteSlug: string;
  };
}

export default function SiteDetailsRoute({ params }: PageProps) {
  return (
    <SiteDetailsPage
      siteSlug={params.siteSlug}
      backHref={`/org/${params.org_slug}/air-quality/analytics`}
    />
  );
}
