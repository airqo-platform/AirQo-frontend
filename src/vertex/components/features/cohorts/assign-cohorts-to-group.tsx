"use client";

import { useEffect, useMemo, useState } from "react";
import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import { useAssignCohortsToGroup, useCohorts } from "@/core/hooks/useCohorts";
import { useGroups } from "@/core/hooks/useGroups";
import { ComboBox } from "@/components/ui/combobox";
import { MultiSelectCombobox, Option } from "@/components/ui/multi-select";
import { Cohort } from "@/app/types/cohorts";
import { Group } from "@/app/types/groups";

interface AssignCohortsToGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSelectedCohortIds: string[];
  onSuccess?: () => void;
}

export function AssignCohortsToGroupDialog({
  open,
  onOpenChange,
  initialSelectedCohortIds,
  onSuccess,
}: AssignCohortsToGroupDialogProps) {
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedCohortIds, setSelectedCohortIds] = useState<string[]>(initialSelectedCohortIds);
  const [errors, setErrors] = useState<{ group?: string; cohorts?: string }>({});

  const { cohorts: allCohorts, isLoading: isLoadingCohorts } = useCohorts();
  const { groups: allGroups, isLoading: isLoadingGroups } = useGroups();
  const { mutate: assignToGroup, isPending } = useAssignCohortsToGroup();

  useEffect(() => {
    if (open) {
      setSelectedCohortIds(initialSelectedCohortIds);
    }
  }, [open, initialSelectedCohortIds]);

  const cohortOptions: Option[] = useMemo(() => {
    return (allCohorts || []).map((cohort: Cohort) => ({
      value: cohort._id,
      label: cohort.name,
    }));
  }, [allCohorts]);

  const groupOptions = useMemo(() => {
    return (allGroups || []).map((group: Group) => ({
      value: group._id,
      label: group.grp_title,
    }));
  }, [allGroups]);

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setSelectedGroupId("");
      setSelectedCohortIds([]);
      setErrors({});
    }, 150); // Delay to allow for closing animation
  };

  const handleSubmit = () => {
    const newErrors: { group?: string; cohorts?: string } = {};
    if (!selectedGroupId) {
      newErrors.group = "Please select a group.";
    }
    if (selectedCohortIds.length === 0) {
      newErrors.cohorts = "Please select at least one cohort.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    assignToGroup(
      {
        groupId: selectedGroupId,
        cohortIds: selectedCohortIds,
      },
      {
        onSuccess: () => {
          onSuccess?.();
          handleClose();
        },
      }
    );
  };

  return (
    <ReusableDialog
      isOpen={open}
      onClose={handleClose}
      title="Assign Cohorts to Group"
      subtitle="Select a group and the cohorts to be assigned"
      size="lg"
      primaryAction={{
        label: isPending ? "Assigning..." : "Assign",
        onClick: handleSubmit,
        disabled: isPending || !selectedGroupId || selectedCohortIds.length === 0,
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: handleClose,
        disabled: isPending,
        variant: "outline",
      }}
    >
      <div className="space-y-6 py-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Group <span className="text-red-500">*</span></label>
          <ComboBox
            options={groupOptions}
            value={selectedGroupId}
            onValueChange={(value) => {
              setSelectedGroupId(value);
              if (errors.group) setErrors(e => ({...e, group: undefined}));
            }}
            placeholder="Select a group"
            searchPlaceholder="Search groups..."
            emptyMessage={isLoadingGroups ? "Loading groups..." : "No groups found."}
            disabled={isPending || isLoadingGroups}
          />
          {errors.group && <p className="text-sm text-destructive mt-1">{errors.group}</p>}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Cohorts <span className="text-red-500">*</span></label>
          <MultiSelectCombobox
            options={cohortOptions}
            value={selectedCohortIds}
            onValueChange={(values) => {
              setSelectedCohortIds(values);
              if (errors.cohorts) setErrors(e => ({...e, cohorts: undefined}));
            }}
            placeholder="Select cohorts..."
            // disabled={isPending || isLoadingCohorts}
            allowCreate={false}
          />
          {errors.cohorts && <p className="text-sm text-destructive mt-1">{errors.cohorts}</p>}
        </div>
      </div>
    </ReusableDialog>
  );
}