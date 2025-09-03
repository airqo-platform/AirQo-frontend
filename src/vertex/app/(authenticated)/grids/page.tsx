"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CreateGridForm } from "@/components/features/grids/create-grid";
import { useGrids } from "@/core/hooks/useGrids";
import { Grid } from "@/app/types/grids";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import ReusableTable, {
  TableColumn,
  TableItem,
} from "@/components/shared/table/ReusableTable";
import moment from "moment";

type TableGrid = TableItem<unknown> & Grid;

export default function GridsPage() {
  const router = useRouter();
  const { grids, isLoading: isGridsLoading } = useGrids();

  if (isGridsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const data: TableGrid[] = (grids || [])
  .filter((g: Grid): g is Grid & { _id: string } => typeof g._id === "string" && g._id.trim() !== "")
  .map((g: Grid) => ({ ...g, id: g._id }));

  const columns: TableColumn<TableGrid>[] = [
    {
      key: "name",
      label: "Grid Name",
      render: (value) => String(value ?? "").toUpperCase(),
      sortable: true,
    },
    {
      key: "numberOfSites",
      label: "Number of sites",
      render: (v) => String(v ?? 0),
      sortable: true,
    },
    {
      key: "admin_level",
      label: "Admin level",
      render: (v) => String(v ?? ""),
      sortable: true,
    },
    {
      key: "visibility",
      label: "Visibility",
      render: (v) => (v ? "Visible" : "Hidden"),
      sortable: true,
    },
    {
      key: "createdAt",
      label: "Date created",
      render: (v) =>
        v
          ? moment(v).format("MMM D YYYY, H:mm A")
          : "",
      sortable: true,
    },
  ];

  const handleRowClick = (item: unknown) => {
    const grid = item as Grid;
    if (grid._id) router.push(`/grids/${grid._id}`);
  };

  return (
    <RouteGuard permission="SITE_VIEW">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Grid Registry</h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize your monitoring grids
            </p>
          </div>
          <div className="flex gap-2">
            <CreateGridForm />
          </div>
        </div>

        <ReusableTable
          title="Grids"
          data={data}
          columns={columns}
          loading={isGridsLoading}
          pageSize={8}
          onRowClick={handleRowClick}
          searchableColumns={["name", "admin_level"]}
        />
      </div>
    </RouteGuard>
  );
}
