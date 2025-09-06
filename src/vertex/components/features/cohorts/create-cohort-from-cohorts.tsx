"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableInputField from "@/components/shared/inputfield/ReusableInputField";
import { useCreateCohortFromCohorts } from "@/core/hooks/useCohorts";

interface CreateCohortFromSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCohortIds: string[];
  onSuccess?: () => void;
}

export function CreateCohortFromSelectionDialog({
  open,
  onOpenChange,
  selectedCohortIds,
  onSuccess,
}: CreateCohortFromSelectionDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { mutate: createFromCohorts, isPending } = useCreateCohortFromCohorts();

  useEffect(() => {
    if (!open) {
      setName("");
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
    setError("");

    createFromCohorts(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        cohort_ids: selectedCohortIds,
      },
      {
        onSuccess: (response) => {
          onSuccess?.();
          handleClose();
          if (response?.cohort?._id) {
            router.push(`/cohorts/${response.cohort._id}`);
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
        disabled: isPending || name.trim().length < 2 || selectedCohortIds.length === 0,
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
        <ReusableInputField as="textarea" label="Description (Optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this combined cohort" rows={3} />
      </div>
    </ReusableDialog>
  );
}