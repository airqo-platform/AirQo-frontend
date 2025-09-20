import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Device, DeviceSite } from "@/app/types/devices";
import { useRouter } from "next/navigation";
import ReusableTable, {
  TableColumn,
  TableItem,
  SortingState,
} from "@/components/shared/table/ReusableTable";
import moment from "moment";
import { useState, useMemo, useRef, useEffect } from "react";
import { AssignCohortDevicesDialog } from "@/components/features/cohorts/assign-cohort-devices";
import { useUserContext } from "@/core/hooks/useUserContext";
import { useDevices } from "@/core/hooks/useDevices";

interface DevicesTableProps {
  itemsPerPage?: number;
  onDeviceClick?: (device: Device) => void;
  multiSelect?: boolean;
  className?: string;
}

type TableDevice = TableItem<unknown> & Device;

const getColumns = (isInternalView: boolean): TableColumn<TableDevice>[] => {
  const columns: TableColumn<TableDevice>[] = [
    {
      key: "long_name",
      label: "Device Name",
      render: (value, device) => {
        const name = typeof value === "string" ? value : "";
        const description = device.description ?? "";
        return (
          <div className="flex flex-col gap-1">
            <span className="font-medium uppercase truncate" title={name}>
              {name}
            </span>
            <span
              className="text-sm text-muted-foreground max-w-[200px] truncate lowercase"
              title={description}
            >
              {description}
            </span>
          </div>
        );
      },
    },
    {
      key: "isOnline",
      label: "Online Status",
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
    {
      key: "site",
      label: "Site",
      render: (siteData) => {
        const sites = siteData as DeviceSite[] | undefined;
        const siteName = sites?.[0]?.name || sites?.[0]?.location_name;
        return (
          <span className="uppercase max-w-40 w-full truncate" title={siteName}>
            {siteName || "Not assigned"}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Deployment Status",
      render: (status) => {
        const value = String(status || "").replace(" ", "_");
        const statusClasses: Record<string, string> = {
          deployed: "bg-green-100 text-green-800",
          recalled: "bg-yellow-100 text-yellow-800",
          not_deployed: "bg-red-100 text-red-800",
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
              statusClasses[value] || "bg-gray-100 text-gray-800"
            }`}
          >
            {String(status || "").replace("_", " ")}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Created On",
      render: (value) => {
        const date = new Date(value as string);
        return moment(date).format("MMM D YYYY, h:mm A");
      },
    },
  ];

  if (isInternalView) {
    const groupsColumn: TableColumn<TableDevice> = {
      key: "groups",
      label: "Organization",
      render: (value, item) => {
        const groups = item.groups as string[] | undefined;

        if (!groups || groups.length === 0) {
          return <span className="text-muted-foreground">-</span>;
        }

        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {groups.map((groupName) => {
              const formattedName = groupName.replace(/_/g, " ");
              return (
                <span
                  key={groupName}
                  title={formattedName}
                  className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full truncate capitalize"
                >
                  {formattedName}
                </span>
              );
            })}
          </div>
        );
      },
    };
    columns.splice(3, 0, groupsColumn); // Insert after 'Site'
  }

  return columns;
};

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
  const { userContext } = useUserContext();
  const isInternalView = userContext === "airqo-internal";

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: itemsPerPage,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const { devices, meta, isFetching, error } = useDevices({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: searchTerm,
    sortBy: sorting[0]?.id,
    order: sorting[0]?.desc ? "desc" : "asc",
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

  const handleActionSubmit = (selectedIds: (string | number)[]) => {
    setSelectedDevices(selectedIds as string[]);
    setShowAssignDialog(true);
  };

  const devicesWithId: TableDevice[] = useMemo(() => {
    return devices
      .filter(
        (device: Device): device is Device & { _id: string } =>
          typeof device._id === "string" && device._id.trim() !== ""
      )
      .map((device: Device) => ({
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
                  label: "Assign to Cohort",
                  value: "assign_cohort",
                  handler: handleActionSubmit,
                },
              ]
            : []
        }
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
        serverSidePagination
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        onSearchChange={setSearchTerm}
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
    </div>
  );
}
