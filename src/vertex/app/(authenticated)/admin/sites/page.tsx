"use client";

import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import SitesTable from "@/components/features/sites/sites-list-table";
import { SiteStatsCards } from "@/components/features/sites/site-stats-cards";
import dynamic from "next/dynamic";

const CreateSiteForm = dynamic(() =>
  import('@/components/features/sites/create-site-form').then(mod => mod.CreateSiteForm),
  {
    ssr: false,
    loading: () => <div className="w-36 h-10 rounded-lg bg-gray-200 animate-pulse" />
  }
);

export default function SitesPage() {
  return (
    <RouteGuard permission="SITE_VIEW">
      <div>
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className="text-2xl font-semibold">Sites</h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize your monitoring sites
            </p>
          </div>

          <div className="flex gap-2">
            <CreateSiteForm />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="w-full">
            <SiteStatsCards />
          </div>

          <SitesTable />
        </div>
      </div>
    </RouteGuard>
  );
}
