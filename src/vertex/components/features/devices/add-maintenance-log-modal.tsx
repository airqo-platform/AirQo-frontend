"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { useAddMaintenanceLog } from "@/core/hooks/useDevices";
import { useUserContext } from "@/core/hooks/useUserContext";
import { MultiSelect, Option } from "@/components/ui/multi-select";
import { Switch } from "@/components/ui/switch";

interface AddMaintenanceLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviceName: string;
}

const createTagOption = (label: string): Option => ({ label, value: label });

const DEFAULT_TAGS: Option[] = [
  createTagOption('Dust blowing and sensor cleaning'),
  createTagOption('Site update check'),
  createTagOption('Device equipment check'),
  createTagOption('Power circuitry and components works'),
  createTagOption('GPS module works/replacement'),
  createTagOption('GSM module works/replacement'),
  createTagOption('Battery works/replacement'),
  createTagOption('Power supply works/replacement'),
  createTagOption('Antenna works/replacement'),
  createTagOption('Mounts replacement'),
  createTagOption('Software checks/re-installation'),
  createTagOption('PCB works/replacement'),
  createTagOption('Temp/humidity sensor works/replacement'),
  createTagOption('Air quality sensor(s) works/replacement'),
];

const AddMaintenanceLogModal: React.FC<AddMaintenanceLogModalProps> = ({ open, onOpenChange, deviceName }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<Option[]>([]);
  const [maintenanceType, setMaintenanceType] = useState<"preventive" | "corrective">("preventive");

  const { userDetails } = useUserContext();
  const addMaintenanceLog = useAddMaintenanceLog();

  const handleSubmit = async () => {
    if (!date || !description || tags.length === 0) {
      // Basic validation
      alert("Please fill all fields");
      return;
    }

    const logData = {
      date: date.toISOString(),
      tags: tags.map(tag => tag.value),
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Maintenance Log for {deviceName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
            <MultiSelect
              options={DEFAULT_TAGS}
              selected={tags}
              onChange={setTags}
              placeholder="Select or create tags..."
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={addMaintenanceLog.isPending}>
            {addMaintenanceLog.isPending ? "Saving..." : "Save Log"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMaintenanceLogModal;
