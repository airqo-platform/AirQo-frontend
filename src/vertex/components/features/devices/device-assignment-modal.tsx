"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/core/redux/hooks";
import { Device } from "@/app/types/devices";
import { useAssignDeviceToOrganization } from "@/core/hooks/useDevices";
import { Label } from "@/components/ui/label";
import { ComboBox } from "@/components/ui/combobox";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DeviceAssignmentModalProps {
  devices: Device[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isLoadingDevices: boolean;
}

const DeviceAssignmentModal: React.FC<DeviceAssignmentModalProps> = ({
  devices,
  isOpen,
  onClose,
  onSuccess,
  isLoadingDevices,
}) => {
  const router = useRouter();
  const { userDetails, userGroups } = useAppSelector((state) => state.user);
  const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState("");

  const assignDevice = useAssignDeviceToOrganization();

  const handleAssign = async () => {
    if (!selectedOrganization || !selectedDevice || !userDetails?._id) return;

    await assignDevice.mutateAsync({
      device_name: selectedDevice,
      organization_id: selectedOrganization,
      user_id: userDetails._id,
    });
    onSuccess();
  };

  const handleClose = () => {
    setSelectedOrganization(null);
    setSelectedDevice(""); // Reset device selection
    onClose();
  };

  const handleClaimDevice = () => {
    router.push("/devices/claim");
  };

  const handleSelectChange = (value: string) => {
    setSelectedOrganization(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Share Device</DialogTitle>
          <DialogDescription>
            Choose an organization to share a device with. Organization members will be able to
            view and monitor this device.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="groupID">Choose Organization</Label>
            <Select onValueChange={handleSelectChange} value={selectedOrganization || ""}>
              <SelectTrigger id="groupID">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {userGroups.map((group) => (
                  <SelectItem key={group._id} value={group._id}>
                    {group.grp_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="deviceName">Choose Device</Label>
            <ComboBox
              options={devices.map((dev) => ({
                value: dev.long_name || dev.name,
                label: dev.long_name || dev.name,
              }))}
              value={selectedDevice}
              onValueChange={(e) => setSelectedDevice(e)}
              placeholder={isLoadingDevices ? "Loading devices..." : "Select or type device name"}
              searchPlaceholder="Search or type device name..."
              emptyMessage="No devices found"
              disabled={isLoadingDevices}
              allowCustomInput={true}
              onCustomAction={handleClaimDevice}
              customActionLabel="Device not listed? Claim a new device"
              className="w-full"
            />
          </div>

          {selectedOrganization && (
            <div className="p-3 bg-muted rounded-lg">
              <h5 className="font-medium mb-2">What happens when you share:</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Organization members can view device data and status</li>
                <li>• You retain full ownership and control</li>
                <li>• You can unshare the device at any time</li>
                <li>• Device will appear in organization&apos;s device list</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedOrganization || !selectedDevice || assignDevice.isPending}
          >
            {assignDevice.isPending ? "Sharing..." : "Share Device"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { DeviceAssignmentModal };
