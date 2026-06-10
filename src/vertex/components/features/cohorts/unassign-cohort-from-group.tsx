"use client";

import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { Group } from "@/app/types/groups";
import { useUnassignCohortsFromGroup } from "@/core/hooks/useCohorts";

interface UnassignCohortFromGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Group | null;
  cohortId: string;
  cohortName: string;
  onSuccess?: () => void;
}

export function UnassignCohortFromGroupDialog({
  open,
  onOpenChange,
  organization,
  cohortId,
  cohortName,
  onSuccess,
}: UnassignCohortFromGroupDialogProps) {
  const { mutate: unassignFromGroup, isPending } = useUnassignCohortsFromGroup({
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const handleConfirm = () => {
    if (!organization) return;

    unassignFromGroup(
      {
        groupId: organization._id,
        cohortIds: [cohortId],
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <ReusableDialog
      isOpen={open}
      onClose={() => !isPending && onOpenChange(false)}
      title="Unassign Organization"
      size="md"
      customFooter={
        <div className="flex items-center justify-end gap-3 w-full px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <ReusableButton
            variant="outlined"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </ReusableButton>
          <ReusableButton
            onClick={handleConfirm}
            disabled={isPending || !organization}
            variant="filled"
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? "Unassigning..." : "Confirm Unassign"}
          </ReusableButton>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        <p className="text-gray-600 dark:text-gray-300">
          Are you sure you want to unassign <strong>{organization?.grp_title}</strong> from cohort <strong>{cohortName}</strong>?
        </p>
        <p className="text-sm text-muted-foreground">
          This action will remove the organization&apos;s access to this cohort. This cannot be undone.
        </p>
      </div>
    </ReusableDialog>
  );
}