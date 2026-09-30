'use client';

import React, { useState } from 'react';
import Dialog from '@/shared/components/ui/dialog';

interface VoidDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: (reason: string) => void | Promise<void>;
  loading?: boolean;
}

const VoidDialog: React.FC<VoidDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel,
  onConfirm,
  loading = false,
}) => {
  const [reason, setReason] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const isPending = loading || localLoading;

  const handleConfirm = async () => {
    setLocalLoading(true);
    try {
      await onConfirm(reason.trim());
    } finally {
      setLocalLoading(false);
    }
  };

  const handleClose = () => {
    if (!isPending) {
      setReason('');
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
      primaryAction={{
        label: confirmLabel,
        onClick: handleConfirm,
        disabled: isPending,
        loading: isPending,
        variant: 'danger',
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: handleClose,
        disabled: isPending,
        variant: 'outlined',
      }}
    >
      <div className="space-y-4">
        <p className="text-sm text-foreground">{description}</p>
        <label className="block">
          <span className="text-sm font-medium text-foreground">
            Reason (optional)
          </span>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            placeholder="Why is this being voided?"
          />
        </label>
      </div>
    </Dialog>
  );
};

export default VoidDialog;
