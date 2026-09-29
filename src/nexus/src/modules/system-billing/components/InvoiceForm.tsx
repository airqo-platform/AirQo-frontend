'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, LoadingState } from '@/shared/components/ui';
import { Input } from '@/shared/components/ui';
import { TextInput } from '@/shared/components/ui';
import { SegmentedTabs } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/toast';
import { billingService } from '@/shared/services/billingService';
import type {
  BillingInvoice,
  BillingInvoiceKind,
  BillingLineItem,
} from '@/shared/types/billing';
import {
  billingKeys,
  billingFetchers,
} from '@/modules/system-billing/lib/queries';
import { useBillingQuery } from '@/modules/system-billing/lib/hooks';
import { useBillingAction } from '@/modules/system-billing/lib/hooks';
import { formatMoney, FALLBACK_CURRENCY } from '@/modules/system-billing';
import InvoiceLineItemsEditor from './InvoiceLineItemsEditor';
import CustomerPicker from './CustomerPicker';

interface InvoiceFormProps {
  mode: 'create' | 'edit';
  invoice?: BillingInvoice;
  onSaved: (invoice: BillingInvoice) => void;
  initialCustomerId?: string;
}

const parseNum = (value: string, fallback = 0): number => {
  if (value === '' || value === null || value === undefined) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.round(n * 100) / 100) : fallback;
};

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  mode,
  invoice,
  onSaved,
  initialCustomerId,
}) => {
  const isEdit = mode === 'edit';

  const { data: settings, isLoading: settingsLoading } = useBillingQuery(
    billingKeys.settings,
    signal => billingFetchers.getSettings(signal)
  );

  const [customerId, setCustomerId] = useState(
    invoice?.customer_id ?? initialCustomerId ?? ''
  );
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [kind, setKind] = useState<BillingInvoiceKind>(
    invoice?.kind ?? 'invoice'
  );
  const [subject, setSubject] = useState(invoice?.subject ?? '');
  const [reference, setReference] = useState(invoice?.reference ?? '');
  const [currency, setCurrency] = useState(
    invoice?.currency ?? settings?.default_currency ?? FALLBACK_CURRENCY
  );
  const [paymentTermsDays, setPaymentTermsDays] = useState(
    invoice?.payment_terms_days ?? settings?.default_payment_terms_days ?? 30
  );
  const [lineItems, setLineItems] = useState<BillingLineItem[]>(
    invoice?.line_items ?? []
  );
  const [discountAmount, setDiscountAmount] = useState<string>(
    String(invoice?.discount_amount ?? 0)
  );
  const [taxRate, setTaxRate] = useState<string>(
    String(invoice?.tax_rate ?? 0)
  );
  const [notes, setNotes] = useState(invoice?.notes ?? '');
  const [terms, setTerms] = useState<string>(
    Array.isArray(invoice?.terms) ? invoice?.terms.join('\n') : ''
  );
  const { run, isBusy } = useBillingAction();
  const isSubmitting = isBusy('save-invoice');

  // Sync currency from settings once loaded if we don't have an explicit value.
  useEffect(() => {
    if (!isEdit && !invoice?.currency && settings?.default_currency) {
      setCurrency(settings.default_currency);
    }
    if (
      !isEdit &&
      invoice?.payment_terms_days === undefined &&
      settings?.default_payment_terms_days !== undefined
    ) {
      setPaymentTermsDays(settings.default_payment_terms_days);
    }
  }, [settings, isEdit, invoice?.currency, invoice?.payment_terms_days]);

  const estimate = useMemo(() => {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + (item.quantity ?? 0) * (item.unit_price ?? 0),
      0
    );
    const discount = parseNum(discountAmount);
    const taxable = Math.max(0, subtotal - discount);
    const tax = taxable * (parseNum(taxRate) / 100);
    const total = taxable + tax;
    return { subtotal, discount, taxable, tax, total };
  }, [lineItems, discountAmount, taxRate]);

  const validate = useCallback((): string | null => {
    if (!customerId) return 'Select a customer.';
    if (lineItems.length === 0) return 'Add at least one line item.';
    const invalid = lineItems.find(
      item =>
        (!item.item && !item.description) ||
        !(item.quantity > 0) ||
        !(item.unit_price >= 0)
    );
    if (invalid)
      return 'Each line item needs a description or code and a quantity.';
    if (estimate.discount > estimate.subtotal + 0.005)
      return 'Discount cannot exceed the subtotal.';
    return null;
  }, [customerId, lineItems, estimate]);

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      if (!customerId) setCustomerError('Select a customer.');
      return;
    }

    return run('save-invoice', async () => {
      const payload = {
        customer_id: customerId,
        kind,
        subject: subject.trim() || undefined,
        reference: reference.trim() || undefined,
        currency: currency.trim() || undefined,
        payment_terms_days: paymentTermsDays,
        line_items: lineItems,
        discount_amount: parseNum(discountAmount),
        tax_rate: parseNum(taxRate),
        notes: notes.trim() || undefined,
        terms: terms
          .split('\n')
          .map(t => t.trim())
          .filter(Boolean),
      };

      if (isEdit && invoice) {
        const updated = await billingService.updateInvoice(invoice.id, payload);
        toast.success('Invoice updated');
        onSaved(updated);
      } else {
        const created = await billingService.createInvoice(payload);
        toast.success('Invoice created');
        onSaved(created);
      }
    });
  };

  if (settingsLoading && !settings) {
    return <LoadingState text="Loading billing settings…" />;
  }

  return (
    <div className="space-y-6">
      <Card className="p-5 space-y-5">
        <SegmentedTabs<BillingInvoiceKind>
          options={[
            { value: 'invoice', label: 'Invoice' },
            { value: 'proforma', label: 'Pro Forma' },
          ]}
          value={kind}
          onChange={setKind}
          ariaLabel="Invoice kind"
        />

        <CustomerPicker
          value={customerId}
          onChange={id => {
            setCustomerId(id);
            setCustomerError(null);
          }}
          disabled={isSubmitting || (isEdit && invoice?.status !== 'draft')}
          error={customerError ?? undefined}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Monthly monitoring services"
          />
          <Input
            label="Reference (optional)"
            value={reference}
            onChange={e => setReference(e.target.value)}
            placeholder="PO-12345"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Currency"
            value={currency}
            onChange={e => setCurrency(e.target.value.toUpperCase())}
            placeholder="USD"
            description="3-letter ISO code."
          />
          <Input
            type="number"
            min={0}
            label="Payment terms (days)"
            value={String(paymentTermsDays)}
            onChange={e => setPaymentTermsDays(Number(e.target.value) || 0)}
            placeholder="30"
          />
        </div>
      </Card>

      <Card className="p-5">
        <InvoiceLineItemsEditor
          value={lineItems}
          onChange={setLineItems}
          disabled={isSubmitting || (isEdit && invoice?.status !== 'draft')}
        />
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">
          Discounts & tax
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            type="number"
            min={0}
            step="0.01"
            label="Discount amount"
            value={discountAmount}
            onChange={e => setDiscountAmount(e.target.value)}
            description="Applied before tax."
          />
          <Input
            type="number"
            min={0}
            step="0.01"
            label="Tax rate (%)"
            value={taxRate}
            onChange={e => setTaxRate(e.target.value)}
            placeholder="16"
          />
        </div>
        <TextInput
          label="Notes (optional)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Shown on the invoice…"
          rows={3}
        />
        <div className="space-y-1">
          <TextInput
            label="Terms (optional)"
            value={terms}
            onChange={e => setTerms(e.target.value)}
            placeholder={'Payment due within 30 days\nLate fee of 2% per month'}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">One term per line.</p>
        </div>
      </Card>

      <Card className="p-5 bg-muted/20 border-dashed">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-foreground">Estimate</h3>
          <span className="text-xs text-muted-foreground italic">
            (server recalculates when saving)
          </span>
        </div>
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums font-medium">
              {formatMoney(estimate.subtotal, currency)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Discount</dt>
            <dd className="tabular-nums font-medium">
              −{formatMoney(estimate.discount, currency)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Taxable</dt>
            <dd className="tabular-nums font-medium">
              {formatMoney(estimate.taxable, currency)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tax</dt>
            <dd className="tabular-nums font-medium">
              {formatMoney(estimate.tax, currency)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 mt-2">
            <dt className="font-semibold text-foreground">Total</dt>
            <dd className="tabular-nums font-semibold text-foreground">
              {formatMoney(estimate.total, currency)}
            </dd>
          </div>
        </dl>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isEdit ? 'Save changes' : 'Create invoice'}
        </Button>
      </div>
    </div>
  );
};

export default InvoiceForm;
