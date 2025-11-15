import { Device, DeviceSite } from "@/app/types/devices";
import {
  TableColumn,
  TableItem,
} from "@/components/shared/table/ReusableTable";
import moment from "moment";
import {
  AlertTriangle,
  CheckCircle,
  Database,
  Upload,
  XCircle,
} from "lucide-react";
import React from "react";

export type TableDevice = TableItem<unknown> & Device;

/*
  Helper types and functions
*/
type StatusLabelStrings =
  | "Operational"
  | "Transmitting"
  | "Data Available"
  | "Not Transmitting"
  | "Stale Data"
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

// --- NEW INTELLIGENT THRESHOLDS ---
/**
 * Raw data is "recent" if it's within 30 minutes.
 * This determines if we are *actually* transmitting.
 */
const RAW_RECENCY_THRESHOLD_MINUTES = 30;

/**
 * Calibrated data is "recent" if it's within 120 minutes (2 hours).
 * This determines if calibrated data is "Available" or "Stale".
 */
const CALIBRATED_RECENCY_THRESHOLD_MINUTES = 120;
// --- END NEW ---

/**
 * Formats a date string, handling future date errors.
 */
const formatDisplayDate = (dateString: string): FormattedDate => {
  const date = moment(dateString);
  if (!date.isValid()) {
    return { message: "Invalid date", isError: true, errorType: "invalid" };
  }
  const now = moment();
  const formattedDate = date.format("D MMM YYYY, HH:mm A");
  if (date.isAfter(now.add(5, "minutes"))) {
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

/**
 * Uses the intelligent timestamp-based logic, consistent
 * with OnlineStatusCard.
 */
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

  // 2. Check timestamps as the source of truth
  const isRawRecent =
    device.lastRawData &&
    moment(device.lastRawData).isAfter(
      moment().subtract(RAW_RECENCY_THRESHOLD_MINUTES, "minutes")
    );

  const isCalibratedRecent =
    device.lastActive &&
    moment(device.lastActive).isAfter(
      moment().subtract(CALIBRATED_RECENCY_THRESHOLD_MINUTES, "minutes")
    );

  // 3. Determine status based on timestamps

  // 🟢 OPERATIONAL: Both raw and calibrated data are recent.
  if (isRawRecent && isCalibratedRecent) {
    return {
      label: "Operational",
      color: "green",
      icon: CheckCircle,
      description: "Device transmitting • Data ready for use",
    };
  }

  // 🔵 TRANSMITTING: Raw data is recent, but calibrated data is not.
  if (isRawRecent && !isCalibratedRecent) {
    return {
      label: "Transmitting",
      color: "blue",
      icon: Upload,
      description: "Receiving data • Processing calibration...",
    };
  }

  // 🟡 DATA AVAILABLE: Raw data is old, but calibrated data is still recent.
  if (!isRawRecent && isCalibratedRecent) {
    return {
      label: "Data Available",
      color: "yellow",
      icon: Database,
      description: "Using recent data • Not currently transmitting",
    };
  }

  // 🔴 STALE DATA: Both are old, but we still have *some* calibrated data (device.isOnline: true)
  // We check device.isOnline here as a fallback.
  if (!isRawRecent && !isCalibratedRecent && device.isOnline) {
    return {
      label: "Stale Data",
      color: "red",
      icon: AlertTriangle,
      description: "Device data is outdated. Not transmitting.",
    };
  }

  // GRAY NOT TRANSMITTING: Both are old, and no calibrated data.
  // This is the default offline state.
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