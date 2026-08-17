'use client';

import { SiteDetailsPage } from '@/modules/data-download/components/site-details/SiteDetailsPage';

interface PageProps {
  params: {
    siteSlug: string;
  };
  searchParams?: {
    site_id?: string;
  };
}

export default function DataExportSiteDetailsRoute({
  params,
  searchParams,
}: PageProps) {
  return (
    <SiteDetailsPage
      siteSlug={params.siteSlug}
      siteId={searchParams?.site_id}
      backHref="/user/data-export"
    />
  );
}
