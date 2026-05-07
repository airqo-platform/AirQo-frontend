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
import { Button } from "@/components/ui/button";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import SelectField from "@/components/ui/select-field";
import BulkUpdateJobsTable from "@/components/features/bulk-update-jobs/bulk-update-jobs-table";
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
import { useQueryClient } from "@tanstack/react-query";
import {
  DEVICE_CATEGORIES,
  DEVICE_DEPLOYMENT_TYPES,
  DEVICE_IS_ACTIVE_OPTIONS,
  DEVICE_MOBILITY_TYPES,
  DEVICE_STATUSES,
} from "@/core/constants/devices";
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
import { useNetworks } from "@/core/hooks/useNetworks";

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
  tenant,
}: {
  jobId: string | null;
  isOpen: boolean;
  onClose: () => void;
  tenant: string;
}) => {
  const queryClient = useQueryClient();
  const { data, isFetching, error, refetch } = useDeviceBulkUpdateJob(jobId || undefined, {
    enabled: isOpen && !!jobId,
    tenant,
  });

  const job = data?.job;

  React.useEffect(() => {
    if (!job) return;
    if (job.dryRun) return;
    if (!terminalStatuses.includes(job.status)) return;
    queryClient.invalidateQueries({ queryKey: ["devices"] });
    queryClient.invalidateQueries({ queryKey: ["deviceCount"] });
  }, [job?.status, job?.dryRun, queryClient]);

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

type SelectChangeEvent = { target: { value: string | number | readonly string[] } };

const filterValueKind = (key: keyof DeviceBulkUpdateJobFilter) => {
  if (key === "network") return "select-network";
  if (key === "category") return "select-category";
  if (key === "status") return "select-status";
  if (key === "deployment_type") return "select-deployment-type";
  if (key === "mobility") return "select-mobility";
  if (key === "isActive") return "select-active";
  if (key === "device_number") return "number";
  return "text";
};

const updateValueKind = (key: keyof DeviceBulkUpdateJobUpdateData) => {
  if (key === "category") return "select-category";
  if (key === "mobility") return "select-mobility";
  return "text";
};

const CreateJobDialog = ({
  isOpen,
  onClose,
  onCreated,
  tenant,
  onTenantChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (job: DeviceBulkUpdateJob) => void;
  tenant: string;
  onTenantChange: (value: string) => void;
}) => {
  const userDetails = useAppSelector((s) => s.user.userDetails);
  const createMutation = useCreateDeviceBulkUpdateJob();
  const triggerMutation = useTriggerDeviceBulkUpdateJob();
  const { networks, isLoading: isLoadingNetworks } = useNetworks();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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
    const resolvedTenant = tenant?.trim() || "airqo";
    const payload: CreateDeviceBulkUpdateJobRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      filter: filterObject,
      updateData: updateObject,
      batchSize,
      dryRun,
      createdBy: createdBy || undefined,
    };

    const result = await createMutation.mutateAsync({ payload, tenant: resolvedTenant });
    onCreated(result.job);

    if (triggerNow) {
      await triggerMutation.mutateAsync({ jobId: result.job._id, tenant: resolvedTenant });
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
        {!canSubmit ? (
          <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Add at least one filter and one update field. Job name is required.
          </div>
        ) : null}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReusableInputField
            label="Job name"
            required
            value={name}
            onChange={(e) => setName((e.target as HTMLInputElement).value)}
            placeholder="e.g. Reclassify usembassy devices"
            description="Give the job a descriptive name for audit and future search."
          />
          <ReusableInputField
            label="Tenant"
            value={tenant}
            onChange={(e) => onTenantChange((e.target as HTMLInputElement).value)}
            placeholder="airqo"
            description="Defaults to airqo. Change only if you manage multiple tenants."
            disabled
          />
          <ReusableInputField
            as="textarea"
            label="Description"
            value={description}
            onChange={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
            placeholder="Optional description for audit trail"
            containerClassName="md:col-span-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <ReusableInputField
            label="Batch size"
            type="number"
            min={1}
            max={100}
            value={batchSize}
            onChange={(e) => setBatchSize(Number((e.target as HTMLInputElement).value))}
            description="How many devices per server batch (1–100)."
          />
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
                onChange={(e: SelectChangeEvent) => setFilterField(String(e.target.value) as any)}
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
              {filterValueKind(filterField) === "text" ? (
                <ReusableInputField
                  value={filterValue}
                  onChange={(e) => setFilterValue((e.target as HTMLInputElement).value)}
                  placeholder="Value"
                />
              ) : filterValueKind(filterField) === "number" ? (
                <ReusableInputField
                  type="number"
                  value={filterValue}
                  onChange={(e) => setFilterValue((e.target as HTMLInputElement).value)}
                  placeholder="Number"
                />
              ) : filterValueKind(filterField) === "select-network" ? (
                <SelectField
                  value={filterValue}
                  onChange={(e: SelectChangeEvent) => setFilterValue(String(e.target.value))}
                  placeholder={isLoadingNetworks ? "Loading networks…" : "Select network"}
                  disabled={isLoadingNetworks}
                >
                  {(networks || []).map((n) => (
                    <option key={n.net_name} value={n.net_name}>
                      {n.net_name}
                    </option>
                  ))}
                </SelectField>
              ) : filterValueKind(filterField) === "select-category" ? (
                <SelectField
                  value={filterValue}
                  onChange={(e: SelectChangeEvent) => setFilterValue(String(e.target.value))}
                  placeholder="Select category"
                >
                  {DEVICE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </SelectField>
              ) : filterValueKind(filterField) === "select-status" ? (
                <SelectField
                  value={filterValue}
                  onChange={(e: SelectChangeEvent) => setFilterValue(String(e.target.value))}
                  placeholder="Select status"
                >
                  {DEVICE_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </SelectField>
              ) : filterValueKind(filterField) === "select-deployment-type" ? (
                <SelectField
                  value={filterValue}
                  onChange={(e: SelectChangeEvent) => setFilterValue(String(e.target.value))}
                  placeholder="Select deployment type"
                >
                  {DEVICE_DEPLOYMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </SelectField>
              ) : filterValueKind(filterField) === "select-mobility" ? (
                <SelectField
                  value={filterValue}
                  onChange={(e: SelectChangeEvent) => setFilterValue(String(e.target.value))}
                  placeholder="Select mobility"
                >
                  {DEVICE_MOBILITY_TYPES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </SelectField>
              ) : (
                <SelectField
                  value={filterValue}
                  onChange={(e: SelectChangeEvent) => setFilterValue(String(e.target.value))}
                  placeholder="Select active state"
                >
                  {DEVICE_IS_ACTIVE_OPTIONS.map((a) => (
                    <option key={String(a.value)} value={String(a.value)}>
                      {a.label}
                    </option>
                  ))}
                </SelectField>
              )}
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
                onChange={(e: SelectChangeEvent) => setUpdateField(String(e.target.value) as any)}
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
              {updateValueKind(updateField) === "text" ? (
                <ReusableInputField
                  value={updateValue}
                  onChange={(e) => setUpdateValue((e.target as HTMLInputElement).value)}
                  placeholder="Value"
                />
              ) : updateValueKind(updateField) === "select-category" ? (
                <SelectField
                  value={updateValue}
                  onChange={(e: SelectChangeEvent) => setUpdateValue(String(e.target.value))}
                  placeholder="Select category"
                >
                  {DEVICE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </SelectField>
              ) : (
                <SelectField
                  value={updateValue}
                  onChange={(e: SelectChangeEvent) => setUpdateValue(String(e.target.value))}
                  placeholder="Select mobility"
                >
                  {DEVICE_MOBILITY_TYPES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </SelectField>
              )}
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
  const queryClient = useQueryClient();
  const tenant = "airqo";

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const triggerMutation = useTriggerDeviceBulkUpdateJob();
  const updateMutation = useUpdateDeviceBulkUpdateJob();
  const deleteMutation = useDeleteDeviceBulkUpdateJob();

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
              onClick={() => queryClient.invalidateQueries({ queryKey: ["deviceBulkUpdateJobs"] })}
            >
              Refresh
            </ReusableButton>
            <ReusableButton Icon={AqPlus} onClick={() => setIsCreateOpen(true)}>
              Create job
            </ReusableButton>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <BulkUpdateJobsTable
            tenant={tenant}
            itemsPerPage={20}
            onRowClick={openDetails}
            onTrigger={(jobId, t) => triggerMutation.mutate({ jobId, tenant: t })}
            onPause={(jobId, t) => updateMutation.mutate({ jobId, payload: { status: "paused" }, tenant: t })}
            onResume={async (jobId, t) => {
              await updateMutation.mutateAsync({ jobId, payload: { status: "pending" }, tenant: t });
              triggerMutation.mutate({ jobId, tenant: t });
            }}
            onCancel={(jobId, t) => updateMutation.mutate({ jobId, payload: { status: "cancelled" }, tenant: t })}
            onDelete={(jobId, t) => deleteMutation.mutate({ jobId, tenant: t })}
            confirmAction={({ title, description, confirmLabel, disabled, onConfirm, children }) => (
              <ConfirmAction
                title={title}
                description={description}
                confirmLabel={confirmLabel}
                onConfirm={onConfirm}
                disabled={disabled}
              >
                {children}
              </ConfirmAction>
            )}
            isTriggering={triggerMutation.isPending}
            isUpdating={updateMutation.isPending}
            isDeleting={deleteMutation.isPending}
          />
        </div>

        <CreateJobDialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          tenant={tenant}
          onTenantChange={() => {}}
          onCreated={(job) => {
            setSelectedJobId(job._id);
            setIsDetailsOpen(true);
          }}
        />

        <JobDetailsDialog
          jobId={selectedJobId}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          tenant={tenant}
        />
      </div>
    </RouteGuard>
  );
}
