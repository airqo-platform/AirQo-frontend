import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React from "react";

interface DeviceDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Record<string, any>;
  onClose: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Device Name",
  device_number: "Channel ID",
  description: "Description",
  latitude: "Latitude",
  longitude: "Longitude",
  visibility: "Data Access",
  isPrimaryInLocation: "Primary Device in Location",
  generation_version: "Generation Version",
  network: "Network",
  generation_count: "Generation Count",
  category: "Category",
  powerType: "Power Type",
  claim_status: "Claim Status",
};

const FIELD_KEYS = [
  "name",
  "device_number",
  "description",
  "latitude",
  "longitude",
  "visibility",
  "isPrimaryInLocation",
  "generation_version",
  "network",
  "generation_count",
  "category",
  "powerType",
  "claim_status",
];

const DeviceDetailsModal: React.FC<DeviceDetailsModalProps> = ({ open, onOpenChange, device, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl md:h-[70%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Device Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
          {FIELD_KEYS.map((key) => (
            <div key={key} className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-1">
                {FIELD_LABELS[key]}
              </span>
              <span className="text-base font-normal break-all">
                {key === "visibility"
                  ? device[key] === true
                    ? "Public"
                    : device[key] === false
                    ? "Private"
                    : "-"
                  : device[key] !== undefined && device[key] !== null && device[key] !== "" ? String(device[key]) : "-"}
              </span>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceDetailsModal; 