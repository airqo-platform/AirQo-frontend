"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import type { TableColumn, TableItem } from "@/components/shared/table/ReusableTable";
import type { DeviceBulkUpdateJob, DeviceBulkUpdateJobStatus } from "@/app/types/deviceBulkUpdateJobs";

export type TableBulkUpdateJob = DeviceBulkUpdateJob & TableItem;

const TERMINAL_STATUSES: DeviceBulkUpdateJobStatus[] = [
  "completed",
  "completed_with_errors",
  "failed",
  "cancelled",
];

const StatusBadge = ({ status }: { status: DeviceBulkUpdateJobStatus }) => {
  const variant =
    status === "completed"
      ? "default"
      : status === "running"
        ? "secondary"
        : status === "completed_with_errors"
          ? "outline"
          : status === "failed"
            ? "destructive"
            : "outline";

  const label =
    status === "pending"
      ? "Queued"
      : status === "running"
        ? "In progress"
        : status === "completed"
          ? "Done"
          : status === "completed_with_errors"
            ? "Done with errors"
            : status === "failed"
              ? "Failed"
              : status === "paused"
                ? "Paused"
                : "Cancelled";

  return <Badge variant={variant as any}>{label}</Badge>;
};

export type ConfirmActionRenderer = (args: {
  title: string;
  description: string;
  confirmLabel: string;
  disabled?: boolean;
  onConfirm: () => void;
  children: React.ReactNode;
}) => React.ReactNode;

export const formatJobDateTime = (value?: string) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export const getColumns = ({
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
}: {
  tenant: string;
  confirmAction: ConfirmActionRenderer;
  isTriggering: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onTrigger: (jobId: string, tenant: string) => void;
  onPause: (jobId: string, tenant: string) => void;
  onResume: (jobId: string, tenant: string) => Promise<void>;
  onCancel: (jobId: string, tenant: string) => void;
  onDelete: (jobId: string, tenant: string) => void;
}): TableColumn<TableBulkUpdateJob>[] => [
  {
    key: "name",
    label: "Job",
    className: "w-[360px] min-w-[360px]",
    render: (_value, item) => (
      <div className="space-y-1">
        <div className="font-medium">{item.name}</div>
        <div className="text-xs text-muted-foreground line-clamp-1">
          {item.description || "—"}
        </div>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    className: "w-[200px] min-w-[200px]",
    render: (_value, item) => (
      <div className="flex items-center gap-2">
        <StatusBadge status={item.status} />
        {item.dryRun ? <Badge variant="outline">Dry run</Badge> : null}
      </div>
    ),
  },
  {
    key: "progress",
    label: "Progress",
    className: "w-[320px] min-w-[320px]",
    render: (_value, item) => (
      <div className="space-y-2 min-w-[180px]">
        <Progress value={item.progress ?? 0} />
        <div className="text-xs text-muted-foreground">
          {item.processedCount ?? 0}
          {item.totalDevices ? ` / ${item.totalDevices}` : ""} • Failed {item.failedCount ?? 0}
        </div>
      </div>
    ),
  },
  {
    key: "createdAt",
    label: "Created",
    className: "w-[220px] min-w-[220px]",
    render: (value) => (
      <span className="text-sm text-muted-foreground">
        {typeof value === "string" ? formatJobDateTime(value) : "—"}
      </span>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    className: "w-[120px] min-w-[120px] text-right",
    render: (_value, item) => {
      const isTerminal = TERMINAL_STATUSES.includes(item.status);
      const canTrigger = item.status === "pending" || item.status === "paused";
      const canPause = item.status === "running";
      const canResume = item.status === "paused";
      const canCancel = item.status === "pending" || item.status === "paused";
      const canDelete = item.status !== "running";

      return (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                data-no-rowclick
                aria-label="Job actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                disabled={!canTrigger || isTriggering}
                onSelect={(e) => {
                  e.preventDefault();
                  if (canTrigger && !isTriggering) onTrigger(item._id, tenant);
                }}
              >
                Trigger
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!canPause || isUpdating}
                onSelect={(e) => {
                  e.preventDefault();
                  if (canPause && !isUpdating) onPause(item._id, tenant);
                }}
              >
                Pause
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!canResume || isUpdating}
                onSelect={(e) => {
                  e.preventDefault();
                  if (canResume && !isUpdating) void onResume(item._id, tenant);
                }}
              >
                Resume
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {confirmAction({
                title: "Cancel job?",
                description: "Cancelling is irreversible. You will need to create a new job to run again.",
                confirmLabel: "Cancel job",
                disabled: !canCancel || isUpdating || isTerminal,
                onConfirm: () => onCancel(item._id, tenant),
                children: (
                  <DropdownMenuItem
                    disabled={!canCancel || isUpdating || isTerminal}
                    onSelect={(e) => e.preventDefault()}
                    className="text-amber-600 focus:text-amber-700 dark:text-amber-400"
                  >
                    Cancel
                  </DropdownMenuItem>
                ),
              })}

              {confirmAction({
                title: "Delete job?",
                description: "This deletes the job permanently. Running jobs must be paused or cancelled first.",
                confirmLabel: "Delete",
                disabled: !canDelete || isDeleting,
                onConfirm: () => onDelete(item._id, tenant),
                children: (
                  <DropdownMenuItem
                    disabled={!canDelete || isDeleting}
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600 focus:text-red-700 dark:text-red-400"
                  >
                    Delete
                  </DropdownMenuItem>
                ),
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
