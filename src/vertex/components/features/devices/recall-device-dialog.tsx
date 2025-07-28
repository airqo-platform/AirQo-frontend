"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Recall Device</DialogTitle>
          <DialogDescription>
            Recall {deviceDisplayName || deviceName} from its current deployment.
            Please specify the recall type.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="recallType">Recall Type *</Label>
            <Select value={recallType} onValueChange={setRecallType}>
              <SelectTrigger>
                <SelectValue placeholder="Select recall type" />
              </SelectTrigger>
              <SelectContent>
                {recallTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={recallDevice.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRecall}
            disabled={!isFormValid || recallDevice.isPending}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {recallDevice.isPending ? "Recalling..." : "Recall Device"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
