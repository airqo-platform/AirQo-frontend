import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import React from "react";
import DeployDeviceComponent from "./deploy-device-component";
import { Device } from "@/app/types/devices";

interface DeployDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device;
}

const DeployDeviceModal: React.FC<DeployDeviceModalProps> = ({ open, onOpenChange, device }) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-screen w-screen max-w-none max-h-none m-0 p-0 rounded-none">
        <div className="h-full overflow-y-auto p-6">
          <DeployDeviceComponent 
            prefilledDevice={device} 
            onClose={handleClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeployDeviceModal;

