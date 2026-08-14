'use client';

import { SiteDetailsPage } from '@/modules/analytics/components/explorer/SiteDetailsPage';

interface PageProps {
  params: {
    siteSlug: string;
  };
}

export default function SiteDetailsRoute({ params }: PageProps) {
  return (
    <SiteDetailsPage
      siteSlug={params.siteSlug}
      backHref="/user/air-quality/analytics"
    />
  );
}
