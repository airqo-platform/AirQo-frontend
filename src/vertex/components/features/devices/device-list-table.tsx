import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Device } from "@/app/types/devices";
import { useRouter } from "next/navigation";
import ReusableTable, {
  TableColumn,
  TableItem,
} from "@/components/shared/table/ReusableTable";

interface DevicesTableProps {
  devices: Device[];
  isLoading?: boolean;
  error?: Error | null;
  itemsPerPage?: number;
  onDeviceClick?: (device: Device) => void;
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
  onDeviceClick,
}: DevicesTableProps) {
  const router = useRouter();

  const handleDeviceClick = (item: unknown) => {
    const device = item as Device;
    if (onDeviceClick) onDeviceClick(device);
    else router.push(`/devices/overview/${device._id}`);
  };

  // Coerce devices to include a required 'id' field
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
      render: (siteData) => {
        const site = (siteData as Site)?.name;

        return (
          <span className="uppercase max-w-40 w-full">
            {site || "Not assigned"}
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
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      },
    },
  ];

  return (
    <div className="space-y-4">
      <ReusableTable
        title="Devices"
        data={devicesWithId}
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
