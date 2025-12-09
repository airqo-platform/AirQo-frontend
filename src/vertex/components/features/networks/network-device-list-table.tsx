
import { Device } from "@/app/types/devices";
import { useRouter } from "next/navigation";
import ReusableTable from "@/components/shared/table/ReusableTable";
import { useState, useMemo, useRef, useEffect } from "react";
import { useNetworkDevices } from "@/core/hooks/useNetworks";
import { getColumns, type TableDevice } from "@/components/features/devices/utils/table-columns";
import { useServerSideTableState } from "@/core/hooks/useServerSideTableState";
import { AssignCohortDevicesDialog } from "@/components/features/cohorts/assign-cohort-devices";
import { UnassignCohortDevicesDialog } from "@/components/features/cohorts/unassign-cohort-devices";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface NetworkDevicesTableProps {
    networkName: string; // The network name to fetch devices for
    itemsPerPage?: number;
    onDeviceClick?: (device: Device) => void;
    className?: string;
}

export default function NetworkDevicesTable({
    networkName,
    itemsPerPage = 25,
    onDeviceClick,
    className,
}: NetworkDevicesTableProps) {
    const router = useRouter();
    const tableRef = useRef<HTMLDivElement>(null);
    const [selectedDeviceObjects, setSelectedDeviceObjects] = useState<TableDevice[]>([]);
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [showUnassignDialog, setShowUnassignDialog] = useState(false);


    const {
        pagination,
        setPagination,
        searchTerm,
        setSearchTerm,
        sorting,
        setSorting,
    } = useServerSideTableState({ initialPageSize: itemsPerPage });

    const { devices, meta, isFetching, isLoading, error } = useNetworkDevices({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: searchTerm,
        sortBy: sorting[0]?.id,
        order: sorting.length ? (sorting[0]?.desc ? "desc" : "asc") : undefined,
        network: networkName,
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

    const columns = useMemo(() => getColumns(false), []);

    return (
        <div ref={tableRef} className={`space-y-4 ${className}`}>
            <ReusableTable
                title="Network Devices"
                data={devicesWithId}
                columns={columns}
                loading={isFetching || isLoading}
                pageSize={itemsPerPage}
                onRowClick={handleDeviceClick}
                multiSelect={true}
                onSelectedItemsChange={(items) => setSelectedDeviceObjects(items as TableDevice[])}
                actions={[
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
                ]}
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
                        "No devices available for this network"
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
        </div>
    );
}
