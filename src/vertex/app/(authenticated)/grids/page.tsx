"use client";

import { useRouter } from "next/navigation";
import { CreateGridForm } from "@/components/features/grids/create-grid";
import { useGrids } from "@/core/hooks/useGrids";
import { Grid } from "@/app/types/grids";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import ReusableTable, {
  TableColumn,
  TableItem,
} from "@/components/shared/table/ReusableTable";
import moment from "moment";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

type TableGrid = TableItem<unknown> & Grid;


export default function GridsPage() {
  const router = useRouter();
  const { grids, isLoading: isGridsLoading, error } = useGrids();

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
          ? moment(v).format("MMM D YYYY, h:mm A")
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

        <ReusableTable
          title="Grids"
          data={data}
          columns={columns}
          loading={isGridsLoading}
          pageSize={8}
          onRowClick={handleRowClick}
          searchableColumns={["name", "admin_level"]}
          emptyState={
            error ? (
              <div className="flex flex-col items-center gap-2">
                <ExclamationTriangleIcon className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Unable to load grids</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
              </div>
            ) : (
              "No grids available"
            )
          }
        />
      </div>
    </RouteGuard>
  );
}
