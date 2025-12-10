"use client";

import { useRouter } from "next/navigation";
import { useGrids } from "@/core/hooks/useGrids";
import { Grid } from "@/app/types/grids";
import ReusableTable, {
  TableColumn,
  TableItem,
} from "@/components/shared/table/ReusableTable";
import { format, parseISO } from "date-fns";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useServerSideTableState } from "@/core/hooks/useServerSideTableState";
import { useMemo, useRef, useEffect } from "react";

type TableGrid = TableItem<unknown> & Grid;

interface GridsTableProps {
  itemsPerPage?: number;
  onGridClick?: (grid: Grid) => void;
  className?: string;
}

export default function GridsTable({
  itemsPerPage = 25,
  onGridClick,
  className,
}: GridsTableProps) {
  const router = useRouter();
  const tableRef = useRef<HTMLDivElement>(null);

  const {
    pagination, setPagination,
    searchTerm, setSearchTerm,
    sorting, setSorting
  } = useServerSideTableState({ initialPageSize: itemsPerPage });

  const { grids, meta, isFetching, error } = useGrids({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: searchTerm,
    sortBy: sorting[0]?.id,
    order: sorting.length ? (sorting[0]?.desc ? "desc" : "asc") : undefined,
  });

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [pagination.pageIndex]);

  const pageCount = meta?.totalPages ?? 0;

  useEffect(() => {
    if (pageCount > 0 && pagination.pageIndex >= pageCount) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: Math.max(0, pageCount - 1),
      }));
    }
  }, [pageCount, pagination.pageIndex, setPagination]);


  const handleRowClick = (item: unknown) => {
    const grid = item as Grid;
    if (onGridClick) onGridClick(grid);
    else if (grid._id) router.push(`/admin/grids/${grid._id}`);
  };

  const data: TableGrid[] = useMemo(() => (grids || [])
    .filter((g: Grid): g is Grid & { _id: string } => typeof g._id === "string" && g._id.trim() !== "")
    .map((g: Grid) => ({ ...g, id: g._id })), [grids]);

  const columns: TableColumn<TableGrid>[] = [
    { key: "name", label: "Grid Name", render: (value) => String(value ?? "").toUpperCase(), sortable: true },
    { key: "numberOfSites", label: "Number of sites", render: (v) => String(v ?? 0), sortable: true },
    { key: "admin_level", label: "Admin level", render: (v) => String(v ?? ""), sortable: true },
    { key: "visibility", label: "Visibility", render: (v) => (v ? "Visible" : "Hidden"), sortable: true },
    { key: "createdAt", label: "Date created", render: (v) => v ? format(parseISO(v as string), "MMM d yyyy, h:mm a") : "", sortable: true },
  ];

  return (
    <div ref={tableRef} className={className ? `space-y-4 ${className}` : "space-y-4"}>
      <ReusableTable
        title="Grids"
        data={data}
        columns={columns}
        loading={isFetching}
        onRowClick={handleRowClick}
        searchableColumns={["name", "admin_level"]}
        emptyState={
          error ? (
            <div className="flex flex-col items-center gap-2">
              <ExclamationTriangleIcon className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">Unable to load grids</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          ) : "No grids available"
        }
        serverSidePagination
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        onSearchChange={setSearchTerm}
        searchTerm={searchTerm}
        sorting={sorting}
        onSortingChange={setSorting}
        searchable
      />
    </div>
  );
}