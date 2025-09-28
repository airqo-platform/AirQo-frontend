import { Device, DeviceSite } from "@/app/types/devices";
import {
  TableColumn,
  TableItem,
} from "@/components/shared/table/ReusableTable";
import moment from "moment";

export type TableDevice = TableItem<unknown> & Device;

export const getColumns = (
  isInternalView: boolean
): TableColumn<TableDevice>[] => {
  const columns: TableColumn<TableDevice>[] = [
    {
      key: "long_name",
      label: "Device Name",
      render: (value) => {
        const name = typeof value === "string" ? value : "";
        return (
          <div className="flex flex-col gap-1">
            <span className="font-medium uppercase truncate" title={name}>
              {name}
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
        const sites = siteData as
          | DeviceSite[]
          | { _id: string; name: string }
          | undefined;
        if (!sites) {
          return <span className="text-muted-foreground">-</span>;
        }
        const siteName = Array.isArray(sites)
          ? sites[0]?.name || sites[0]?.location_name
          : sites?.name;
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
        if (typeof value !== "string" || !value) {
          return "-";
        }
        const date = moment(value);
        return date.isValid() ? date.format("MMM D YYYY, h:mm A") : "-";
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
              const formattedName = groupName.split("_").join(" ");
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
    columns.splice(5, 0, groupsColumn);
  }

  return columns;
};