"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MultiSelectCombobox } from "@/components/ui/multi-select";

const devices = [
  { value: "aq_29", label: "Aq_29" },
  { value: "aq_34", label: "Aq_34" },
  { value: "aq_35", label: "Aq_35" },
  { value: "airqo_g5363", label: "Airqo_g5363" },
];

export function CreateCohortDialog({open, onOpenChange}: {open:boolean; onOpenChange: (open: boolean) => void;}) {
  const [name, setName] = useState("");
  const [network, setNetwork] = useState("airqo");
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (name.trim().length < 2) {
      newErrors.name = "Cohort name must be at least 2 characters.";
    }

    if (selectedDevices.length === 0) {
      newErrors.devices = "Please select at least one device.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setName("");
    setNetwork("airqo");
    setSelectedDevices([]);
    setErrors({});
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const values = {
        name,
        network,
        devices: selectedDevices,
      };
      console.log(values);
      
      // Reset form after successful submission
      setName("");
      setNetwork("airqo");
      setSelectedDevices([]);
      setErrors({});
      onOpenChange(false);
    }
  };

  const handleDevicesChange = (devices: string[]) => {
    setSelectedDevices(devices);
    // Clear error when devices are selected
    if (devices.length > 0 && errors.devices) {
      setErrors(prev => ({...prev, devices: ""}));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Cohort</DialogTitle>
          <DialogDescription>
            Create a new cohort by providing the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Cohort name
            </label>
            <Input 
              placeholder="Enter cohort name" 
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                // Clear error when user starts typing
                if (errors.name && e.target.value.length >= 2) {
                  setErrors(prev => ({...prev, name: ""}));
                }
              }}
            />
            {errors.name && (
              <p className="text-sm font-medium text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Network
            </label>
            <Input 
              disabled 
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
            />
            {errors.network && (
              <p className="text-sm font-medium text-destructive">{errors.network}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Select Device(s)
            </label>
            <div className="space-y-2">
              <MultiSelectCombobox
                options={devices.map((d) => ({ value: d.value, label: d.label }))}
                placeholder="Select or add devices..."
                onValueChange={handleDevicesChange}
                value={selectedDevices}
              />
              <div className="text-xs text-muted-foreground">
                {selectedDevices.length > 0
                  ? `${selectedDevices.length} device(s) selected`
                  : "No devices selected"}
              </div>
            </div>
            {errors.devices && (
              <p className="text-sm font-medium text-destructive">{errors.devices}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}