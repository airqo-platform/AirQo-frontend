'use client';

import React from 'react';
import { Dialog } from '@/shared/components/ui';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  warning?: string;
  confirmLabel?: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  title,
  itemName,
  warning,
  confirmLabel = 'Delete',
  isDeleting,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="This action cannot be undone."
      size="md"
      primaryAction={{
        label: confirmLabel,
        onClick: onConfirm,
        variant: 'danger',
        disabled: isDeleting,
        loading: isDeleting,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
        variant: 'outlined',
        disabled: isDeleting,
      }}
    >
      <div className="space-y-3">
        <p className="text-sm leading-6 text-muted-foreground">
          Are you sure you want to delete{' '}
          <span className="font-medium text-foreground">{itemName}</span>?
          {warning && (
            <span className="mt-2 block rounded-lg bg-amber-50 p-3 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              {warning}
            </span>
          )}
        </p>
      </div>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
