"use client";

import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import SitesTable from "@/components/features/sites/sites-list-table";
import { PERMISSIONS } from "@/core/permissions/constants";

export default function SitesOverviewPage() {
  return (
    <RouteGuard permission={PERMISSIONS.SITE.VIEW}>
      <div>
        <div className="mb-3">
          <div>
            <h1 className="text-2xl font-semibold">Sites</h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize your monitoring sites
            </p>
          </div>

        </div>

        <div className="flex flex-col gap-6">
          <SitesTable basePath="/sites" />
        </div>
      </div>
    </RouteGuard>
  );
}
