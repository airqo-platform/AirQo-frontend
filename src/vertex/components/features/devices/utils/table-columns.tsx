import { Device, DeviceSite } from "@/app/types/devices";
import {
  TableColumn,
  TableItem,
} from "@/components/shared/table/ReusableTable";
import {
  AlertTriangle,
  CheckCircle,
  Database,
  Upload,
  XCircle,
} from "lucide-react";
import React from "react";
import { add, format, isAfter, isValid, parseISO } from "date-fns";

export type TableDevice = TableItem<unknown> & Device;

/*
  Helper types and functions
*/
type StatusLabelStrings =
  | "Operational"
  | "Transmitting"
  | "Data Available"
  | "Not Transmitting"
  | "Invalid Date";

type StatusColor = "green" | "blue" | "yellow" | "gray" | "red" | "purple";

interface PrimaryStatus {
  label: StatusLabelStrings;
  color: StatusColor;
  icon: React.ElementType;
  description: string;
}

interface FormattedDate {
  message: string;
  isError: boolean;
  errorType: "future" | "invalid" | null;
}

/**
 * Formats a date string, handling future date errors.
 */
const formatDisplayDate = (dateString: string): FormattedDate => {
  const date = parseISO(dateString);

  // Invalid date check
  if (!isValid(date)) {
    return { message: "Invalid date", isError: true, errorType: "invalid" };
  }

  const now = new Date();
  const nowPlus5 = add(now, { minutes: 5 });

  const formattedDate = format(date, "MMM d yyyy, h:mm a").toUpperCase();

  // Future date check
  if (isAfter(date, nowPlus5)) {
    return {
      message: formattedDate,
      isError: true,
      errorType: "future",
    };
  }

  return {
    message: formattedDate,
    isError: false,
    errorType: null,
  };
};


const getPrimaryStatus = (
  device: Device,
  futureDateCheck?: FormattedDate | null
): PrimaryStatus => {
  // 1. Handle future date error first. This is a special UI case.
  if (futureDateCheck?.errorType === "future") {
    return {
      label: "Invalid Date",
      color: "purple",
      icon: AlertTriangle,
      description: "Device reporting an invalid future date.",
    };
  }

  // 2. Determine status based on the boolean fields

  // 🟢 OPERATIONAL: Best case: transmitting and data ready
  if (device.rawOnlineStatus && device.isOnline) {
    return {
      label: "Operational",
      color: "green",
      icon: CheckCircle,
      description: "Device transmitting • Data ready for use",
    };
  }

  // 🔵 TRANSMITTING: Device transmitting but waiting for calibration
  if (device.rawOnlineStatus && !device.isOnline) {
    return {
      label: "Transmitting",
      color: "blue",
      icon: Upload,
      description: "Receiving data • Processing calibration...",
    };
  }

  // 🟡 DATA AVAILABLE: Has recent calibrated data but not currently transmitting
  if (!device.rawOnlineStatus && device.isOnline) {
    return {
      label: "Data Available",
      color: "yellow",
      icon: Database,
      description: "Using recent data • Not currently transmitting",
    };
  }

  // GRAY NOT TRANSMITTING: Not transmitting and no recent data.
  // This is the default "else" case.
  return {
    label: "Not Transmitting",
    color: "gray",
    icon: XCircle,
    description: "No recent data from device",
  };
};

/**
 * Light-background color classes for table badges
 */
const badgeColorClasses: Record<StatusColor, string> = {
  green: "bg-green-100 text-green-800",
  blue: "bg-blue-100 text-blue-800",
  yellow: "bg-yellow-100 text-yellow-800",
  gray: "bg-gray-100 text-gray-800",
  red: "bg-red-100 text-red-800",
  purple: "bg-purple-100 text-purple-800",
};

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
      label: "Device Status",
      render: (isOnline, item) => {
        const lastActiveCheck = item.lastActive
          ? formatDisplayDate(item.lastActive)
          : null;
        const status = getPrimaryStatus(item, lastActiveCheck);
        const colors = badgeColorClasses[status.color];
        const Icon = status.icon;

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors}`}
          >
            <Icon className="w-4 h-4 mr-1" />
            {status.label}
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
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusClasses[value] || "bg-gray-100 text-gray-800"
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

        const date = parseISO(value);

        return isValid(date)
          ? format(date, "MMM d yyyy, h:mm a").toUpperCase()
          : "-";
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