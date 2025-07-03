"use client";

import React, { useState } from "react";
import { Building2, Users, Check, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/core/redux/hooks";
import { Device } from "@/app/types/devices";
import { useAssignDeviceToOrganization } from "@/core/hooks/useDevices";

interface DeviceAssignmentModalProps {
  device: Device;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DeviceAssignmentModal: React.FC<DeviceAssignmentModalProps> = ({
  device,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { userDetails, userGroups } = useAppSelector((state) => state.user);
  const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null);
  
  const assignDevice = useAssignDeviceToOrganization();

  const handleAssign = async () => {
    if (!selectedOrganization || !userDetails?._id) return;

    try {
      await assignDevice.mutateAsync({
        device_name: device.name,
        organization_id: selectedOrganization,
        user_id: userDetails._id,
      });
      onSuccess();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleClose = () => {
    setSelectedOrganization(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Device
          </DialogTitle>
          <DialogDescription>
            Choose an organization to share <strong>{device.long_name}</strong> with.
            Organization members will be able to view and monitor this device.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Select Organization</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {userGroups.map((group) => (
                <div
                  key={group._id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedOrganization === group._id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedOrganization(group._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{group.grp_title}</p>
                    </div>
                  </div>
                  {selectedOrganization === group._id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {selectedOrganization && (
            <div className="p-3 bg-muted rounded-lg">
              <h5 className="font-medium mb-2">What happens when you share:</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Organization members can view device data and status</li>
                <li>• You retain full ownership and control</li>
                <li>• You can unshare the device at any time</li>
                <li>• Device will appear in organization's device list</li>
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
            disabled={!selectedOrganization || assignDevice.isPending}
          >
            {assignDevice.isPending ? "Sharing..." : "Share Device"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { DeviceAssignmentModal }; 