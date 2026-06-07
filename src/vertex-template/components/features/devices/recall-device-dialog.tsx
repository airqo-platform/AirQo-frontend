"use client";

import { useState } from "react";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableSelectInput from "@/components/shared/select/ReusableSelectInput";
import { useRecallDevice } from "@/core/hooks/useDevices";
import { useUserContext } from "@/core/hooks/useUserContext";
import { useBanner } from "@/context/banner-context";
import { useBannerWithDelay } from "@/core/hooks/useBannerWithDelay";
import { getApiErrorMessage } from "@/core/utils/getApiErrorMessage";

interface RecallDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviceName: string;
  deviceDisplayName?: string;
}

const recallTypes = [
  { value: "errors", label: "Errors" },
  { value: "disconnected", label: "Disconnected" },
];

export default function RecallDeviceDialog({
  open,
  onOpenChange,
  deviceName,
  deviceDisplayName,
}: RecallDeviceDialogProps) {
  const [recallType, setRecallType] = useState<string>("");
  const recallDevice = useRecallDevice();
  const { userDetails } = useUserContext();
  const { showBanner } = useBanner();
  const { showBannerWithDelay } = useBannerWithDelay();

  const handleRecall = async () => {
    if (!recallType || !userDetails?._id) {
      return;
    }

    try {
      await recallDevice.mutateAsync({
        deviceName,
        recallData: {
          recallType,
          user_id: userDetails._id,
          date: new Date().toISOString(),
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          email: userDetails.email,
          userName: userDetails.userName,
        },
      });
      showBannerWithDelay({
        severity: 'success',
        title: 'Success',
        message: `${deviceDisplayName || deviceName} has been recalled successfully.`,
        scoped: false
      }, 300);
      setRecallType("");
      onOpenChange(false);
    } catch (error) {
      showBanner({ severity: 'error', message: `Recall Failed: ${getApiErrorMessage(error)}`, scoped: true });
    }
  };

  const isFormValid = recallType && userDetails?._id;

  return (
    <ReusableDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Recall Device"
      subtitle={`Selected device: ${deviceDisplayName || deviceName}`}
      size="md"
      className="h-[55vh]"
      primaryAction={{
        label: recallDevice.isPending ? "Recalling..." : "Recall Device",
        onClick: handleRecall,
        disabled: !isFormValid || recallDevice.isPending,
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: () => onOpenChange(false),
        disabled: recallDevice.isPending,
        variant: "outline",
      }}
    >
      <ReusableSelectInput
        label="Set Recall Type"
        required
        value={recallType}
        onChange={(e) => setRecallType(e.target.value)}
        placeholder="Select recall type"
      >
        {recallTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
      </ReusableSelectInput>
    </ReusableDialog>
  );
}
