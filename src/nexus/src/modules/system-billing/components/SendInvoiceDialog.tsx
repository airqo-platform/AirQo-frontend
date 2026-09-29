'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Dialog from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/toast';
import { billingService } from '@/shared/services/billingService';
import type { BillingInvoice, BillingCustomer } from '@/shared/types/billing';
import { useBillingAction } from '@/modules/system-billing/lib/hooks';

type SendMode = 'send' | 'remind';

interface SendInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: BillingInvoice;
  mode: SendMode;
  defaultCc?: string[];
  onSuccess: () => void;
}

const EMAIL_SPLIT = /[,\n;]+/;

const parseEmails = (value: string): string[] =>
  value
    .split(EMAIL_SPLIT)
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

const SendInvoiceDialog: React.FC<SendInvoiceDialogProps> = ({
  isOpen,
  onClose,
  invoice,
  mode,
  defaultCc,
  onSuccess,
}) => {
  const defaultTo = useMemo(() => {
    const customer = invoice.customer as BillingCustomer | undefined;
    return Array.isArray(customer?.billing_emails)
      ? (customer.billing_emails.filter(Boolean) ?? [])
      : [];
  }, [invoice.customer]);

  const [toInput, setToInput] = useState('');
  const [ccInput, setCcInput] = useState('');
  const [message, setMessage] = useState('');
  const { run, isBusy } = useBillingAction();
  const isSubmitting = isBusy('send-invoice');

  const isRemind = mode === 'remind';
  const title = isRemind ? 'Send Reminder' : 'Send Invoice';

  useEffect(() => {
    if (!isOpen) return;
    setToInput(defaultTo.join(', '));
    setCcInput((defaultCc ?? []).join(', '));
    setMessage('');
  }, [isOpen, defaultTo, defaultCc]);

  const recipients = parseEmails(toInput);

  const handleSubmit = () => {
    if (recipients.length === 0) {
      toast.error('Add at least one recipient email.');
      return Promise.resolve();
    }

    return run(
      'send-invoice',
      () =>
        isRemind
          ? billingService.remindInvoice(invoice.id, { to: recipients })
          : billingService.sendInvoice(invoice.id, {
              to: recipients,
              cc: parseEmails(ccInput),
              message: message.trim() || undefined,
            }),
      {
        success: isRemind ? 'Reminder sent' : 'Invoice sent',
        onSuccess: () => {
          onSuccess();
          onClose();
        },
      }
    );
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => (!isSubmitting ? onClose() : undefined)}
      title={title}
      size="lg"
      primaryAction={{
        label: isRemind ? 'Send reminder' : 'Send',
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
        <Input
          label="To"
          value={toInput}
          onChange={e => setToInput(e.target.value)}
          placeholder="billing@acme.com, accounts@acme.com"
          description="Comma-separated recipient emails."
        />
        {!isRemind && (
          <Input
            label="Cc"
            value={ccInput}
            onChange={e => setCcInput(e.target.value)}
            placeholder="cc@acme.com"
            description="Optional. Comma-separated."
          />
        )}
        {!isRemind && (
          <Input
            label="Message (optional)"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Add a note for the email body…"
          />
        )}
      </div>
    </Dialog>
  );
};

export default SendInvoiceDialog;
