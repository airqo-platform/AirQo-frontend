"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { useAddMaintenanceLog } from "@/core/hooks/useDevices";
import { useUserContext } from "@/core/hooks/useUserContext";
import { MultiSelectCombobox } from "@/components/ui/multi-select";
import { Switch } from "@/components/ui/switch";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableToast from "@/components/shared/toast/ReusableToast";

interface AddMaintenanceLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviceName: string;
}

interface Option {
  value: string
  label: string
}

const createTagOption = (label: string): Option => ({
  value: label.toLowerCase(),
  label: label,
})

const DEFAULT_TAGS: Option[] = [
  createTagOption("Dust blowing and sensor cleaning"),
  createTagOption("Site update check"),
  createTagOption("Device equipment check"),
  createTagOption("Power circuitry and components works"),
  createTagOption("GPS module works/replacement"),
  createTagOption("GSM module works/replacement"),
  createTagOption("Battery works/replacement"),
  createTagOption("Power supply works/replacement"),
  createTagOption("Antenna works/replacement"),
  createTagOption("Mounts replacement"),
  createTagOption("Software checks/re-installation"),
  createTagOption("PCB works/replacement"),
  createTagOption("Temp/humidity sensor works/replacement"),
  createTagOption("Air quality sensor(s) works/replacement"),
]

const AddMaintenanceLogModal: React.FC<AddMaintenanceLogModalProps> = ({ open, onOpenChange, deviceName }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [maintenanceType, setMaintenanceType] = useState<"preventive" | "corrective">("preventive");

  const { userDetails } = useUserContext();
  const addMaintenanceLog = useAddMaintenanceLog();

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!open) {
      setDate(new Date());
      setDescription("");
      setSelectedTags([]);
      setMaintenanceType("preventive");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!date || selectedTags.length === 0) {
      ReusableToast({message: "Please fill all fields", type:"ERROR"})
      return;
    }

    const logData = {
      date: date.toISOString(),
      tags: selectedTags.map(tag => tag.toLowerCase()),
      description,
      userName: userDetails?.email || "",
      maintenanceType,
      email: userDetails?.email || "",
      firstName: userDetails?.firstName || "",
      lastName: userDetails?.lastName || "",
      user_id: userDetails?._id || "",
    };

    await addMaintenanceLog.mutateAsync({ deviceName, logData });
    onOpenChange(false);
  };

  return (
    <ReusableDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={`Add Maintenance Log for ${deviceName}`}
      className="w-[70vw] h-[70vh] max-w-none max-h-none m-0 p-0"
      primaryAction={{
        label: addMaintenanceLog.isPending ? "Saving..." : "Save Log",
        onClick: handleSubmit,
        disabled: addMaintenanceLog.isPending,
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: () => onOpenChange(false),
        variant: "outline",
        disabled: addMaintenanceLog.isPending,
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Label>Maintenance Type:</Label>
          <span className={maintenanceType === 'preventive' ? 'font-semibold' : ''}>Preventive</span>
          <Switch
            checked={maintenanceType === 'corrective'}
            onCheckedChange={(checked) => setMaintenanceType(checked ? 'corrective' : 'preventive')}
          />
          <span className={maintenanceType === 'corrective' ? 'font-semibold' : ''}>Corrective</span>
        </div>
        <div>
          <Label>Date of Maintenance</Label>
          <DatePicker value={date} onChange={setDate} />
        </div>
        <div>
          <Label>Tags</Label>
          <MultiSelectCombobox
            options={DEFAULT_TAGS}
            placeholder="Select or add tags..."
            onValueChange={setSelectedTags}
            value={selectedTags}
          />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>
    </ReusableDialog>
  );
};

export default AddMaintenanceLogModal;
