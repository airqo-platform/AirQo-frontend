"use client";

import { useState } from "react";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRecallDevice } from "@/core/hooks/useDevices";
import { useUserContext } from "@/core/hooks/useUserContext";

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
        },
      });
      
      // Reset form and close dialog
      setRecallType("");
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
      console.error("Recall failed:", error);
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
      <div className="grid gap-2">
        <Label htmlFor="recallType">Set Recall Type *</Label>
        <Select value={recallType} onValueChange={setRecallType}>
          <SelectTrigger id="recallType">
            <SelectValue placeholder="Select recall type" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={5}>
            {recallTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </ReusableDialog>
  );
}
