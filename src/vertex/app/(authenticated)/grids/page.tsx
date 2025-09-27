"use client";

import { CreateGridForm } from "@/components/features/grids/create-grid";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import GridsTable from "@/components/features/grids/grids-list-table";

export default function GridsPage() {
  return (
    <RouteGuard permission="SITE_VIEW">
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Grids</h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize your monitoring grids
            </p>
          </div>
          <div className="flex gap-2">
            <CreateGridForm />
          </div>
        </div>

        <GridsTable />
      </div>
    </RouteGuard>
  );
}
