"use client";

import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Device } from "@/app/types/devices";
import { useRouter } from "next/navigation";
import ReusableTable from "@/components/shared/table/ReusableTable";
import { useMemo } from "react";
import { useUserContext } from "@/core/hooks/useUserContext";
import { getColumns, type TableDevice } from "./utils/table-columns";

interface ClientPaginatedDevicesTableProps {
  devices: Device[];
  isLoading?: boolean;
  error?: Error | null;
  itemsPerPage?: number;
  onDeviceClick?: (device: Device) => void;
  multiSelect?: boolean;
  className?: string;
}

export default function ClientPaginatedDevicesTable({
  devices,
  isLoading = false,
  error = null,
  itemsPerPage = 25,
  onDeviceClick,
  multiSelect = false,
  className,
}: ClientPaginatedDevicesTableProps) {
  const router = useRouter();
  const { userContext } = useUserContext();
  const isInternalView = userContext === "airqo-internal";

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

  const columns = useMemo(() => getColumns(isInternalView), [isInternalView]);

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
    </div>
  );
}