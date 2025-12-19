"use client";

import React, { useState } from "react";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import ReusableSelectInput from "@/components/shared/select/ReusableSelectInput";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { useImportDevice } from "@/core/hooks/useDevices";
import { DEVICE_CATEGORIES } from "@/core/constants/devices";
import { useNetworks } from "@/core/hooks/useNetworks";
import { useUserContext } from "@/core/hooks/useUserContext";
import { useGroupCohorts } from "@/core/hooks/useCohorts";
import { useAppSelector } from "@/core/redux/hooks";

interface ImportDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledNetwork?: string;
}

const ImportDeviceModal: React.FC<ImportDeviceModalProps> = ({
  open,
  onOpenChange,
  prefilledNetwork,
}) => {
  const [formData, setFormData] = useState({
    long_name: "",
    network: prefilledNetwork || "",
    category: DEVICE_CATEGORIES[0].value,
    serial_number: "",
    description: "",
    device_number: "",
    writeKey: "",
    readKey: "",
    api_code: "",
  });

  const [showMore, setShowMore] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const importDevice = useImportDevice();
  const { networks, isLoading: isLoadingNetworks } = useNetworks();

  const { userContext, activeGroup } = useUserContext();
  const userDetails = useAppSelector((state) => state.user.userDetails);

  const shouldFetchGroupCohorts = userContext === 'external-org' && !!activeGroup?._id;

  const { data: groupCohorts } = useGroupCohorts(activeGroup?._id, {
    enabled: shouldFetchGroupCohorts,
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.long_name.trim()) {
      newErrors.long_name = "Device name is required";
    }
    if (!formData.network) {
      newErrors.network = "Network is required";
    }

    if (!formData.serial_number.trim()) {
      newErrors.serial_number = "Serial number is required";
    }

    if (!formData.api_code?.trim()) {
      newErrors.api_code = "Device Connection URL is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCohortId = (): string | undefined => {
    if (userContext === 'external-org' && groupCohorts && groupCohorts.length > 0) {
      return groupCohorts[0];
    }

    return undefined;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const deviceDataToSend = { ...formData };

    // Remove fields with empty values
    (Object.keys(deviceDataToSend) as Array<keyof typeof deviceDataToSend>).forEach((key) => {
      if (!deviceDataToSend[key]) {
        delete deviceDataToSend[key];
      }
    });

    // Add cohort_id if applicable
    const cohortId = getCohortId();
    const userId = userDetails?._id;

    if (!userId) {
      console.error("User ID is missing");
      return;
    }

    importDevice.mutate(
      {
        ...deviceDataToSend,
        user_id: userId,
        ...(cohortId && { cohort_id: cohortId }),
      },
      { onSuccess: () => onOpenChange(false) }
    );
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
        network: prefilledNetwork || "",
        category: DEVICE_CATEGORIES[0].value,
        serial_number: "",
        description: "",
        device_number: "",
        writeKey: "",
        readKey: "",
        api_code: "",
      });
      setErrors({});
      setShowMore(false);
    }
  }, [open, prefilledNetwork]);

  return (
    <ReusableDialog
      isOpen={open}
      onClose={handleClose}
      title="Import Device"
      size="md"
      primaryAction={{
        label: importDevice.isPending ? "Importing..." : "Import Device",
        onClick: handleSubmit,
        disabled: importDevice.isPending,
        className: "min-w-[100px]",
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: handleClose,
        disabled: importDevice.isPending,
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
          label="Network"
          id="network"
          value={formData.network}
          onChange={(e) => handleInputChange("network", e.target.value)}
          error={errors.network}
          required
          placeholder={isLoadingNetworks ? "Loading networks..." : "Select a network"}
          disabled={isLoadingNetworks}
        >
          {networks
            .filter((network) => network.net_name.toLowerCase() !== 'airqo')
            .map((network) => (
              <option key={network.net_name} value={network.net_name}>
                {network.net_name}
              </option>
            ))}
        </ReusableSelectInput>

        <ReusableSelectInput
          label="Category"
          id="category"
          value={formData.category}
          onChange={(e) => handleInputChange("category", e.target.value)}
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
          label="Serial Number"
          id="serial_number"
          value={formData.serial_number}
          onChange={(e) => handleInputChange("serial_number", e.target.value)}
          placeholder="Enter serial number"
          error={errors.serial_number}
          required
        />

        <ReusableInputField
          label="Device Connection URL"
          id="api_code"
          value={formData.api_code}
          onChange={(e) => handleInputChange("api_code", e.target.value)}
          placeholder="https://api.mair.com/v1/12345"
          error={errors.api_code}
          required
        />

        <ReusableInputField
          as="textarea"
          label="Description (Optional)"
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Enter device description"
          rows={3}
        />

        {showMore && (
          <div className="space-y-4 pt-2 border-t">
            <ReusableInputField
              label="Device Number (Optional)"
              id="device_number"
              value={formData.device_number}
              onChange={(e) => handleInputChange("device_number", e.target.value)}
              placeholder="Enter device number"
            />

            <ReusableInputField
              label="Write Key (Optional)"
              id="writeKey"
              value={formData.writeKey}
              onChange={(e) => handleInputChange("writeKey", e.target.value)}
              placeholder="Enter write key"
            />

            <ReusableInputField
              label="Read Key (Optional)"
              id="readKey"
              value={formData.readKey}
              onChange={(e) => handleInputChange("readKey", e.target.value)}
              placeholder="Enter read key"
            />
          </div>
        )}

        <ReusableButton variant="text" onClick={() => setShowMore(!showMore)} className="p-0 h-auto">
          {showMore ? "Show Less" : "Show More Options"}
        </ReusableButton>
      </div>
    </ReusableDialog>
  );
};

export default ImportDeviceModal;
