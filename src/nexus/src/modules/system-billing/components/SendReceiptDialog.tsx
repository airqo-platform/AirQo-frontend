'use client';

import React, { useEffect, useState } from 'react';
import Dialog from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui';
import { billingService } from '@/shared/services/billingService';
import type { BillingPayment } from '@/shared/types/billing';
import { useBillingAction } from '../lib/hooks';

interface SendReceiptDialogProps {
  isOpen: boolean;
  payment: BillingPayment | null;
  onClose: () => void;
  onSent?: () => unknown | Promise<unknown>;
}

const parseEmails = (value: string): string[] =>
  value
    .split(/[,\n;]+/)
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);

/**
 * Sends a receipt by email. Shared by the payments list and the invoice detail
 * payments table so both use one implementation (and one single-flight guard).
 */
const SendReceiptDialog: React.FC<SendReceiptDialogProps> = ({
  isOpen,
  payment,
  onClose,
  onSent,
}) => {
  const [toInput, setToInput] = useState('');
  const [ccInput, setCcInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { run, isBusy } = useBillingAction();

  useEffect(() => {
    if (isOpen) {
      setToInput('');
      setCcInput('');
      setError(null);
    }
  }, [isOpen]);

  const isSending = isBusy('send-receipt');

  const handleSend = async () => {
    if (!payment) return;

    const to = parseEmails(toInput);
    if (to.length === 0) {
      setError('Add at least one recipient email address.');
      return;
    }

    setError(null);
    await run(
      'send-receipt',
      () =>
        billingService.sendReceipt(payment.id, {
          to,
          cc: parseEmails(ccInput),
        }),
      {
        success: 'Receipt sent',
        onSuccess: async () => {
          onClose();
          await onSent?.();
        },
        // Rendered inline instead of a toast: the dialog stays open on failure.
        silent: true,
        onError: message => setError(message),
      }
    );
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => (isSending ? undefined : onClose())}
      title="Send Receipt"
      size="md"
      primaryAction={{
        label: 'Send receipt',
        onClick: handleSend,
        disabled: isSending,
        loading: isSending,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
        disabled: isSending,
        variant: 'outlined',
      }}
    >
      <div className="space-y-4">
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Input
          label="To"
          value={toInput}
          onChange={event => setToInput(event.target.value)}
          placeholder="billing@example.com"
          description="Comma-separated emails. Defaults to the customer's billing addresses on file."
          disabled={isSending}
        />

        <Input
          label="Cc (optional)"
          value={ccInput}
          onChange={event => setCcInput(event.target.value)}
          placeholder="finance@example.com"
          disabled={isSending}
        />
      </div>
    </Dialog>
  );
};

export default SendReceiptDialog;
