"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import { useCreateCohortFromCohorts } from "@/core/hooks/useCohorts";
import { useNetworks } from "@/core/hooks/useNetworks";
import ReusableSelectInput from "@/components/shared/select/ReusableSelectInput";

interface CreateCohortFromSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCohortIds: string[];
  onSuccess?: () => void;
  andNavigate?: boolean;
}

export function CreateCohortFromSelectionDialog({
  open,
  onOpenChange,
  selectedCohortIds,
  onSuccess,
  andNavigate = true,
}: CreateCohortFromSelectionDialogProps) {
  const [name, setName] = useState("");
  const [network, setNetwork] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { mutate: createFromCohorts, isPending } = useCreateCohortFromCohorts();
  const { networks, isLoading: isLoadingNetworks } = useNetworks();

  useEffect(() => {
    if (!open) {
      setName("");
      setNetwork("");
      setDescription("");
      setError("");
    }
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (name.trim().length < 2) {
      setError("Cohort name must be at least 2 characters.");
      return;
    }
    if (!network) {
      setError("Please select a network.");
      return;
    }
    setError("");

    createFromCohorts(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        cohort_ids: selectedCohortIds,
        network,
      },
      {
        onSuccess: (response) => {
          onSuccess?.();
          if (andNavigate && response?.data?._id) {
            router.push(`/admin/cohorts/${response.data._id}`);
          } else {
            handleClose();
          }
        },
      }
    );
  };

  return (
    <ReusableDialog
      isOpen={open}
      onClose={handleClose}
      title="Create Cohort from Selection"
      subtitle={`${selectedCohortIds.length} cohort(s) selected`}
      size="md"
      primaryAction={{
        label: isPending ? "Creating..." : "Create",
        onClick: handleSubmit,
        disabled: isPending || name.trim().length < 2 || selectedCohortIds.length === 0 || !network,
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: handleClose,
        disabled: isPending,
        variant: "outline",
      }}
    >
      <div className="space-y-4">
        <ReusableInputField label="New Cohort Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter a name for the new cohort" required error={error} />
        <ReusableSelectInput
          label="Network"
          id="network"
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
          required
          placeholder={isLoadingNetworks ? "Loading networks..." : "Select a network"}
          disabled={isLoadingNetworks}
        >
          {networks.map((network) => (
            <option key={network.net_name} value={network.net_name}>
              {network.net_name}
            </option>
          ))}
        </ReusableSelectInput>
        <ReusableInputField as="textarea" label="Description (Optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this combined cohort" rows={3} />
      </div>
    </ReusableDialog>
  );
}