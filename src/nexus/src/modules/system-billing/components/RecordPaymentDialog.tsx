'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Dialog from '@/shared/components/ui/dialog';
import { Input, Select } from '@/shared/components/ui';
import { billingService } from '@/shared/services/billingService';
import type {
  BillingInvoice,
  BillingPaymentMethod,
} from '@/shared/types/billing';
import { useBillingAction } from '@/modules/system-billing/lib/hooks';
import {
  PAYMENT_METHOD_LABELS,
  FALLBACK_CURRENCY,
} from '@/modules/system-billing/constants';
import {
  formatMoney,
  fromDateTimeInputValue,
  nowAsDateTimeInputValue,
} from '@/modules/system-billing/lib/format';

interface RecordPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: BillingInvoice;
  onSuccess: () => void;
}

const METHOD_ENTRIES = Object.entries(PAYMENT_METHOD_LABELS) as [
  BillingPaymentMethod,
  string,
][];

const RecordPaymentDialog: React.FC<RecordPaymentDialogProps> = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}) => {
  const currency = invoice.currency ?? FALLBACK_CURRENCY;
  const remaining =
    invoice.amount_due ?? (invoice.total ?? 0) - (invoice.amount_paid ?? 0);

  const [amount, setAmount] = useState<string>(
    remaining > 0 ? String(remaining) : '0'
  );
  const [method, setMethod] = useState<BillingPaymentMethod>('bank_transfer');
  const [reference, setReference] = useState('');
  const [paidAt, setPaidAt] = useState(nowAsDateTimeInputValue);
  const [isPastReceipt, setIsPastReceipt] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [sendReceipt, setSendReceipt] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { run, isBusy } = useBillingAction();
  const isSubmitting = isBusy('record-payment');

  useEffect(() => {
    if (!isOpen) return;
    setAmount(remaining > 0 ? String(remaining) : '0');
    setMethod('bank_transfer');
    setReference('');
    setPaidAt(nowAsDateTimeInputValue());
    setIsPastReceipt(false);
    setReceiptNumber('');
    setNotes('');
    setSendReceipt(true);
    setError(null);
  }, [isOpen, remaining]);

  const amountNum = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? Math.max(0, Math.round(n * 100) / 100) : 0;
  }, [amount]);

  const remainingNum = Math.max(0, Math.round(remaining * 100) / 100);

  const validationError = useMemo(() => {
    if (amountNum <= 0) return 'Amount must be greater than 0.';
    if (remainingNum > 0 && amountNum > remainingNum + 0.005) {
      return `Amount exceeds remaining due (${formatMoney(remainingNum, currency)}).`;
    }
    return null;
  }, [amountNum, remainingNum, currency]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    const payload: {
      amount: number;
      method: BillingPaymentMethod;
      reference?: string;
      paid_at?: string;
      receipt_number?: string;
      notes?: string;
      send_receipt?: boolean;
    } = {
      amount: amountNum,
      method,
      ...(reference.trim() ? { reference: reference.trim() } : {}),
      ...(paidAt
        ? { paid_at: fromDateTimeInputValue(paidAt) || undefined }
        : {}),
      ...(isPastReceipt && receiptNumber.trim()
        ? { receipt_number: receiptNumber.trim() }
        : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      send_receipt: sendReceipt,
    };

    await run(
      'record-payment',
      () => billingService.recordPayment(invoice.id, payload),
      {
        success: 'Payment recorded',
        onSuccess: () => {
          onSuccess();
          onClose();
        },
        silent: true,
        onError: message => setError(message),
      }
    );
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Record Payment"
      size="lg"
      primaryAction={{
        label: 'Record payment',
        onClick: handleSubmit,
        disabled: isSubmitting || Boolean(validationError),
        loading: isSubmitting,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: handleClose,
        disabled: isSubmitting,
        variant: 'outlined',
      }}
    >
      <div className="space-y-4">
        <div className="rounded-md border border-border p-3 bg-muted/30">
          <p className="text-xs text-muted-foreground">Remaining due</p>
          <p className="text-lg font-semibold tabular-nums">
            {formatMoney(remainingNum, currency)}
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            type="number"
            min={0}
            step="0.01"
            label="Amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            disabled={isSubmitting}
          />
          <Select
            label="Method"
            containerClassName="!mb-0"
            value={method}
            onChange={event =>
              setMethod(event.target.value as BillingPaymentMethod)
            }
            disabled={isSubmitting}
          >
            {METHOD_ENTRIES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Reference (optional)"
          value={reference}
          onChange={e => setReference(e.target.value)}
          placeholder="Transaction / transfer reference"
          disabled={isSubmitting}
        />

        <Input
          type="datetime-local"
          label="Payment date & time"
          value={paidAt}
          onChange={e => setPaidAt(e.target.value)}
          disabled={isSubmitting}
          description="Defaults to now."
        />

        <Input
          label="Notes (optional)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Backdated receipt…"
          disabled={isSubmitting}
        />

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setIsPastReceipt(v => !v)}
            className="text-sm font-medium text-primary hover:text-primary/80"
            aria-expanded={isPastReceipt}
          >
            {isPastReceipt ? '−' : '+'} Recording a past receipt
          </button>

          {isPastReceipt && (
            <div className="grid gap-4 sm:grid-cols-2 pl-3 border-l-2 border-border">
              <Input
                label="Receipt number (optional)"
                value={receiptNumber}
                onChange={e => setReceiptNumber(e.target.value)}
                placeholder="RCP-0001"
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={sendReceipt}
            onChange={e => setSendReceipt(e.target.checked)}
            className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            aria-label="Email receipt to customer"
          />
          <span className="text-sm text-foreground">
            Email receipt to customer
          </span>
        </label>
      </div>
    </Dialog>
  );
};

export default RecordPaymentDialog;
