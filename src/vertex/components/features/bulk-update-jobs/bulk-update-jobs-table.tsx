"use client";

import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { AqFilterLines } from "@airqo/icons-react";
import { Check, X } from "lucide-react";
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import ReusableButton from "@/components/shared/button/ReusableButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReusableTable from "@/components/shared/table/ReusableTable";
import { useServerSideTableState } from "@/core/hooks/useServerSideTableState";
import { useDeviceBulkUpdateJobs } from "@/core/hooks/useDeviceBulkUpdateJobs";
import type { DeviceBulkUpdateJob, DeviceBulkUpdateJobStatus } from "@/app/types/deviceBulkUpdateJobs";
import { getColumns, type ConfirmActionRenderer, type TableBulkUpdateJob } from "./utils/table-columns";

interface BulkUpdateJobsTableProps {
  tenant: string;
  itemsPerPage?: number;
  onRowClick: (jobId: string) => void;
  confirmAction: ConfirmActionRenderer;
  isTriggering: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onTrigger: (jobId: string, tenant: string) => void;
  onPause: (jobId: string, tenant: string) => void;
  onResume: (jobId: string, tenant: string) => Promise<void>;
  onCancel: (jobId: string, tenant: string) => void;
  onDelete: (jobId: string, tenant: string) => void;
  className?: string;
}

export default function BulkUpdateJobsTable({
  tenant,
  itemsPerPage = 20,
  onRowClick,
  confirmAction,
  isTriggering,
  isUpdating,
  isDeleting,
  onTrigger,
  onPause,
  onResume,
  onCancel,
  onDelete,
  className,
}: BulkUpdateJobsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") || "") as DeviceBulkUpdateJobStatus | "";

  const { pagination, setPagination } = useServerSideTableState({
    initialPageSize: itemsPerPage,
  });

  const { data, isFetching, error } = useDeviceBulkUpdateJobs({
    tenant,
    status: status ? (status as DeviceBulkUpdateJobStatus) : undefined,
    limit: pagination.pageSize,
    skip: pagination.pageIndex * pagination.pageSize,
    enabled: true,
  });

  const jobs = data?.jobs ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? meta?.totalResults ?? 0;
  const pageCount = pagination.pageSize > 0 ? Math.ceil(total / pagination.pageSize) : 0;

  const tableJobs: TableBulkUpdateJob[] = useMemo(() => {
    return jobs
      .filter((j: DeviceBulkUpdateJob) => typeof j._id === "string" && j._id.trim() !== "")
      .map((j) => ({ ...(j as DeviceBulkUpdateJob), id: j._id }));
  }, [jobs]);

  const columns = useMemo(
    () =>
      getColumns({
        tenant,
        confirmAction,
        isTriggering,
        isUpdating,
        isDeleting,
        onTrigger,
        onPause,
        onResume,
        onCancel,
        onDelete,
      }),
    [
      tenant,
      confirmAction,
      isTriggering,
      isUpdating,
      isDeleting,
      onTrigger,
      onPause,
      onResume,
      onCancel,
      onDelete,
    ],
  );

  return (
    <div className={`space-y-4 ${className || ""}`}>
      <ReusableTable<TableBulkUpdateJob>
        title="Bulk Update Jobs"
        data={tableJobs}
        columns={columns}
        loading={isFetching}
        pageSize={itemsPerPage}
        onRowClick={(item) => onRowClick(item._id)}
        customHeaderContent={
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 gap-2 bg-white dark:bg-[#1d1f20] relative"
                >
                  <AqFilterLines className="w-3.5 h-3.5" />
                  <span>Status</span>
                  {status && (
                    <span className="flex items-center justify-center w-5 h-5 ml-1 text-[10px] font-bold text-white bg-blue-600 rounded-full">
                      1
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[220px]">
                <DropdownMenuItem
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("status");
                    router.push(`?${params.toString()}`);
                  }}
                  className="justify-between"
                >
                  All
                  {!status && <Check className="w-4 h-4 text-blue-600" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {(
                  [
                    ["pending", "Queued"],
                    ["running", "In progress"],
                    ["paused", "Paused"],
                    ["completed", "Done"],
                    ["completed_with_errors", "Done with errors"],
                    ["failed", "Failed"],
                    ["cancelled", "Cancelled"],
                  ] as Array<[DeviceBulkUpdateJobStatus, string]>
                ).map(([value, label]) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set("status", value);
                      router.push(`?${params.toString()}`);
                    }}
                    className={`justify-between ${status === value ? "font-medium bg-accent" : ""}`}
                  >
                    {label}
                    {status === value && <Check className="w-4 h-4 text-blue-600" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {status && (
              <ReusableButton
                variant="text"
                className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-transparent"
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("status");
                  router.push(`?${params.toString()}`);
                }}
                Icon={X}
              >
                Clear
              </ReusableButton>
            )}
          </div>
        }
        emptyState={
          error ? (
            <div className="flex flex-col items-center gap-2">
              <ExclamationTriangleIcon className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">Unable to load jobs</p>
              <p className="text-sm text-muted-foreground">
                {(error as Error)?.message || "An unknown error occurred"}
              </p>
            </div>
          ) : (
            "No jobs available"
          )
        }
        serverSidePagination
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        searchable={false}
        filterable={false}
        sortable={false}
        exportable={false}
      />
    </div>
  );
}
