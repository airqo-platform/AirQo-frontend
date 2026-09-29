'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Input,
  LoadingState,
  PageHeading,
  Select,
  TextInput,
} from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/toast';
import { AqPlus, AqTrash01, AqRefreshCw05 } from '@airqo/icons-react';
import { Tooltip } from 'flowbite-react';
import type {
  BillingPaymentInstruction,
  BillingSettings,
} from '@/shared/types/billing';
import {
  billingKeys,
  billingFetchers,
} from '@/modules/system-billing/lib/queries';
import { useBillingQuery } from '@/modules/system-billing/lib/hooks';
import { getBillingErrorMessage } from '@/modules/system-billing/lib/errors';
import { buildNumberFormatPreview } from '@/modules/system-billing/lib/format';
import { NUMBER_FORMAT_TOKENS } from '@/modules/system-billing/constants';
import { billingService } from '@/shared/services/billingService';

type CatalogDraftItem = {
  item: string;
  description: string;
  unit_price: string;
  currency: string;
};

type DraftSettings = {
  seller: {
    name: string;
    address_lines: string;
    email: string;
    phone: string;
  };
  payment_instructions: BillingPaymentInstruction[];
  default_currency: string;
  default_payment_terms_days: string;
  default_terms: string;
  footer: string;
  tax_label: string;
  default_tax_rate: string;
  number_prefix: string;
  number_format: string;
  sequence_reset: string;
  sequence_starts_invoice: string;
  sequence_starts_receipt: string;
  catalog: CatalogDraftItem[];
  billing_cc_emails: string;
  reminders_enabled: boolean;
  reminder_days_before_due: string;
  reminder_days_after_due: string;
};

const emptySettings: DraftSettings = {
  seller: { name: '', address_lines: '', email: '', phone: '' },
  payment_instructions: [{ label: '', value: '' }],
  default_currency: '',
  default_payment_terms_days: '',
  default_terms: '',
  footer: '',
  tax_label: '',
  default_tax_rate: '',
  number_prefix: '',
  number_format: '{prefix}{yyyy}-{seq}',
  sequence_reset: 'never',
  sequence_starts_invoice: '1',
  sequence_starts_receipt: '1',
  catalog: [{ item: '', description: '', unit_price: '', currency: '' }],
  billing_cc_emails: '',
  reminders_enabled: false,
  reminder_days_before_due: '3',
  reminder_days_after_due: '1,7,14',
};

const parseLines = (value: string): string[] =>
  value
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

const parseList = (value: string): string[] =>
  value
    .split(',')
    .map(l => l.trim())
    .filter(Boolean);

/**
 * Reminder offsets must be whole, non-negative day counts. `Number('3d')` is
 * NaN, which `JSON.stringify` would send as `null` and fail server validation
 * with an unclear message, so unusable entries are dropped here.
 */
const parseDayList = (value: string): number[] =>
  parseList(value)
    .map(Number)
    .filter(n => Number.isInteger(n) && n >= 0);

