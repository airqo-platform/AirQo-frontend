'use client';

import React, { useEffect, useState } from 'react';
import Dialog from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui';
import { billingService } from '@/shared/services/billingService';
import type { BillingInvoice } from '@/shared/types/billing';
import { useBillingAction } from '@/modules/system-billing/lib/hooks';
import {
  fromDateTimeInputValue,
  nowAsDateTimeInputValue,
} from '@/modules/system-billing/lib/format';

interface MarkSentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: BillingInvoice;
  onSuccess: () => void;
}

const MarkSentDialog: React.FC<MarkSentDialogProps> = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}) => {
  const [sentAt, setSentAt] = useState(nowAsDateTimeInputValue);
  const [note, setNote] = useState('');
  const { run, isBusy } = useBillingAction();
  const isSubmitting = isBusy('mark-sent');

  useEffect(() => {
    if (!isOpen) return;
    setSentAt(nowAsDateTimeInputValue());
    setNote('');
  }, [isOpen]);

  const handleSubmit = () =>
    run(
      'mark-sent',
      () =>
        billingService.markInvoiceSent(invoice.id, {
          sent_at: fromDateTimeInputValue(sentAt) || undefined,
          note: note.trim() || undefined,
        }),
      {
        success: 'Marked as sent',
        onSuccess: () => {
          onSuccess();
          onClose();
        },
      }
    );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => (!isSubmitting ? onClose() : undefined)}
      title="Mark as Sent"
      size="md"
      primaryAction={{
        label: 'Mark sent',
        onClick: handleSubmit,
        disabled: isSubmitting,
        loading: isSubmitting,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: () => onClose(),
        disabled: isSubmitting,
        variant: 'outlined',
      }}
    >
      <div className="space-y-4">
        <p className="text-sm text-foreground">
          Record that this invoice was sent to the customer outside the system.
        </p>
        <Input
          type="datetime-local"
          label="Sent at"
          value={sentAt}
          onChange={e => setSentAt(e.target.value)}
          description="Defaults to now."
        />
        <Input
          label="Note (optional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Sent via post / hand-delivered…"
        />
      </div>
    </Dialog>
  );
};

export default MarkSentDialog;
