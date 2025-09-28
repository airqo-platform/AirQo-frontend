import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import ReusableTable, { TableColumn, TableItem } from "@/components/shared/table/ReusableTable";
import { useRouter } from "next/navigation";
import { Site } from "@/app/types/sites";
import { useSites } from "@/core/hooks/useSites";
import { useMemo, useRef, useEffect } from "react";
import { useServerSideTableState } from "@/core/hooks/useServerSideTableState";

interface SitesTableProps {
  itemsPerPage?: number;
  onSiteClick?: (site: Site) => void;
  multiSelect?: boolean;
  onSelectedSitesChange?: (selectedSites: Site[]) => void;
  className?: string;
}

type TableSite = TableItem<unknown>;

export default function SitesTable({
  itemsPerPage = 25,
  onSiteClick,
  multiSelect = false,
  onSelectedSitesChange,
  className,
}: SitesTableProps) {
  const router = useRouter();
  const tableRef = useRef<HTMLDivElement>(null);

  const {
    pagination, setPagination,
    searchTerm, setSearchTerm,
    sorting, setSorting
  } = useServerSideTableState({ initialPageSize: itemsPerPage });

  const { sites, meta, isFetching, error } = useSites({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: searchTerm,
    sortBy: sorting[0]?.id,
    order: sorting.length ? (sorting[0]?.desc ? "desc" : "asc") : undefined,
  });

  // Scroll to top of table when page changes
  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [pagination.pageIndex]);

  const pageCount = meta?.totalPages ?? 0;

  const handleSiteClick = (item: unknown) => {
    const site = item as Site;
    if (onSiteClick) onSiteClick(site);
    else if (site._id) router.push(`/sites/${site._id}`);
  };

  const handleSelectedItemsChange = (selectedIds: (string | number)[]) => {
    if (onSelectedSitesChange) {
      const selected = sites.filter((s) => s._id && selectedIds.includes(s._id));
      onSelectedSitesChange(selected);
    }
  };

  const sitesWithId: TableSite[] = useMemo(
    () =>
      sites
        .filter(
          (s): s is Site & { _id: string } =>
            typeof s._id === "string" && s._id.trim() !== ""
        )
        .map((s) => ({ ...s, id: s._id })),
    [sites]
  );

  const columns: TableColumn<TableSite>[] = [
    {
      key: "name",
      label: "Name",
      render: (value) => {
        const name = typeof value === "string" ? value : "";
        return <span className="uppercase max-w-60 w-full truncate" title={name}>{name}</span>;
      },
    },
    {
      key: "generated_name",
      label: "Site ID",
      render: (value) => {
        const id = typeof value === "string" ? value : "";
        return <span className="uppercase max-w-40 w-full truncate" title={id}>{id}</span>;
      },
    },
    {
      key: "description",
      label: "Description",
      render: (value) => {
        const desc = typeof value === "string" ? value : "";
        return (
          <span className="text-sm text-muted-foreground max-w-[280px] truncate lowercase" title={desc}>
            {desc}
          </span>
        );
      },
    },
    {
      key: "country",
      label: "Country",
      render: (value) => {
        const country = typeof value === "string" ? value : "";
        return <span className="uppercase max-w-32 w-full truncate" title={country}>{country}</span>;
      },
    },
    {
      key: "district",
      label: "District",
      render: (value) => {
        const district = typeof value === "string" ? value : "";
        return <span className="uppercase max-w-32 w-full truncate" title={district}>{district}</span>;
      },
    },
    {
      key: "isOnline",
      label: "Status",
      render: (isOnline) => {
        const status = Boolean(isOnline);
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {status ? "Online" : "Offline"}
          </span>
        );
      },
    },
  ];

  return (
    <div ref={tableRef} className={`space-y-4 ${className}`}>
      <ReusableTable
        title="Sites"
        data={sitesWithId}
        columns={columns}
        loading={isFetching}
        pageSize={itemsPerPage}
        onRowClick={handleSiteClick}
        multiSelect={multiSelect}
        onSelectedIdsChange={handleSelectedItemsChange}
        serverSidePagination
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        onSearchChange={setSearchTerm}
        searchTerm={searchTerm}
        sorting={sorting}
        onSortingChange={setSorting}
        searchable
        actions={multiSelect ? [
          {
            label: "Export Selected",
            value: "export",
            handler: () => {},
          },
        ] : []}
        emptyState={
          error ? (
            <div className="flex flex-col items-center gap-2">
              <ExclamationTriangleIcon className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">Unable to load sites</p>
              <p className="text-sm text-muted-foreground">
                {error?.message || "An unknown error occurred"}
              </p>
            </div>
          ) : (
            "No sites available"
          )
        }
      />
    </div>
  );
}
