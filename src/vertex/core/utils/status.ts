import {
  AlertTriangle,
  CheckCircle,
  Database,
  Upload,
  XCircle,
} from "lucide-react";
import { add, format, isAfter, isValid, parseISO } from "date-fns";
import React from "react";

/*
  Shared Types
*/
export type StatusLabelStrings =
  | "Operational"
  | "Transmitting"
  | "Data Available"
  | "Not Transmitting"
  | "Invalid Date";

export type StatusColor = "green" | "blue" | "yellow" | "gray" | "red" | "purple";

export interface PrimaryStatus {
  label: StatusLabelStrings;
  color: StatusColor;
  icon: React.ElementType;
  description: string;
}

export interface FormattedDate {
  message: string;
  isError: boolean;
  errorType: "future" | "invalid" | null;
}

/*
  Shared Constants
*/

/**
 * Light-background color classes for table badges
 */
export const badgeColorClasses: Record<StatusColor, string> = {
  green: "bg-green-100 text-green-800",
  blue: "bg-blue-100 text-blue-800",
  yellow: "bg-yellow-100 text-yellow-800",
  gray: "bg-gray-100 text-gray-800",
  red: "bg-red-100 text-red-800",
  purple: "bg-purple-100 text-purple-800",
};

/*
  Shared Functions
*/

/**
 * Formats a date string, handling future date errors.
 */
export const formatDisplayDate = (dateString: string): FormattedDate => {
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

/**
 * Determines a simple status based on online state and date validity.
 * Used for Sites or simple Device views that don't need the 4-state logic.
 */
export const getSimpleStatus = (
  isOnline: boolean,
  futureDateCheck?: FormattedDate | null
): PrimaryStatus => {
  // 1. Handle future date error first.
  if (futureDateCheck?.isError) {
    return {
      label: "Invalid Date",
      color: "purple",
      icon: AlertTriangle,
      description:
        futureDateCheck.errorType === "future"
          ? "Reporting an invalid future date."
          : "Reporting an invalid date.",
    };
  }

  // 2. Operational if online
  if (isOnline) {
    return {
      label: "Operational",
      color: "green",
      icon: CheckCircle,
      description: "Online and reporting data",
    };
  }

  // 3. Default / Offline
  return {
    label: "Not Transmitting",
    color: "gray",
    icon: XCircle,
    description: "No recent data",
  };
};

/**
 * Determines the full status for a Device including "Transmitting" and "Data Available" states.
 */
export const getDeviceStatus = (
  isOnline: boolean,
  rawOnlineStatus: boolean | undefined,
  futureDateCheck?: FormattedDate | null
): PrimaryStatus => {
  // 1. Handle future date error first.
  if (futureDateCheck?.isError) {
    return {
      label: "Invalid Date",
      color: "purple",
      icon: AlertTriangle,
      description:
        futureDateCheck.errorType === "future"
          ? "Device reporting an invalid future date."
          : "Device reporting an invalid date.",
    };
  }

  // 2. Operational: Transmitting and Online
  if (rawOnlineStatus === true && isOnline) {
    return {
      label: "Operational",
      color: "green",
      icon: CheckCircle,
      description: "Device transmitting • Data ready for use",
    };
  }

  // 3. Transmitting: Transmitting but Offline (calibration/processing)
  if (rawOnlineStatus === true && !isOnline) {
    return {
      label: "Transmitting",
      color: "blue",
      icon: Upload,
      description: "Receiving data • Processing calibration...",
    };
  }

  // 4. Data Available: Not Transmitting but Online (using recent calibrated data)
  if (rawOnlineStatus === false && isOnline) {
    return {
      label: "Data Available",
      color: "yellow",
      icon: Database,
      description: "Using recent data • Not currently transmitting",
    };
  }

  // 5. Default: Not Transmitting (Offline)
  return {
    label: "Not Transmitting",
    color: "gray",
    icon: XCircle,
    description: "No recent data from device",
  };
};

/**
 * Returns a detailed explanation of the status for tooltips.
 */
export const getStatusExplanation = (
  statusLabel: StatusLabelStrings,
  futureDateCheck?: FormattedDate | null
): string => {
  if (futureDateCheck?.errorType === "future") {
    return `This is a device-level issue. The device reported an invalid future date: ${futureDateCheck.message}. This is likely due to a clock or configuration error.`;
  }

  switch (statusLabel) {
    case "Operational":
      return `Operational: The device is marked as transmitting (rawOnlineStatus: true) and its processed, calibrated data is also ready (isOnline: true).`;
    case "Transmitting":
      return `Transmitting: The device is sending new raw data (rawOnlineStatus: true), but the final calibrated data is still processing (isOnline: false). This is normal during data processing cycles.`;
    case "Data Available":
      return `Data Available: The device is not currently sending new raw data (rawOnlineStatus: false), but recently calibrated data (isOnline: true) is still available for use.`;
    case "Not Transmitting":
      return "Not Transmitting: The device is not sending new raw data (rawOnlineStatus: false), and no recent calibrated data is available (isOnline: false). The device appears to be offline.";
    case "Invalid Date":
      return "Invalid Date: The device is reporting a date timestamp that is not valid.";
    default:
      return "Unknown status";
  }
};
