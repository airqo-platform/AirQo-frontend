'use client';

import React, { useEffect, useState } from 'react';
import Dialog from '@/shared/components/ui/dialog';
import { DatePicker, Input } from '@/shared/components/ui';
import { billingService } from '@/shared/services/billingService';
import type { BillingInvoice, BillingCustomer } from '@/shared/types/billing';
import { useBillingAction } from '@/modules/system-billing/lib/hooks';
import {
  fromDateInputValue,
  toLocalDate,
  toDateInputString,
} from '@/modules/system-billing/lib/format';

interface FinalizeInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: BillingInvoice;
  onSuccess: () => void;
}

const FinalizeInvoiceDialog: React.FC<FinalizeInvoiceDialogProps> = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}) => {
  const [send, setSend] = useState(true);
  const [message, setMessage] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const { run, isBusy } = useBillingAction();
  const isSubmitting = isBusy('finalize');

  useEffect(() => {
    if (!isOpen) return;
    setSend(true);
    setMessage('');
    setInvoiceNumber('');
    setIssueDate('');
  }, [isOpen]);

  const customer = invoice.customer as BillingCustomer | undefined;
  const recipients = Array.isArray(customer?.billing_emails)
    ? (customer?.billing_emails.filter(Boolean) ?? [])
    : [];

  const isBackfill = !send;

  const handleSubmit = () =>
    run(
      'finalize',
      () =>
        billingService.finalizeInvoice(invoice.id, {
          send,
          ...(message.trim() ? { message: message.trim() } : {}),
          ...(isBackfill && invoiceNumber.trim()
            ? { invoice_number: invoiceNumber.trim() }
            : {}),
          ...(isBackfill && issueDate
            ? { issue_date: fromDateInputValue(issueDate) }
            : {}),
        }),
      {
        success: send ? 'Invoice finalized and sent' : 'Invoice finalized',
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
      title="Finalize Invoice"
      size="lg"
      primaryAction={{
        label: send ? 'Finalize & send' : 'Finalize',
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
          Finalizing assigns an invoice number and locks the seller/bank
          details. This cannot be undone without voiding the invoice.
        </p>

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={send}
            onChange={e => setSend(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary"
            aria-label="Email invoice to customer"
          />
          <span className="text-sm text-foreground">
            Email invoice to customer
          </span>
        </label>

        {send && (
          <div className="text-xs text-muted-foreground">
            Recipients:{' '}
            {recipients.length > 0 ? recipients.join(', ') : 'none configured'}
          </div>
        )}

        {!send && (
          <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-200">
            Recording a past invoice — no email will be sent. You can backfill
            the invoice number and issue date below.
          </div>
        )}

        {send && (
          <Input
            label="Message (optional)"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Add a note for the email body…"
          />
        )}

        {isBackfill && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Invoice number"
              value={invoiceNumber}
              onChange={e => setInvoiceNumber(e.target.value)}
              placeholder="INV-0001"
              description="Defaults to the next sequence number if omitted."
            />
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="finalize-issue-date"
                className="text-sm font-medium text-foreground"
              >
                Issue date
              </label>
              <DatePicker
                id="finalize-issue-date"
                value={toLocalDate(issueDate)}
                onChange={next => setIssueDate(toDateInputString(next as Date))}
                mode="single"
                returnFormat="date"
                placeholder="Defaults to today if omitted"
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default FinalizeInvoiceDialog;
