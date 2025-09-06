import React from "react";
import DeployDeviceComponent from "./deploy-device-component";
import { Device } from "@/app/types/devices";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";

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
    <ReusableDialog
      isOpen={open}
      onClose={handleClose}
      title="Deploy device"
      className="w-screen h-[90vh] max-w-none max-h-none m-0 p-0"
      contentAreaClassName="p-6"
      maxHeight="h-full"
      showFooter={false}
    >
      <DeployDeviceComponent prefilledDevice={device} onClose={handleClose} />
    </ReusableDialog>
  );
};

export default DeployDeviceModal;
