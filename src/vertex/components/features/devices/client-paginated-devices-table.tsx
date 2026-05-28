"use client";

import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Device } from "@/app/types/devices";
import { useRouter } from "next/navigation";
import ReusableTable, { TableAction } from "@/components/shared/table/ReusableTable";
import { useCallback, useMemo, useState } from "react";
import { useUserContext } from "@/core/hooks/useUserContext";
import { getColumns, type TableDevice } from "./utils/table-columns";
import { Edit, Plus, Trash2 } from "lucide-react";
import BulkEditDevicesModal from "./bulk-edit-device-details-modal";
import { AssignCohortDevicesDialog } from "../cohorts/assign-cohort-devices";
import { UnassignCohortDevicesDialog } from "../cohorts/unassign-cohort-devices";

interface ClientPaginatedDevicesTableProps {
  devices: Device[];
  isLoading?: boolean;
  error?: Error | null;
  itemsPerPage?: number;
  onDeviceClick?: (device: Device) => void;
  multiSelect?: boolean;
  className?: string;
  hiddenColumns?: string[];
}

export default function ClientPaginatedDevicesTable({
  devices,
  isLoading = false,
  error = null,
  itemsPerPage = 25,
  onDeviceClick,
  multiSelect = false,
  className,
  hiddenColumns = [],
}: ClientPaginatedDevicesTableProps) {
  const router = useRouter();
  const { userContext, activeGroup } = useUserContext();
  const isInternalView = userContext === "personal" && activeGroup?.grp_title?.toLowerCase() === "airqo";

  const [selectedDeviceObjects, setSelectedDeviceObjects] = useState<TableDevice[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditDeviceIds, setBulkEditDeviceIds] = useState<string[]>([]);

  const handleAssignSuccess = () => {
    setSelectedDeviceObjects([]);
    setShowAssignDialog(false);
  };

  const handleUnassignSuccess = () => {
    setSelectedDeviceObjects([]);
    setShowUnassignDialog(false);
  };

  const handleAddCohortDeviceActionSubmit = useCallback(
      (selectedIds: (string | number)[]) => {
          if (!selectedIds.length) return;
          setShowAssignDialog(true);
      },
      []
  );

  const handleUnassignActionSubmit = useCallback(
      (selectedIds: (string | number)[]) => {
          if (!selectedIds.length) return;
          setShowUnassignDialog(true);
      },
      []
  );

  const handleBulkEditClose = () => {
      setShowBulkEditModal(false);
      setBulkEditDeviceIds([]);
  };

  const handleDeviceClick = (item: unknown) => {
    const device = item as Device;
    if (onDeviceClick) onDeviceClick(device);
    else router.push(`/devices/overview/${device._id}`);
  };

  const devicesWithId: TableDevice[] = useMemo(() => {
    return (devices || [])
      .filter(
        (device: Device): device is Device & { _id: string } =>
          typeof device._id === "string" && device._id.trim() !== ""
      )
      .map((device) => ({
        ...device,
        id: device._id,
      }));
  }, [devices]);

  const columns = useMemo(() => {
    const allColumns = getColumns(isInternalView);
    return allColumns.filter(
      (column) => !hiddenColumns.includes(column.key as string)
    );
  }, [isInternalView, hiddenColumns]);

  const actions = useMemo(() => {
    if (!multiSelect) return [];

    const baseActions: TableAction[] = [
      {
        label: "Add to Cohort",
        value: "assign_cohort",
        handler: handleAddCohortDeviceActionSubmit,
        icon: Plus,
      },
      {
        label: "Bulk Edit Devices",
        value: "bulk_edit",
        handler: (ids) => {
          if (!ids.length) return;

          const safeIds = ids.map(String);
          setBulkEditDeviceIds(safeIds);
          setShowBulkEditModal(true);
        },
        icon: Edit,
      },
      {
        label: "Remove from Cohort",
        value: "unassign_cohort",
        handler: handleUnassignActionSubmit,
        icon: Trash2,
      }
    ];

    return baseActions;
  }, [
    multiSelect,
    handleAddCohortDeviceActionSubmit,
    handleUnassignActionSubmit,
  ]);

  return (
    <div className={`space-y-4 ${className}`}>
      <ReusableTable
        title="Devices"
        data={devicesWithId}
        columns={columns}
        loading={isLoading}
        pageSize={itemsPerPage}
        onRowClick={handleDeviceClick}
        multiSelect={multiSelect}
        onSelectedItemsChange={(items) => setSelectedDeviceObjects(items as TableDevice[])}
        actions={actions}
        emptyState={
          error ? (
            <div className="flex flex-col items-center gap-2">
              <ExclamationTriangleIcon className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">Unable to load devices</p>
              <p className="text-sm text-muted-foreground">{error.message || "An unknown error occurred"}</p>
            </div>
          ) : (
            "No devices available"
          )
        }
        searchable
        searchableColumns={["long_name", "name", "description", "site.name"]}
      />
      {/* Assign to Cohort Dialog */}
      <AssignCohortDevicesDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        selectedDevices={selectedDeviceObjects}
        onSuccess={handleAssignSuccess}
      />

      {/* Unassign from Cohort Dialog */}
      <UnassignCohortDevicesDialog
        open={showUnassignDialog}
        onOpenChange={setShowUnassignDialog}
        selectedDevices={selectedDeviceObjects}
        onSuccess={handleUnassignSuccess}
      />
      <BulkEditDevicesModal
        open={showBulkEditModal}
        onClose={handleBulkEditClose}
        deviceIds={bulkEditDeviceIds}
      />
    </div>
  );
}