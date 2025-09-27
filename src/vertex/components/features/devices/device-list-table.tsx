import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Device } from "@/app/types/devices";
import { useRouter } from "next/navigation";
import ReusableTable from "@/components/shared/table/ReusableTable";
import { useState, useMemo, useRef, useEffect } from "react";
import { AssignCohortDevicesDialog } from "@/components/features/cohorts/assign-cohort-devices";
import { useUserContext } from "@/core/hooks/useUserContext";
import { UnassignCohortDevicesDialog } from "../cohorts/unassign-cohort-devices";
import { useDevices } from "@/core/hooks/useDevices";
import { getColumns, type TableDevice } from "./utils/table-columns";
import { useServerSideTableState } from "@/core/hooks/useServerSideTableState";

interface DevicesTableProps {
  itemsPerPage?: number;
  onDeviceClick?: (device: Device) => void;
  multiSelect?: boolean;
  className?: string;
}

export default function DevicesTable({
  itemsPerPage = 25,
  onDeviceClick,
  multiSelect = true,
  className,
}: DevicesTableProps) {
  const router = useRouter();
  const tableRef = useRef<HTMLDivElement>(null);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);
  const { userContext } = useUserContext();
  const isInternalView = userContext === "airqo-internal";

  const {
    pagination,
    setPagination,
    searchTerm,
    setSearchTerm,
    sorting,
    setSorting,
  } = useServerSideTableState({ initialPageSize: itemsPerPage });

  const { devices, meta, isFetching, error } = useDevices({
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

  const handleDeviceClick = (item: unknown) => {
    const device = item as Device;
    if (onDeviceClick) onDeviceClick(device);
    else router.push(`/devices/overview/${device._id}`);
  };

  const handleAssignSuccess = () => {
    setSelectedDevices([]);
    setShowAssignDialog(false);
  };

  const handleUnassignSuccess = () => {
    setSelectedDevices([]);
    setShowUnassignDialog(false);
  };

  const handleActionSubmit = (selectedIds: (string | number)[]) => {
    setSelectedDevices(selectedIds as string[]);
    setShowAssignDialog(true);
  };

  const handleUnassignActionSubmit = (selectedIds: (string | number)[]) => {
    setSelectedDevices(selectedIds as string[]);
    setShowUnassignDialog(true);
  };

  const devicesWithId: TableDevice[] = useMemo(() => {
    return devices
      .filter(
        (device: Device): device is Device & { _id: string } =>
          typeof device._id === "string" && device._id.trim() !== ""
      )
      .map((device) => ({
        ...device,
        id: device._id,
      }));
  }, [devices]);

  const columns = useMemo(() => getColumns(isInternalView), [isInternalView]);

  return (
    <div ref={tableRef} className={`space-y-4 ${className}`}>
      <ReusableTable
        title="Devices"
        data={devicesWithId}
        columns={columns}
        loading={isFetching}
        pageSize={itemsPerPage}
        onRowClick={handleDeviceClick}
        multiSelect={multiSelect}
        onSelectedItemsChange={(ids) => setSelectedDevices(ids as string[])}
        actions={
          multiSelect
            ? [
                {
                  label: "Add to Cohort",
                  value: "assign_cohort",
                  handler: handleActionSubmit,
                },
                {
                  label: "Remove from Cohort",
                  value: "unassign_cohort",
                  handler: handleUnassignActionSubmit,
                },
              ]
            : []
        }
        emptyState={
          error ? (
            <div className="flex flex-col items-center gap-2">
              <ExclamationTriangleIcon className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">Unable to load devices</p>
              <p className="text-sm text-muted-foreground">
                {error.message || "An unknown error occurred"}
              </p>
            </div>
          ) : (
            "No devices available"
          )
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

      {/* Assign to Cohort Dialog */}
      <AssignCohortDevicesDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        selectedDevices={selectedDevices}
        onSuccess={handleAssignSuccess}
      />

      {/* Unassign from Cohort Dialog */}
      <UnassignCohortDevicesDialog
        open={showUnassignDialog}
        onOpenChange={setShowUnassignDialog}
        selectedDevices={selectedDevices}
        onSuccess={handleUnassignSuccess}
      />
    </div>
  );
}
