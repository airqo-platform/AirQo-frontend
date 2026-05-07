"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { AqPlus, AqRefreshCw01 } from "@airqo/icons-react";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { PERMISSIONS } from "@/core/permissions/constants";
import ReusableButton from "@/components/shared/button/ReusableButton";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SelectField from "@/components/ui/select-field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { useAppSelector } from "@/core/redux/hooks";
import type {
  DeviceBulkUpdateJob,
  DeviceBulkUpdateJobStatus,
  CreateDeviceBulkUpdateJobRequest,
  DeviceBulkUpdateJobFilter,
  DeviceBulkUpdateJobUpdateData,
} from "@/app/types/deviceBulkUpdateJobs";
import {
  useCreateDeviceBulkUpdateJob,
  useDeleteDeviceBulkUpdateJob,
  useDeviceBulkUpdateJob,
  useDeviceBulkUpdateJobs,
  useTriggerDeviceBulkUpdateJob,
  useUpdateDeviceBulkUpdateJob,
} from "@/core/hooks/useDeviceBulkUpdateJobs";

const STATUS_OPTIONS: Array<{ label: string; value: DeviceBulkUpdateJobStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Queued", value: "pending" },
  { label: "In progress", value: "running" },
  { label: "Paused", value: "paused" },
  { label: "Done", value: "completed" },
  { label: "Done with errors", value: "completed_with_errors" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
];

const terminalStatuses: DeviceBulkUpdateJobStatus[] = [
  "completed",
  "completed_with_errors",
  "failed",
  "cancelled",
];

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  try {
    return format(new Date(value), "MMM d, yyyy • HH:mm");
  } catch {
    return value;
  }
};

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

