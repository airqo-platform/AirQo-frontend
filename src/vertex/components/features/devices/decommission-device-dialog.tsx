"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import { useDecommissionDevice } from "@/core/hooks/useDevices";
import { useUserContext } from "@/core/hooks/useUserContext";
import { useBanner } from "@/context/banner-context";
import { useBannerWithDelay } from "@/core/hooks/useBannerWithDelay";
import { getApiErrorMessage } from "@/core/utils/getApiErrorMessage";

interface DecommissionDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviceName: string;
  deviceDisplayName?: string;
}

export const DECOMMISSION_REASON_MAX_LENGTH = 500;

/**
 * Retires a device on the platform without deleting it. Unlike the destructive
 * delete option, the device record and its full activity/readings history are
 * preserved — it is only marked "decommissioned", detached from its site/grid
 * and excluded from online-status polling. The upstream data channel is never
 * touched. Meant for devices whose physical channel is gone for good.
 */
export default function DecommissionDeviceDialog({
  open,
  onOpenChange,
  deviceName,
  deviceDisplayName,
}: DecommissionDeviceDialogProps) {
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const decommissionDevice = useDecommissionDevice();
  const { userDetails } = useUserContext();
  const { showBanner } = useBanner();
  const { showBannerWithDelay } = useBannerWithDelay();

  const displayName = deviceDisplayName || deviceName;

  const resetAndClose = () => {
    setReason("");
    setConfirmed(false);
    onOpenChange(false);
  };

  const handleDecommission = async () => {
    if (!confirmed || !userDetails?._id) {
      return;
    }

    const trimmedReason = reason.trim();

    try {
      await decommissionDevice.mutateAsync({
        deviceName,
        decommissionData: {
          ...(trimmedReason ? { reason: trimmedReason } : {}),
          user_id: userDetails._id,
          date: new Date().toISOString(),
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          email: userDetails.email,
          userName: userDetails.userName,
        },
      });
      showBannerWithDelay(
        {
          severity: "success",
          title: "Success",
          message: `${displayName} has been decommissioned. Its history is preserved and it will no longer be polled.`,
          scoped: false,
        },
        300
      );
      resetAndClose();
    } catch (error) {
      showBanner({
        severity: "error",
        message: `Decommission Failed: ${getApiErrorMessage(error)}`,
        scoped: true,
      });
    }
  };

  const isFormValid = confirmed && !!userDetails?._id;

  return (
    <ReusableDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Decommission Device"
      subtitle={`Selected device: ${displayName}`}
      size="md"
      primaryAction={{
        label: decommissionDevice.isPending ? "Decommissioning..." : "Decommission Device",
        onClick: handleDecommission,
        disabled: !isFormValid || decommissionDevice.isPending,
        className: "bg-red-600 hover:bg-red-700 text-white",
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: () => onOpenChange(false),
        disabled: decommissionDevice.isPending,
        variant: "outline",
      }}
    >
      <div className="space-y-4">
        <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-medium">This permanently retires the device on the platform.</p>
            <p>
              Use it instead of deleting when the physical channel is gone for good (deleted
              upstream, hardware lost or destroyed, end of life). The device record and its full
              activity and readings history are kept, but it will be removed from its site or
              grid and excluded from online-status checks. The upstream data channel is not
              modified.
            </p>
          </div>
        </div>

        <ReusableInputField
          as="textarea"
          label="Reason (optional)"
          placeholder="e.g. ThingSpeak channel deleted upstream"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={DECOMMISSION_REASON_MAX_LENGTH}
          rows={3}
          description={`${reason.length}/${DECOMMISSION_REASON_MAX_LENGTH} characters. Recorded on the device's activity history.`}
        />

        <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <span>
            I understand that <span className="font-medium">{displayName}</span> will be retired
            and cannot be deployed again.
          </span>
        </label>
      </div>
    </ReusableDialog>
  );
}
