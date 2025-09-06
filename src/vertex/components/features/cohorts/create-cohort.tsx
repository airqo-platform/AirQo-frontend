"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import { Input } from "@/components/ui/input";
import { MultiSelectCombobox } from "@/components/ui/multi-select";
import { useDevices } from "@/core/hooks/useDevices";
import { useCreateCohortWithDevices } from "@/core/hooks/useCohorts";
import { useAppSelector } from "@/core/redux/hooks";
import type { Device } from "@/app/types/devices";

interface CreateCohortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (cohortData: { cohort: { _id: string; name: string } }) => void;
  onError?: (error: unknown) => void;
  andNavigate?: boolean;
}

export function CreateCohortDialog({
  open,
  onOpenChange,
  onSuccess,
  onError,
  andNavigate = true,
}: CreateCohortDialogProps) {
  const [name, setName] = useState("");
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { devices, isLoading, error } = useDevices();
  const deviceOptions = (devices || [])
    .map((d: Device) => {
      const id = d?._id as string | undefined;
      const label = (d?.long_name as string) ?? (d?.name as string) ?? id ?? "";
      return id ? { value: id, label: String(label) } : null;
    })
    .filter(Boolean) as { value: string; label: string }[];

  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  const router = useRouter();
  const network = activeNetwork?.net_name || "";

  const { mutate: createCohort, isPending } = useCreateCohortWithDevices();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (name.trim().length < 2) {
      newErrors.name = "Cohort name must be at least 2 characters.";
    }

    if (selectedDevices.length === 0) {
      newErrors.devices = "Please select at least one device.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setName("");
    setSelectedDevices([]);
    setErrors({});
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      createCohort(
        { name, network, deviceIds: selectedDevices },
        {
          onSuccess: (response) => {
            if (onSuccess && response?.cohort) {
              onSuccess(response);
            }

            setName("");
            setSelectedDevices([]);
            setErrors({});

            if (andNavigate && response?.cohort?._id) {
              router.push(`/cohorts/${response.cohort._id}`);
            } else {
              onOpenChange(false);
            }
          },
          onError: (error) => {
            if (onError) {
              onError(error);
            }
          }
        }
      );
    }
  };

  const handleDevicesChange = (devices: string[]) => {
    setSelectedDevices(devices);
    if (devices.length > 0 && errors.devices) {
      setErrors(prev => ({ ...prev, devices: "" }));
    }
  };

  return (
    <ReusableDialog
      isOpen={open}
      onClose={handleCancel}
      title="Create Cohort"
      subtitle={`Network: ${network}`}
      size="lg"
      primaryAction={{
        label: isPending ? "Creating…" : "Submit",
        onClick: handleSubmit,
        disabled: isPending,
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: handleCancel,
        disabled: isPending,
        variant: "outline",
      }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Cohort name
          </label>
          <Input
            placeholder="Cohort name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name && e.target.value.length >= 2) {
                setErrors(prev => ({ ...prev, name: "" }));
              }
            }}
          />
          {errors.name && (
            <p className="text-sm font-medium text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Select Device(s)
          </label>
          <div className="space-y-2">
            <MultiSelectCombobox
              options={deviceOptions}
              placeholder="Select or add devices..."
              onValueChange={handleDevicesChange}
              value={selectedDevices}
              allowCreate={false}
            />
            {isLoading && (
              <p className="text-xs text-muted-foreground">Loading devices…</p>
            )}
            {error && (
              <p className="text-xs text-destructive">Failed to load devices. Please try again.</p>
            )}
            <div className="text-xs text-muted-foreground">
              {selectedDevices.length > 0
                ? `${selectedDevices.length} device(s) selected`
                : "No devices selected"}
            </div>
          </div>
          {errors.devices && (
            <p className="text-sm font-medium text-destructive">{errors.devices}</p>
          )}
        </div>
      </div>
    </ReusableDialog>
  );
}