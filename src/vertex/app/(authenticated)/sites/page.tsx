"use client";

import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { useSites } from "@/core/hooks/useSites";
import { CreateSiteForm } from "@/components/features/sites/create-site-form";
import SitesTable from "@/components/features/sites/sites-list-table";

export default function SitesPage() {
  const { sites, isLoading, error } = useSites();

  return (
    <RouteGuard 
      permission="SITE_VIEW"
      allowedContexts={['airqo-internal', 'external-org']}
    >
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Sites</h1>
          <div className="flex gap-2">
            <CreateSiteForm disabled={isLoading || !!error} />
          </div>
        </div>

        <div className="border rounded-lg">
          <SitesTable
            sites={sites}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </RouteGuard>
  );
}
