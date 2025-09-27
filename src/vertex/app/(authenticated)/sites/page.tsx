"use client";

import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import SitesTable from "@/components/features/sites/sites-list-table";
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
    <RouteGuard
      permission="SITE_VIEW"
      allowedContexts={['airqo-internal', 'external-org']}
    >
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Sites</h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize your monitoring sites
            </p>
          </div>

          <div className="flex gap-2">
            <CreateSiteForm />
          </div>
        </div>

        <div className="border rounded-lg">
          <SitesTable
          />
        </div>
      </div>
    </RouteGuard>
  );
}
