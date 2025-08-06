import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Device } from "@/app/types/devices";
import { useRouter } from "next/navigation";
import ReusableTable, { TableColumn } from "@/components/shared/table/ReusableTable";
import { ReactNode } from "react";

interface DevicesTableProps {
  devices: Device[];
  isLoading?: boolean;
  error?: Error | null;
  itemsPerPage?: number;
  onDeviceClick?: (device: Device) => void;
}

export default function DevicesTable({
  devices,
  isLoading = false,
  error = null,
  onDeviceClick,
}: DevicesTableProps) {
  const router = useRouter();

  const handleDeviceClick = (device: Device) => {
    if (onDeviceClick) onDeviceClick(device);
    else router.push(`/devices/overview/${device._id}`);
  };

type IndexableDevice = Device & Record<string, ReactNode>;

const columns: TableColumn<IndexableDevice>[] = [
  {
    key: "long_name",
    label: "Device Name",
    render: (value, device) => (
      <div className="flex flex-col gap-1">
        <span className="font-medium uppercase">
          {value && value.length > 25 ? `${value.slice(0, 25)}...` : value}
        </span>
        <span
          className="text-sm text-muted-foreground max-w-[200px] truncate lowercase"
          title={device.description}
        >
          {device.description}
        </span>
      </div>
    ),
  },
  {
    key: "isOnline",
    label: "Online Status",
    render: (isOnline) => (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {isOnline ? (
          <>
            Online
            <span className="ml-1 w-2 h-2 bg-green-500 rounded-full inline-block" />
          </>
        ) : (
          "Offline"
        )}
      </span>
    ),
  },
  {
    key: "site",
    label: "Site",
    render: (_, device) => (
      <span className="uppercase max-w-40 w-full">
        {device.site?.name || "Not assigned"}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (status) => {
      const statusMap = {
        deployed: "text-green-800",
        recalled: "text-yellow-800",
        not_deployed: "text-red-800",
      };

      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusMap[status]}`}
        >
          {status.replace("_", " ")}
        </span>
      );
    },
  },
  {
    key: "createdAt",
    label: "Created On",
    render: (dateString) =>
      new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
  },
];

  return (
    <div className="space-y-4">
      {/* Table */}
      <ReusableTable
        title="Devices"
        data={devices || []}
        columns={columns}
        loading={isLoading}
        onRowClick={handleDeviceClick}
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
      />
    </div>
  );
}
