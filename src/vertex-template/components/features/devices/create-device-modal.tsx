"use client";

import React, { useState } from "react";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import { useCreateDevice } from "@/core/hooks/useDevices";
import { useAppSelector } from "@/core/redux/hooks";
import { DEVICE_CATEGORIES } from "@/core/constants/devices";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import ReusableSelectInput from "@/components/shared/select/ReusableSelectInput";
import { MultiSelectCombobox } from "@/components/ui/multi-select";
import { DEFAULT_DEVICE_TAGS } from "@/core/constants/devices";
import { Label } from "@/components/ui/label";
import { useBanner } from "@/context/banner-context";
import { useBannerWithDelay } from "@/core/hooks/useBannerWithDelay";
import { getApiErrorMessage } from "@/core/utils/getApiErrorMessage";

interface CreateDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  networkName?: string;
}

const CreateDeviceModal: React.FC<CreateDeviceModalProps> = ({
  open,
  onOpenChange,
  networkName,
}) => {
  const [formData, setFormData] = useState({
    long_name: "",
    category: "",
    description: "",
    tags: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showBanner } = useBanner();
  const { showBannerWithDelay } = useBannerWithDelay();
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

    const effectiveNetworkName = networkName || activeNetwork?.net_name;

    if (!effectiveNetworkName) {
      showBanner({ severity: 'error', message: 'No active Sensor Manufacturer found', scoped: true });
      return;
    }

    try {
      await createDevice.mutateAsync({
        long_name: formData.long_name.trim(),
        category: formData.category,
        description: formData.description.trim() || undefined,
        network: effectiveNetworkName,
        tags: formData.tags,
      }, {
        onSuccess: (data, variables) => {
          showBannerWithDelay({
            severity: 'success',
            title: 'Success',
            message: `${variables.long_name.trim()} has been created successfully.`,
            scoped: false
          }, 300);
          setFormData({ long_name: "", category: "", description: "", tags: [] });
          setErrors({});
          onOpenChange(false);
        },
        onError: (error) => {
          showBanner({ severity: 'error', message: `Creation Failed: ${getApiErrorMessage(error)}`, scoped: true });
        },
      });
    } catch (error) {
      showBanner({ severity: 'error', message: `Creation Failed: ${getApiErrorMessage(error)}`, scoped: true });
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
    onOpenChange(false);
  };

  React.useEffect(() => {
    if (!open) {
      setFormData({
        long_name: "",
        category: "",
        description: "",
        tags: [],
      });
      setErrors({});
    }
  }, [open]);

  return (
    <ReusableDialog
      isOpen={open}
      onClose={handleClose}
      title="Add Device"
      subtitle={`Sensor Manufacturer: ${networkName || activeNetwork?.net_name || "N/A"}`}
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
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tags (Optional)</Label>
          <MultiSelectCombobox
            options={DEFAULT_DEVICE_TAGS}
            placeholder="Select or create tags..."
            value={formData.tags}
            onValueChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
            allowCreate={true}
          />
        </div>
      </div>
    </ReusableDialog>
  );
};

export default CreateDeviceModal;