const ConfirmAction = ({
  title,
  description,
  confirmLabel,
  children,
  onConfirm,
  disabled,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  children: React.ReactNode;
  onConfirm: () => void;
  disabled?: boolean;
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <span className={disabled ? "opacity-60 pointer-events-none" : ""}>{children}</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const JobDetailsDialog = ({
  jobId,
  isOpen,
  onClose,
}: {
  jobId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { data, isFetching, error, refetch } = useDeviceBulkUpdateJob(jobId || undefined, {
    enabled: isOpen && !!jobId,
  });

  const job = data?.job;

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Update Job"
      subtitle={job ? job.name : "Loading job details"}
      size="3xl"
      showFooter={false}
      preventBackdropClose={false}
    >
      <div className="space-y-4">
        {error ? (
          <div className="text-sm text-red-600 dark:text-red-400">
            Failed to load job details.
          </div>
        ) : null}

        {!job ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <StatusBadge status={job.status} />
                {typeof job.progress === "number" ? (
                  <span className="text-sm text-muted-foreground">{job.progress}%</span>
                ) : null}
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? "Refreshing…" : "Refresh"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-semibold">Progress</p>
                <Progress value={job.progress ?? 0} />
                <p className="text-xs text-muted-foreground">
                  Processed {job.processedCount ?? 0}
                  {job.totalDevices ? ` / ${job.totalDevices}` : ""} • Failed {job.failedCount ?? 0}
                </p>
              </div>
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-semibold">Settings</p>
                <div className="text-sm text-muted-foreground">
                  <div>Batch size: {job.batchSize}</div>
                  <div>Dry run: {job.dryRun ? "Yes" : "No"}</div>
                  <div>Created by: {job.createdBy || "—"}</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-semibold">Filter</p>
              <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-auto">
                {JSON.stringify(job.filter, null, 2)}
              </pre>
            </div>

            <div className="rounded-lg border p-4 space-y-3">
              <p className="text-sm font-semibold">Update data</p>
              <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-auto">
                {JSON.stringify(job.updateData, null, 2)}
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 space-y-1">
                <p className="text-sm font-semibold">Timeline</p>
                <div className="text-sm text-muted-foreground">
                  <div>Created: {formatDateTime(job.createdAt)}</div>
                  <div>Started: {formatDateTime(job.startedAt)}</div>
                  <div>Last run: {formatDateTime(job.lastRunAt)}</div>
                </div>
              </div>
              <div className="rounded-lg border p-4 space-y-1">
                <p className="text-sm font-semibold">Errors</p>
                <div className="text-sm text-muted-foreground">
                  <div>Failed IDs: {job.failedIds?.length ?? 0}</div>
                  {job.status === "completed_with_errors" ? (
                    <div className="text-amber-600 dark:text-amber-400">
                      Some batches failed; review failed IDs.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ReusableDialog>
  );
};

type KVRow = { key: string; value: string };

const FILTER_FIELDS: Array<{ label: string; value: keyof DeviceBulkUpdateJobFilter }> = [
  { label: "Network", value: "network" },
  { label: "Category", value: "category" },
  { label: "Status", value: "status" },
  { label: "Deployment type", value: "deployment_type" },
  { label: "Mobility", value: "mobility" },
  { label: "Is active", value: "isActive" },
  { label: "Owner", value: "owner" },
  { label: "Manufacturer", value: "device_manufacturer" },
  { label: "Product name", value: "product_name" },
  { label: "Long name", value: "long_name" },
  { label: "Device number", value: "device_number" },
];

const UPDATE_FIELDS: Array<{ label: string; value: keyof DeviceBulkUpdateJobUpdateData }> = [
  { label: "Category", value: "category" },
  { label: "Mobility", value: "mobility" },
  { label: "Owner", value: "owner" },
  { label: "Description", value: "description" },
  { label: "Product name", value: "product_name" },
  { label: "Manufacturer", value: "device_manufacturer" },
  { label: "Collocation", value: "collocation" },
];

const parseFilterValue = (key: keyof DeviceBulkUpdateJobFilter, raw: string): any => {
  if (key === "isActive") return raw === "true";
  if (key === "device_number") return Number(raw);
  return raw;
};

const CreateJobDialog = ({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (job: DeviceBulkUpdateJob) => void;
}) => {
  const userDetails = useAppSelector((s) => s.user.userDetails);
  const createMutation = useCreateDeviceBulkUpdateJob();
  const triggerMutation = useTriggerDeviceBulkUpdateJob();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tenant, setTenant] = useState("airqo");
  const [batchSize, setBatchSize] = useState(30);
  const [dryRun, setDryRun] = useState(true);

  const [filterField, setFilterField] = useState<keyof DeviceBulkUpdateJobFilter>("network");
  const [filterValue, setFilterValue] = useState("");
  const [filterRows, setFilterRows] = useState<KVRow[]>([]);

  const [updateField, setUpdateField] = useState<keyof DeviceBulkUpdateJobUpdateData>("category");
  const [updateValue, setUpdateValue] = useState("");
  const [updateRows, setUpdateRows] = useState<KVRow[]>([]);

  const createdBy = userDetails?.email || userDetails?.userName || "";

  const filterObject = useMemo(() => {
    const obj: DeviceBulkUpdateJobFilter = {};
    for (const row of filterRows) {
      obj[row.key as keyof DeviceBulkUpdateJobFilter] = parseFilterValue(
        row.key as keyof DeviceBulkUpdateJobFilter,
        row.value,
      );
    }
    return obj;
  }, [filterRows]);

  const updateObject = useMemo(() => {
    const obj: DeviceBulkUpdateJobUpdateData = {};
    for (const row of updateRows) {
      (obj as any)[row.key] = row.value;
    }
    return obj;
  }, [updateRows]);

  const canSubmit =
    name.trim().length > 0 &&
    Object.keys(filterObject).length > 0 &&
    Object.keys(updateObject).length > 0 &&
    batchSize >= 1 &&
    batchSize <= 100;

  const resetAndClose = () => {
    setName("");
    setDescription("");
    setBatchSize(30);
    setDryRun(true);
    setFilterRows([]);
    setUpdateRows([]);
    setFilterValue("");
    setUpdateValue("");
    onClose();
  };

  const handleCreate = async (triggerNow: boolean) => {
    const payload: CreateDeviceBulkUpdateJobRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      filter: filterObject,
      updateData: updateObject,
      batchSize,
      dryRun,
      createdBy: createdBy || undefined,
    };

    const result = await createMutation.mutateAsync({ payload, tenant });
    onCreated(result.job);

    if (triggerNow) {
      await triggerMutation.mutateAsync({ jobId: result.job._id, tenant });
    }

    resetAndClose();
  };

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Create bulk update job"
      subtitle="Define a device filter and the fields to update. Use dry run to preview without writing."
      size="4xl"
      showFooter={false}
      preventBackdropClose={createMutation.isPending || triggerMutation.isPending}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Job name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Reclassify usembassy devices" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tenant</label>
            <Input value={tenant} onChange={(e) => setTenant(e.target.value)} placeholder="airqo" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description for audit trail" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Batch size</label>
            <Input
              type="number"
              min={1}
              max={100}
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-3 md:col-span-2">
            <Switch checked={dryRun} onCheckedChange={(v) => setDryRun(!!v)} />
            <div>
              <div className="text-sm font-medium">Dry run</div>
              <div className="text-xs text-muted-foreground">Preview affected devices without writing changes</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Filter</div>
              <div className="text-xs text-muted-foreground">Must match at least 1 device (empty filter is rejected)</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Field</label>
              <SelectField
                value={String(filterField)}
                onChange={(e) => setFilterField(e.target.value as any)}
                placeholder="Select field"
              >
                {FILTER_FIELDS.map((f) => (
                  <option key={String(f.value)} value={String(f.value)}>
                    {f.label}
                  </option>
                ))}
              </SelectField>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Value</label>
              <Input value={filterValue} onChange={(e) => setFilterValue(e.target.value)} placeholder="Value" />
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                if (!filterValue.trim()) return;
                setFilterRows((rows) => [
                  ...rows.filter((r) => r.key !== filterField),
                  { key: String(filterField), value: filterValue.trim() },
                ]);
                setFilterValue("");
              }}
            >
              Add filter
            </Button>
          </div>

          {filterRows.length > 0 ? (
            <div className="space-y-2">
              {filterRows.map((row) => (
                <div key={row.key} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                  <div className="text-sm">
                    <span className="font-medium">{row.key}</span>: <span className="text-muted-foreground">{row.value}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFilterRows((rows) => rows.filter((r) => r.key !== row.key))}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">No filters added yet.</div>
          )}
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <div>
            <div className="text-sm font-semibold">Update data</div>
            <div className="text-xs text-muted-foreground">Fields that will be applied to all matched devices</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Field</label>
              <SelectField
                value={String(updateField)}
                onChange={(e) => setUpdateField(e.target.value as any)}
                placeholder="Select field"
              >
                {UPDATE_FIELDS.map((f) => (
                  <option key={String(f.value)} value={String(f.value)}>
                    {f.label}
                  </option>
                ))}
              </SelectField>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Value</label>
              <Input value={updateValue} onChange={(e) => setUpdateValue(e.target.value)} placeholder="Value" />
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                if (!updateValue.trim()) return;
                setUpdateRows((rows) => [
                  ...rows.filter((r) => r.key !== updateField),
                  { key: String(updateField), value: updateValue.trim() },
                ]);
                setUpdateValue("");
              }}
            >
              Add update
            </Button>
          </div>

          {updateRows.length > 0 ? (
            <div className="space-y-2">
              {updateRows.map((row) => (
                <div key={row.key} className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
                  <div className="text-sm">
                    <span className="font-medium">{row.key}</span>: <span className="text-muted-foreground">{row.value}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setUpdateRows((rows) => rows.filter((r) => r.key !== row.key))}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">No update fields added yet.</div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={resetAndClose} disabled={createMutation.isPending || triggerMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => handleCreate(false)}
            disabled={!canSubmit || createMutation.isPending || triggerMutation.isPending}
          >
            {createMutation.isPending ? "Creating…" : "Create job"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleCreate(true)}
            disabled={!canSubmit || createMutation.isPending || triggerMutation.isPending}
          >
            {triggerMutation.isPending ? "Triggering…" : "Create & trigger"}
          </Button>
        </div>
      </div>
    </ReusableDialog>
  );
};

export default function BulkUpdateJobsPage() {
  const [status, setStatus] = useState<DeviceBulkUpdateJobStatus | "all">("all");
  const [skip, setSkip] = useState(0);
  const limit = 20;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const listQuery = useDeviceBulkUpdateJobs({
    status: status === "all" ? undefined : status,
    limit,
    skip,
    enabled: true,
  });

  const triggerMutation = useTriggerDeviceBulkUpdateJob();
  const updateMutation = useUpdateDeviceBulkUpdateJob();
  const deleteMutation = useDeleteDeviceBulkUpdateJob();

  const jobs = listQuery.data?.jobs ?? [];
  const meta = listQuery.data?.meta;

  const openDetails = (jobId: string) => {
    setSelectedJobId(jobId);
    setIsDetailsOpen(true);
  };

  return (
    <RouteGuard permission={PERMISSIONS.NETWORK.UPDATE}>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Device Bulk Update Jobs</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create, run, and audit bulk device updates with progress tracking and resumable execution.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ReusableButton
              variant="outlined"
              Icon={AqRefreshCw01}
              onClick={() => listQuery.refetch()}
              disabled={listQuery.isFetching}
            >
              Refresh
            </ReusableButton>
            <ReusableButton Icon={AqPlus} onClick={() => setIsCreateOpen(true)}>
              Create job
            </ReusableButton>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="w-full md:w-72 space-y-2">
            <label className="text-sm font-medium">Status</label>
            <SelectField
              value={String(status)}
              onChange={(e) => {
                setStatus(e.target.value as any);
                setSkip(0);
              }}
              placeholder="Filter by status"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectField>
          </div>
          <div className="text-xs text-muted-foreground">
            {meta ? `${meta.totalResults} result(s) • Page ${meta.page} of ${meta.totalPages}` : null}
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          {listQuery.isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : listQuery.error ? (
            <div className="p-6">
              <EmptyState
                icon={<AqRefreshCw01 className="h-10 w-10 text-muted-foreground" />}
                title="Failed to load jobs"
                description="Please try again. If the issue persists, check your network connection or permissions."
              />
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<AqPlus className="h-10 w-10 text-muted-foreground" />}
                title="No bulk update jobs yet"
                description="Create a job to apply bulk updates to a filtered set of devices."
              />
              <div className="mt-4">
                <ReusableButton Icon={AqPlus} onClick={() => setIsCreateOpen(true)}>
                  Create your first job
                </ReusableButton>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => {
                  const isTerminal = terminalStatuses.includes(job.status);
                  const canTrigger = job.status === "pending" || job.status === "paused";
                  const canPause = job.status === "running";
                  const canResume = job.status === "paused";
                  const canCancel = job.status !== "cancelled" && !isTerminal && job.status !== "running";
                  const canDelete = job.status !== "running";

                  return (
                    <TableRow key={job._id} className="cursor-pointer" onClick={() => openDetails(job._id)}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{job.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {job.description || "—"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={job.status} />
                          {job.dryRun ? <Badge variant="outline">Dry run</Badge> : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2 min-w-[180px]">
                          <Progress value={job.progress ?? 0} />
                          <div className="text-xs text-muted-foreground">
                            {job.processedCount ?? 0}
                            {job.totalDevices ? ` / ${job.totalDevices}` : ""} • Failed {job.failedCount ?? 0}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(job.createdAt)}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!canTrigger || triggerMutation.isPending}
                            onClick={() => triggerMutation.mutate({ jobId: job._id })}
                          >
                            Trigger
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!canPause || updateMutation.isPending}
                            onClick={() => updateMutation.mutate({ jobId: job._id, payload: { status: "paused" } })}
                          >
                            Pause
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!canResume || updateMutation.isPending}
                            onClick={async () => {
                              await updateMutation.mutateAsync({ jobId: job._id, payload: { status: "pending" } });
                              triggerMutation.mutate({ jobId: job._id });
                            }}
                          >
                            Resume
                          </Button>

                          <ConfirmAction
                            title="Cancel job?"
                            description="Cancelling is irreversible. You will need to create a new job to run again."
                            confirmLabel="Cancel job"
                            onConfirm={() => updateMutation.mutate({ jobId: job._id, payload: { status: "cancelled" } })}
                            disabled={!canCancel || updateMutation.isPending}
                          >
                            <Button size="sm" variant="outline" disabled={!canCancel || updateMutation.isPending}>
                              Cancel
                            </Button>
                          </ConfirmAction>

                          <ConfirmAction
                            title="Delete job?"
                            description="This deletes the job permanently. Running jobs must be paused or cancelled first."
                            confirmLabel="Delete"
                            onConfirm={() => deleteMutation.mutate({ jobId: job._id })}
                            disabled={!canDelete || deleteMutation.isPending}
                          >
                            <Button size="sm" variant="destructive" disabled={!canDelete || deleteMutation.isPending}>
                              Delete
                            </Button>
                          </ConfirmAction>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {meta && meta.totalPages > 1 ? (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              disabled={skip <= 0}
              onClick={() => setSkip((s) => Math.max(0, s - limit))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={skip + limit >= meta.total}
              onClick={() => setSkip((s) => s + limit)}
            >
              Next
            </Button>
          </div>
        ) : null}

        <CreateJobDialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={(job) => {
            setSelectedJobId(job._id);
            setIsDetailsOpen(true);
          }}
        />

        <JobDetailsDialog
          jobId={selectedJobId}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
        />
      </div>
    </RouteGuard>
  );
}