const toNumberOrUndefined = (value: string): number | undefined => {
  if (value.trim() === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};

const fromSettings = (s: BillingSettings): DraftSettings => ({
  seller: {
    name: s.seller?.name ?? '',
    address_lines: (s.seller?.address_lines ?? []).join('\n'),
    email: s.seller?.email ?? '',
    phone: s.seller?.phone ?? '',
  },
  payment_instructions:
    s.payment_instructions && s.payment_instructions.length > 0
      ? s.payment_instructions.map(pi => ({ ...pi }))
      : [{ label: '', value: '' }],
  default_currency: s.default_currency ?? '',
  default_payment_terms_days: s.default_payment_terms_days?.toString() ?? '',
  default_terms: (s.default_terms ?? []).join('\n'),
  footer: s.footer ?? '',
  tax_label: s.tax_label ?? '',
  default_tax_rate: s.default_tax_rate?.toString() ?? '',
  number_prefix: s.number_prefix ?? '',
  number_format: s.number_format ?? '{prefix}{yyyy}-{seq}',
  sequence_reset: s.sequence_reset ?? 'never',
  sequence_starts_invoice: s.sequence_starts?.invoice?.toString() ?? '1',
  sequence_starts_receipt: s.sequence_starts?.receipt?.toString() ?? '1',
  catalog:
    s.catalog && s.catalog.length > 0
      ? s.catalog.map(
          c =>
            ({
              item: c.item ?? '',
              description: c.description ?? '',
              unit_price: c.unit_price?.toString() ?? '',
              currency: c.currency ?? '',
            }) as CatalogDraftItem
        )
      : [{ item: '', description: '', unit_price: '', currency: '' }],
  billing_cc_emails: (s.billing_cc_emails ?? []).join(', '),
  reminders_enabled: s.reminders_enabled ?? false,
  reminder_days_before_due: (s.reminder_days_before_due ?? []).join(', '),
  reminder_days_after_due: (s.reminder_days_after_due ?? []).join(', '),
});

const BillingSettingsPage: React.FC = () => {
  const {
    data: settings,
    error: settingsError,
    isLoading: settingsLoading,
    mutate,
  } = useBillingQuery(billingKeys.settings, signal =>
    billingFetchers.getSettings(signal)
  );

  const [draft, setDraft] = useState<DraftSettings>(emptySettings);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setDraft(fromSettings(settings));
      setIsDirty(false);
    }
  }, [settings]);

  const update = useCallback(
    <K extends keyof DraftSettings>(key: K, value: DraftSettings[K]) => {
      setDraft(prev => ({ ...prev, [key]: value }));
      setIsDirty(true);
    },
    []
  );

  const numberPreview = useMemo(
    () =>
      buildNumberFormatPreview(draft.number_format, {
        prefix: draft.number_prefix,
        seq: 1,
      }),
    [draft.number_format, draft.number_prefix]
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const payload = {
        seller: {
          name: draft.seller.name || undefined,
          address_lines: parseLines(draft.seller.address_lines),
          email: draft.seller.email || undefined,
          phone: draft.seller.phone || undefined,
        } as BillingSettings['seller'],
        payment_instructions: draft.payment_instructions.filter(
          pi => pi.label || pi.value
        ),
        catalog: draft.catalog
          .filter(c => c.item || c.description)
          .map(c => ({
            ...c,
            unit_price:
              toNumberOrUndefined(c.unit_price as unknown as string) ?? 0,
          })),
        default_currency: draft.default_currency || undefined,
        default_payment_terms_days: toNumberOrUndefined(
          draft.default_payment_terms_days
        ),
        default_terms: parseLines(draft.default_terms),
        footer: draft.footer || undefined,
        tax_label: draft.tax_label || undefined,
        default_tax_rate: toNumberOrUndefined(draft.default_tax_rate),
        number_prefix: draft.number_prefix || undefined,
        number_format: draft.number_format || undefined,
        sequence_reset:
          draft.sequence_reset === 'never' ? undefined : draft.sequence_reset,
        sequence_starts: {
          invoice: toNumberOrUndefined(draft.sequence_starts_invoice),
          receipt: toNumberOrUndefined(draft.sequence_starts_receipt),
        },
        billing_cc_emails: parseList(draft.billing_cc_emails),
        reminders_enabled: draft.reminders_enabled,
        reminder_days_before_due: parseDayList(draft.reminder_days_before_due),
        reminder_days_after_due: parseDayList(draft.reminder_days_after_due),
      };
      await billingService.updateSettings(payload);
      toast.success('Billing settings saved');
      setIsDirty(false);
      await mutate();
    } catch (error) {
      toast.error(getBillingErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }, [draft, mutate]);

  if (settingsLoading) {
    return <LoadingState text="Loading billing settings..." />;
  }

  if (settingsError) {
    return (
      <div className="space-y-6">
        <PageHeading title="Billing Settings" />
        <Card className="p-6">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-destructive">
              {getBillingErrorMessage(settingsError)}
            </p>
            <div>
              <Button
                variant="outlined"
                Icon={AqRefreshCw05}
                onClick={() => mutate()}
              >
                Try again
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Billing Settings"
        subtitle="Configure seller details, payment defaults, numbering, and notifications."
        action={
          <Button
            onClick={handleSave}
            loading={isSaving}
            disabled={!isDirty || isSaving}
          >
            Save settings
          </Button>
        }
      />

      {/* Seller */}
      <Card className="p-5 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Seller</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Business name"
            value={draft.seller.name}
            onChange={e =>
              update('seller', { ...draft.seller, name: e.target.value })
            }
          />
          <Input
            label="Email"
            value={draft.seller.email}
            onChange={e =>
              update('seller', { ...draft.seller, email: e.target.value })
            }
          />
        </div>
        <Input
          label="Phone"
          value={draft.seller.phone}
          onChange={e =>
            update('seller', { ...draft.seller, phone: e.target.value })
          }
        />
        <TextInput
          label="Address lines"
          value={draft.seller.address_lines}
          onChange={e =>
            update('seller', {
              ...draft.seller,
              address_lines: (e.target as HTMLTextAreaElement).value,
            })
          }
          placeholder={'123 Business Rd\nSuite 200\nNairobi'}
          rows={3}
        />
      </Card>

      {/* Payment instructions */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Payment instructions
          </h2>
          <Button
            size="sm"
            variant="outlined"
            Icon={AqPlus}
            onClick={() =>
              update('payment_instructions', [
                ...draft.payment_instructions,
                { label: '', value: '' },
              ])
            }
          >
            Add
          </Button>
        </div>
        {draft.payment_instructions.map((instruction, index) => (
          <div
            key={index}
            className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end"
          >
            <Input
              label={index === 0 ? 'Label' : undefined}
              value={instruction.label}
              onChange={e => {
                const next = [...draft.payment_instructions];
                next[index] = { ...next[index], label: e.target.value };
                update('payment_instructions', next);
              }}
              placeholder="Bank name"
            />
            <Input
              label={index === 0 ? 'Value' : undefined}
              value={instruction.value}
              onChange={e => {
                const next = [...draft.payment_instructions];
                next[index] = { ...next[index], value: e.target.value };
                update('payment_instructions', next);
              }}
              placeholder="Account number / details"
            />
            {draft.payment_instructions.length > 1 && (
              <Tooltip content="Remove">
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() =>
                    update(
                      'payment_instructions',
                      draft.payment_instructions.filter((_, i) => i !== index)
                    )
                  }
                  className="text-red-600"
                  aria-label="Remove payment instruction"
                >
                  <AqTrash01 className="w-4 h-4" />
                </Button>
              </Tooltip>
            )}
          </div>
        ))}
      </Card>

      {/* Defaults */}
      <Card className="p-5 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Defaults</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Default currency"
            value={draft.default_currency}
            onChange={e => update('default_currency', e.target.value)}
            placeholder="USD"
          />
          <Input
            label="Payment terms (days)"
            value={draft.default_payment_terms_days}
            onChange={e => update('default_payment_terms_days', e.target.value)}
            placeholder="30"
          />
        </div>
        <TextInput
          label="Default terms / notes"
          value={draft.default_terms}
          onChange={e =>
            update('default_terms', (e.target as HTMLTextAreaElement).value)
          }
          rows={3}
          placeholder={
            'Payment due within 30 days\nLate fees apply after 14 days'
          }
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Footer"
            value={draft.footer}
            onChange={e => update('footer', e.target.value)}
            placeholder="Thank you for your business"
          />
          <Input
            label="Tax label"
            value={draft.tax_label}
            onChange={e => update('tax_label', e.target.value)}
            placeholder="VAT"
          />
          <Input
            label="Default tax rate (%)"
            value={draft.default_tax_rate}
            onChange={e => update('default_tax_rate', e.target.value)}
            placeholder="16"
          />
        </div>
      </Card>

      {/* Numbering */}
      <Card className="p-5 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Invoice numbering
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Number prefix"
            value={draft.number_prefix}
            onChange={e => update('number_prefix', e.target.value)}
            placeholder="INV"
          />
          <Input
            label="Number format"
            value={draft.number_format}
            onChange={e => update('number_format', e.target.value)}
            description={`Tokens: ${Object.keys(NUMBER_FORMAT_TOKENS).join(', ')}`}
          />
        </div>
        <div className="rounded-md border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">Preview</p>
          <p className="text-lg font-medium font-mono">{numberPreview}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label="Sequence reset"
            value={draft.sequence_reset}
            onChange={e => update('sequence_reset', String(e.target.value))}
          >
            <option value="never">Never</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </Select>
          <Input
            label="Invoice sequence starts at"
            value={draft.sequence_starts_invoice}
            onChange={e => update('sequence_starts_invoice', e.target.value)}
            placeholder="1"
          />
          <Input
            label="Receipt sequence starts at"
            value={draft.sequence_starts_receipt}
            onChange={e => update('sequence_starts_receipt', e.target.value)}
            placeholder="1"
          />
        </div>
      </Card>

      {/* Catalog */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Product catalog
            </h2>
            <p className="text-xs text-muted-foreground">
              Saving replaces the saved product list.
            </p>
          </div>
          <Button
            size="sm"
            variant="outlined"
            Icon={AqPlus}
            onClick={() =>
              update('catalog', [
                ...draft.catalog,
                {
                  item: '',
                  description: '',
                  unit_price: '',
                  currency: '',
                },
              ])
            }
          >
            Add
          </Button>
        </div>
        {draft.catalog.map((item, index) => (
          <div
            key={index}
            className="grid gap-3 sm:grid-cols-[1fr_2fr_1fr_1fr_auto] items-end"
          >
            <Input
              label={index === 0 ? 'Item' : undefined}
              value={item.item ?? ''}
              onChange={e => {
                const next = [...draft.catalog];
                next[index] = { ...next[index], item: e.target.value };
                update('catalog', next);
              }}
              placeholder="PM2.5 Sensor"
            />
            <Input
              label={index === 0 ? 'Description' : undefined}
              value={item.description ?? ''}
              onChange={e => {
                const next = [...draft.catalog];
                next[index] = { ...next[index], description: e.target.value };
                update('catalog', next);
              }}
            />
            <Input
              label={index === 0 ? 'Unit price' : undefined}
              value={item.unit_price}
              onChange={e => {
                const next = [...draft.catalog];
                next[index] = {
                  ...next[index],
                  unit_price: e.target.value,
                };
                update('catalog', next);
              }}
              placeholder="100"
            />
            <Input
              label={index === 0 ? 'Currency' : undefined}
              value={item.currency ?? ''}
              onChange={e => {
                const next = [...draft.catalog];
                next[index] = { ...next[index], currency: e.target.value };
                update('catalog', next);
              }}
              placeholder="USD"
            />
            {draft.catalog.length > 1 && (
              <Tooltip content="Remove">
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() =>
                    update(
                      'catalog',
                      draft.catalog.filter((_, i) => i !== index)
                    )
                  }
                  className="text-red-600"
                  aria-label="Remove catalog item"
                >
                  <AqTrash01 className="w-4 h-4" />
                </Button>
              </Tooltip>
            )}
          </div>
        ))}
      </Card>

      {/* Notifications */}
      <Card className="p-5 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
        <Input
          label="Billing CC emails"
          value={draft.billing_cc_emails}
          onChange={e => update('billing_cc_emails', e.target.value)}
          placeholder="finance@acqo.net, billing@airqo.net"
          description="Comma-separated. Copied on invoice and receipt emails."
        />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={draft.reminders_enabled}
              onChange={e => update('reminders_enabled', e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            Send payment reminders
          </label>
        </div>
        {draft.reminders_enabled && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Days before due"
              value={draft.reminder_days_before_due}
              onChange={e => update('reminder_days_before_due', e.target.value)}
              placeholder="3"
              description="Comma-separated."
            />
            <Input
              label="Days after due"
              value={draft.reminder_days_after_due}
              onChange={e => update('reminder_days_after_due', e.target.value)}
              placeholder="1,7,14"
              description="Comma-separated."
            />
          </div>
        )}
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          variant="outlined"
          onClick={() => {
            if (settings) {
              setDraft(fromSettings(settings));
              setIsDirty(false);
            }
          }}
          disabled={!isDirty || isSaving}
        >
          Reset
        </Button>
        <Button onClick={handleSave} loading={isSaving} disabled={!isDirty}>
          Save settings
        </Button>
      </div>
    </div>
  );
};

export default BillingSettingsPage;
