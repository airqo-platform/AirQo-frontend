import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Device } from "@/app/types/devices";
import { useRouter } from "next/navigation";
import ReusableTable, {
  TableColumn,
  TableItem,
} from "@/components/shared/table/ReusableTable";
import moment from "moment";
import { useState } from "react";
import { AssignCohortDevicesDialog } from "@/components/features/cohorts/assign-cohort-devices";
import { useUserContext } from "@/core/hooks/useUserContext";

interface DevicesTableProps {
  devices: Device[];
  isLoading?: boolean;
  error?: Error | null;
  itemsPerPage?: number;
  onDeviceClick?: (device: Device) => void;
  multiSelect?: boolean;
}

type TableDevice = TableItem<unknown>;

interface Site {
  name: string;
  id?: string;
}

export default function DevicesTable({
  devices,
  isLoading = false,
  error = null,
  itemsPerPage = 10,
  onDeviceClick,
  multiSelect = true,
}: DevicesTableProps) {
  const router = useRouter();
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const { userContext } = useUserContext();
  const isInternalView = userContext === "airqo-internal";

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

  const devicesWithId: TableDevice[] = devices
    .filter(
      (device): device is Device & { _id: string } =>
        typeof device._id === "string" && device._id.trim() !== ""
    )
    .map((device) => ({
      ...device,
      id: device._id,
    }));

  const columns: TableColumn<TableDevice, string>[] = [
    {
      key: "long_name",
      label: "Device Name",
      render: (value, device) => {
        const name = typeof value === "string" ? value : "";
        const description = (device as Device).description ?? "";
        return (
          <div className="flex flex-col gap-1">
            <span className="font-medium uppercase">
              {name.length > 25 ? `${name.slice(0, 25)}...` : name}
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
            {status ? (
              <>
                Online
                <span className="ml-1 w-2 h-2 bg-green-500 rounded-full inline-block" />
              </>
            ) : (
              "Offline"
            )}
          </span>
        );
      },
    },
    {
      key: "site",
      label: "Site",
      render: (siteData, device) => {
        const site = (siteData as Site)?.name || device?.description;

        return (
          <span className="uppercase max-w-40 w-full">
            {typeof site === 'string' ? site : "Not assigned"}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (status) => {
        const value = typeof status === "string" ? status : "";
        const statusMap: Record<string, string> = {
          deployed: "text-green-800",
          recalled: "text-yellow-800",
          not_deployed: "text-red-800",
        };

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
              statusMap[value] ?? "text-gray-500"
            }`}
          >
            {value.replace("_", " ")}
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
    const groupsColumn: TableColumn<TableDevice, string> = {
      key: "groups",
      label: "Groups",
      render: (value, item) => {
        const device = item as Device;
        const groups = device.groups as string[] | undefined;

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
    // Insert "Groups" column after "Site"
    columns.splice(3, 0, groupsColumn);
  }

  return (
    <div className="space-y-4">
      <ReusableTable
        title="Devices"
        data={devicesWithId}
        columns={columns}
        loading={isLoading}
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
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          ) : (
            "No devices available"
          )
        }
        searchableColumns={["long_name", "site.name", "description"]}
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
