import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { AqFilterLines } from "@airqo/icons-react";
import { Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Device } from "@/app/types/devices";
import { useRouter, useSearchParams } from "next/navigation";
import ReusableTable from "@/components/shared/table/ReusableTable";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { useState, useMemo } from "react";
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
  const [selectedDeviceObjects, setSelectedDeviceObjects] = useState<TableDevice[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showUnassignDialog, setShowUnassignDialog] = useState(false);
  const { userContext, activeGroup } = useUserContext();
  const isInternalView = userContext === "personal" && activeGroup?.grp_title?.toLowerCase() === "airqo";

  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const filterOptions = useMemo(() => {
    if (status === "operational") {
      return { rawOnlineStatus: true, isOnline: true };
    }
    if (status === "transmitting") {
      return { rawOnlineStatus: true, isOnline: false };
    }
    if (status === "not_transmitting") {
      return { rawOnlineStatus: false, isOnline: false };
    }
    if (status === "data_available") {
      return { rawOnlineStatus: false, isOnline: true };
    }
    return {};
  }, [status]);

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
    filterStatus: status || undefined,
    ...filterOptions,
  });

  const pageCount = meta?.totalPages ?? 0;

  const handleDeviceClick = (item: unknown) => {
    const device = item as Device;
    if (onDeviceClick) onDeviceClick(device);
    else router.push(`/devices/overview/${device._id}`);
  };

  const handleAssignSuccess = () => {
    setSelectedDeviceObjects([]);
    setShowAssignDialog(false);
  };

  const handleUnassignSuccess = () => {
    setSelectedDeviceObjects([]);
    setShowUnassignDialog(false);
  };

  const handleAddCohortDeviceActionSubmit = () => {
    setShowAssignDialog(true);
  };

  const handleUnassignActionSubmit = () => {
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
    <div className={`space-y-4 ${className}`}>
      <ReusableTable
        title="Devices"
        data={devicesWithId}
        columns={columns}
        loading={isFetching}
        pageSize={itemsPerPage}
        onRowClick={handleDeviceClick}
        multiSelect={multiSelect}
        onSelectedItemsChange={(items) => setSelectedDeviceObjects(items as TableDevice[])}
        actions={
          multiSelect
            ? [
              {
                label: "Add to Cohort",
                value: "assign_cohort",
                handler: handleAddCohortDeviceActionSubmit,
              },
              ...(selectedDeviceObjects.length > 0
                ? [{
                  label: "Remove from Cohort",
                  value: "unassign_cohort",
                  handler: handleUnassignActionSubmit,
                }]
                : [])
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
        customHeaderContent={
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 gap-2 bg-white dark:bg-[#1d1f20] relative">
                  <AqFilterLines className="w-3.5 h-3.5" />
                  <span>Filter</span>
                  {status && (
                    <span className="flex items-center justify-center w-5 h-5 ml-1 text-[10px] font-bold text-white bg-blue-600 rounded-full">
                      1
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuItem onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("status");
                  router.push(`?${params.toString()}`);
                }} className="justify-between">
                  All Devices
                  {!status && <Check className="w-4 h-4 text-blue-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("status", "operational");
                  router.push(`?${params.toString()}`);
                }} className={`justify-between ${status === 'operational' ? 'font-medium bg-accent' : ''}`}>
                  Operational
                  {status === 'operational' && <Check className="w-4 h-4 text-blue-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("status", "transmitting");
                  router.push(`?${params.toString()}`);
                }} className={`justify-between ${status === 'transmitting' ? 'font-medium bg-accent' : ''}`}>
                  Transmitting
                  {status === 'transmitting' && <Check className="w-4 h-4 text-blue-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("status", "not_transmitting");
                  router.push(`?${params.toString()}`);
                }} className={`justify-between ${status === 'not_transmitting' ? 'font-medium bg-accent' : ''}`}>
                  Not Transmitting
                  {status === 'not_transmitting' && <Check className="w-4 h-4 text-blue-600" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("status", "data_available");
                  router.push(`?${params.toString()}`);
                }} className={`justify-between ${status === 'data_available' ? 'font-medium bg-accent' : ''}`}>
                  Data Available
                  {status === 'data_available' && <Check className="w-4 h-4 text-blue-600" />}
                </DropdownMenuItem>
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
                Clear filter
              </ReusableButton>
            )}
          </div>
        }
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
    </div >
  );
}
