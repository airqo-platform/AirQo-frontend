"use client";

import React, { useState } from "react";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import { useCreateDevice } from "@/core/hooks/useDevices";
import { useAppSelector } from "@/core/redux/hooks";
import { DEVICE_CATEGORIES } from "@/core/constants/devices";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import ReusableSelectInput from "@/components/shared/select/ReusableSelectInput";

interface CreateDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateDeviceModal: React.FC<CreateDeviceModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [formData, setFormData] = useState({
    long_name: "",
    category: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  const createDevice = useCreateDevice();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.long_name.trim()) {
      newErrors.long_name = "Device name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!activeNetwork?.net_name) {
      setErrors({ general: "No active network found" });
      return;
    }

    try {
      await createDevice.mutateAsync({
        long_name: formData.long_name.trim(),
        category: formData.category,
        description: formData.description.trim() || undefined,
        network: activeNetwork.net_name,
      });

      // Reset form and close modal
      setFormData({
        long_name: "",
        category: "",
        description: "",
      });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
      console.error("Create device failed:", error);
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
      category: "",
      description: "",
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <ReusableDialog
      isOpen={open}
      onClose={handleClose}
      title="Add AirQo Device"
      subtitle={`Network: ${activeNetwork?.net_name}`}
      size="md"
      primaryAction={{
        label: createDevice.isPending ? "Adding..." : "Add Device",
        onClick: handleSubmit,
        disabled: createDevice.isPending,
        className: "min-w-[100px]",
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: handleClose,
        disabled: createDevice.isPending,
        variant: "outline",
      }}
    >
      <div className="space-y-4">
        {errors.general && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {errors.general}
          </div>
        )}
        <ReusableInputField
          label="Device Name"
          id="long_name"
          value={formData.long_name}
          onChange={(e) => handleInputChange("long_name", e.target.value)}
          placeholder="Enter device name"
          error={errors.long_name}
          required
        />
        <ReusableSelectInput
          label="Category"
          id="category"
          value={formData.category}
          onChange={(e) => handleInputChange("category", e.target.value)}
          placeholder="Select device category"
          error={errors.category}
          required
        >
          {DEVICE_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </ReusableSelectInput>
        <ReusableInputField
          as="textarea"
          label="Description (Optional)"
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Enter device description"
          rows={3}
        />
      </div>
    </ReusableDialog>
  );
};

export default CreateDeviceModal;
