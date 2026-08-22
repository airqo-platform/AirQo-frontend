'use client';

import { SiteDetailsPage } from '@/modules/data-download/components/site-details/SiteDetailsPage';

interface PageProps {
  params: {
    org_slug: string;
    siteSlug: string;
  };
  searchParams?: {
    site_id?: string;
  };
}

export default function OrganizationDataExportSiteDetailsRoute({
  params,
  searchParams,
}: PageProps) {
  return (
    <SiteDetailsPage
      siteSlug={params.siteSlug}
      siteId={searchParams?.site_id}
      backHref={`/org/${params.org_slug}/data-export`}
      mapHref={`/org/${params.org_slug}/map`}
    />
  );
}
