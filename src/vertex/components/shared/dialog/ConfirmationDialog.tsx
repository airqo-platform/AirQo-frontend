"use client";

import ReusableDialog from "@/components/shared/dialog/ReusableDialog";
import ReusableButton from "@/components/shared/button/ReusableButton";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  isPending?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  isPending = false,
  size = "md",
}: ConfirmationDialogProps) {
  return (
    <ReusableDialog
      isOpen={open}
      onClose={() => !isPending && onOpenChange(false)}
      title={title}
      size={size}
      customFooter={
        <div className="flex items-center justify-end gap-3 w-full px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <ReusableButton
            variant="outlined"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {cancelLabel}
          </ReusableButton>
          <ReusableButton
            variant="filled"
            onClick={() => !isPending && onConfirm()}
            disabled={isPending}
            className={
              destructive ? "bg-red-600 hover:bg-red-700 border-red-600" : undefined
            }
          >
            {confirmLabel}
          </ReusableButton>
        </div>
      }
    >
      <p className="text-gray-600 dark:text-gray-300 py-2">{description}</p>
    </ReusableDialog>
  );
}
