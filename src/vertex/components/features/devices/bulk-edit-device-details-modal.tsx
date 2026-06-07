import React, { useMemo, useState } from "react";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableSelectInput from "@/components/shared/select/ReusableSelectInput";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import { DEVICE_CATEGORIES } from "@/core/constants/devices";
import { useUpdateDeviceBulk } from "@/core/hooks/useDevices";
import { useBanner } from "@/context/banner-context";
import { useBannerWithDelay } from "@/core/hooks/useBannerWithDelay";
import { getApiErrorMessage } from "@/core/utils/getApiErrorMessage";

type EditableDeviceField =
  | "category"
  | "network"
  | "visibility"
  | "authRequired"
  | "tags";

type FieldValue = string | string[] | boolean | null;

interface BulkEditDevicesModalProps {
  open: boolean;
  onClose: () => void;
  deviceIds: string[];
}

export default function BulkEditDevicesModal({
  open,
  onClose,
  deviceIds,
}: BulkEditDevicesModalProps) {
  const { showBanner } = useBanner();
  const { showBannerWithDelay } = useBannerWithDelay();
  const bulkUpdate = useUpdateDeviceBulk({
    onSuccess: () => {
      showBannerWithDelay({ severity: 'success', message: 'Devices updated successfully.', scoped: false });
    },
    onError: (error) => {
      showBanner({ severity: 'error', message: `Bulk update failed: ${getApiErrorMessage(error)}`, scoped: true });
    },
  });

  const [step, setStep] = useState<"choose_field" | "confirm">("choose_field");
  const [selectedField, setSelectedField] = useState<EditableDeviceField | null>(null);
  const [value, setValue] = useState<FieldValue>(null);

  const fieldOptions = useMemo(
    () => [
      { label: "Category", value: "category" },
      { label: "Network", value: "network" },
      { label: "Auth Required", value: "authRequired" },
    ],
    []
  );

  const hasValidValue = useMemo(() => {
    if (!selectedField) return false;
    if (value === null) return false;

    if (selectedField === "network") {
      return typeof value === "string" && value.trim().length > 0;
    }

    if (selectedField === "tags") {
      return Array.isArray(value);
    }

    return true;
  }, [selectedField, value]);

  const reset = () => {
    setStep("choose_field");
    setSelectedField(null);
    setValue(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleProceed = () => {
    if (!selectedField || !hasValidValue) return;
    setStep("confirm");
  };

  const handleSubmit = () => {
    if (!selectedField || !hasValidValue || deviceIds.length === 0) return;

    const updateData = { [selectedField]: value };

    bulkUpdate.mutate({ deviceIds, updateData }, { onSuccess: () => handleClose() });
  };

  const renderFieldInput = () => {
    switch (selectedField) {
      case "category":
        return (
          <ReusableSelectInput
            label="Category"
            value={(value as string) || ""}
            onChange={(e) => setValue(e.target.value)}
          >
            {DEVICE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </ReusableSelectInput>
        );

      case "network":
        return (
          <ReusableInputField
            label="Network"
            value={(value as string) || ""}
            onChange={(e) => setValue(e.target.value)}
          />
        );

      
      case "authRequired":
        return (
          <ReusableSelectInput
            label={"Auth Required"}
            value={String(value ?? "")}
            onChange={(e) => setValue(e.target.value === "true")}
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </ReusableSelectInput>
        );

      default:
        return null;
    }
  };

  return (
    <ReusableDialog
      isOpen={open}
      onClose={handleClose}
      title="Bulk Edit Devices"
      size="lg"
      secondaryAction={
        step === "choose_field"
          ? { label: "Cancel", onClick: handleClose }
          : { label: "Back", onClick: () => setStep("choose_field") }
      }
      primaryAction={{
        label: step === "choose_field" ? "Continue" : "Confirm Update",
        onClick: step === "choose_field" ? handleProceed : handleSubmit,
        disabled:
          step === "choose_field"
            ? !selectedField || !hasValidValue
            : bulkUpdate.isPending || !hasValidValue,
        className: step === "confirm" ? "min-w-[140px]" : undefined,
      }}
    >
      {step === "choose_field" && (
        <div className="space-y-4 py-2">
          <ReusableSelectInput
            label="Select field to update"
            value={selectedField || ""}
            onChange={(e) => {
              const newField = e.target.value as EditableDeviceField;
              setSelectedField(newField);
              setValue(null);
            }}
          >
            <option value="">Choose field</option>
            {fieldOptions.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </ReusableSelectInput>

          {selectedField && (
            <div className="pt-2">{renderFieldInput()}</div>
          )}
        </div>
      )}

      {step === "confirm" && (
        <div className="space-y-4 py-2">
          <div className="p-4 border rounded-md bg-muted">
            <p className="text-sm font-medium">You are about to update:</p>
            <p className="text-sm mt-1">
              <b>{selectedField}</b> →{" "}
              <span className="text-blue-600 font-medium">
                {JSON.stringify(value)}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              This will affect <strong>{deviceIds.length}</strong> devices.
            </p>
          </div>
        </div>
      )}
    </ReusableDialog>
  );
}