"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useImportDevice } from "@/core/hooks/useDevices";
import { useAppSelector } from "@/core/redux/hooks";
import { DEVICE_CATEGORIES } from "@/core/constants/devices";

interface ImportDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImportDeviceModal: React.FC<ImportDeviceModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [formData, setFormData] = useState({
    long_name: "",
    category: DEVICE_CATEGORIES[0].value,
    serial_number: "",
    description: "",
    device_number: "",
    writeKey: "",
    readKey: "",
  });

  const [showMore, setShowMore] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  const importDevice = useImportDevice();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.long_name.trim()) {
      newErrors.long_name = "Device name is required";
    }

    if (!formData.serial_number.trim()) {
      newErrors.serial_number = "Serial number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!activeNetwork?.net_name) {
      setErrors({ general: "No active network found" });
      return;
    }

    try {
      const deviceDataToSend = { ...formData };

      // Remove fields with empty values
      (Object.keys(deviceDataToSend) as Array<keyof typeof deviceDataToSend>).forEach((key) => {
        if (!deviceDataToSend[key]) {
          delete deviceDataToSend[key];
        }
      });

      await importDevice.mutateAsync({
        ...deviceDataToSend,
        network: activeNetwork.net_name,
      });

      // Reset form and close modal
      setFormData({
        long_name: "",
        category: DEVICE_CATEGORIES[0].value,
        serial_number: "",
        description: "",
        device_number: "",
        writeKey: "",
        readKey: "",
      });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
      console.error("Import device failed:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleClose = () => {
    setFormData({
      long_name: "",
      category: DEVICE_CATEGORIES[0].value,
      serial_number: "",
      description: "",
      device_number: "",
      writeKey: "",
      readKey: "",
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Device</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {errors.general}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="long_name">
              Device Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="long_name"
              value={formData.long_name}
              onChange={(e) => handleInputChange("long_name", e.target.value)}
              placeholder="Enter device name"
              className={errors.long_name ? "border-red-500" : ""}
            />
            {errors.long_name && (
              <p className="text-sm text-red-600">{errors.long_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                <SelectValue placeholder="Select device category" />
              </SelectTrigger>
              <SelectContent>
                {DEVICE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="serial_number">
              Serial Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="serial_number"
              value={formData.serial_number}
              onChange={(e) => handleInputChange("serial_number", e.target.value)}
              placeholder="Enter serial number"
              className={errors.serial_number ? "border-red-500" : ""}
            />
            {errors.serial_number && (
              <p className="text-sm text-red-600">{errors.serial_number}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter device description"
              rows={3}
            />
          </div>

          {showMore && (
            <div className="space-y-2">
              <Label htmlFor="device_number">Device Number (Optional)</Label>
              <Input
                id="device_number"
                value={formData.device_number}
                onChange={(e) => handleInputChange("device_number", e.target.value)}
                placeholder="Enter device number"
              />

              <Label htmlFor="writeKey">Write Key (Optional)</Label>
              <Input
                id="writeKey"
                value={formData.writeKey}
                onChange={(e) => handleInputChange("writeKey", e.target.value)}
                placeholder="Enter write key"
              />

              <Label htmlFor="readKey">Read Key (Optional)</Label>
              <Input
                id="readKey"
                value={formData.readKey}
                onChange={(e) => handleInputChange("readKey", e.target.value)}
                placeholder="Enter read key"
              />
            </div>
          )}

          <Button type="button" variant="link" onClick={() => setShowMore(!showMore)}>
            {showMore ? "Show Less" : "Show More Options"}
          </Button>

          <div className="text-sm text-gray-600">
            <strong>Network:</strong> {activeNetwork?.net_name || "No active network"}
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={importDevice.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={importDevice.isPending} className="min-w-[100px]">
            {importDevice.isPending ? "Importing..." : "Import Device"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDeviceModal;

