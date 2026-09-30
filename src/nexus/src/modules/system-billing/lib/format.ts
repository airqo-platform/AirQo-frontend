import { format, isValid, parseISO } from 'date-fns';
import { ISO_DATE_ONLY } from '@/shared/utils/dateUtils';
import {
  FALLBACK_CURRENCY,
  INVOICE_KIND_META,
  INVOICE_STATUS_META,
  PAYMENT_METHOD_LABELS,
} from '../constants';
import type {
  BillingInvoice,
  BillingInvoiceKind,
  BillingInvoiceStatus,
  BillingPaymentMethod,
} from '@/shared/types/billing';

const DASH = '—';

const isValidCurrencyCode = (code: unknown): code is string =>
  typeof code === 'string' && /^[A-Z]{3}$/.test(code);

/**
 * Formats an amount as money. Invalid currency codes fall back to a raw
 * numeric suffix so a bad code never silently becomes "$" or throws.
 */
export const formatMoney = (
  amount: number | null | undefined,
  currency?: string | null
): string => {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) {
    return DASH;
  }

  const code = isValidCurrencyCode(currency) ? currency : null;

  if (!code) {
    return `${amount.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })} ${String(currency ?? FALLBACK_CURRENCY)}`;
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })} ${code}`;
  }
};

export const formatBillingDate = (value: string | null | undefined): string => {
  if (!value) return DASH;
  const date = ISO_DATE_ONLY.test(value)
    ? new Date(`${value}T00:00:00Z`)
    : parseISO(value);
  if (!isValid(date)) return DASH;
  return format(date, 'MMM dd, yyyy');
};

export const formatBillingDateTime = (
  value: string | null | undefined
): string => {
  if (!value) return DASH;
  const date = ISO_DATE_ONLY.test(value)
    ? new Date(`${value}T00:00:00Z`)
    : parseISO(value);
  if (!isValid(date)) return DASH;
  return format(date, 'MMM dd, yyyy hh:mm a');
};

/** Local date -> "yyyy-MM-dd" for native date inputs. */
export const toDateInputValue = (value: string | null | undefined): string => {
  if (!value) return '';
  const date = ISO_DATE_ONLY.test(value)
    ? new Date(`${value}T00:00:00Z`)
    : parseISO(value);
  if (!isValid(date)) return '';
  return format(date, 'yyyy-MM-dd');
};

/**
 * Current local time as a `datetime-local` input value. Must not use
 * `toISOString()`: that is UTC, and the value is parsed back as local time by
 * `fromDateTimeInputValue`, which would shift the saved instant by the offset.
 */
export const nowAsDateTimeInputValue = (): string =>
  format(new Date(), "yyyy-MM-dd'T'HH:mm");

export const toDateTimeInputValue = (
  value: string | null | undefined
): string => {
  if (!value) return '';
  const date = parseISO(value);
  if (!isValid(date)) return '';
  return format(date, "yyyy-MM-dd'T'HH:mm");
};

/**
 * Date-only input value -> same `yyyy-MM-dd` string, validated against
 * `ISO_DATE_ONLY`. Kept as a plain date string (not a UTC instant) because the
 * Billing API's date filters (`from`/`to` on issue date) take `yyyy-MM-dd`;
 * converting to `T00:00:00Z` shifts the value to the previous day in
 * positive-offset timezones. Returns `''` when empty or malformed.
 */
export const fromDateInputValue = (value: string): string => {
  if (!value || !ISO_DATE_ONLY.test(value)) return '';
  return value;
};

const ISO_DATETIME_LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

/**
 * Re-exported from `@/shared/utils/dateUtils` rather than reimplemented: the
 * calendar → `<input type="date">` round trip is used by the billing filters,
 * the report period pickers and the shared calendar, and a second copy is how
 * the two drift apart (the local version silently accepted `2026-02-31` and
 * rolled it forward to Mar 3).
 */
export { toLocalDate, toDateInputString } from '@/shared/utils/dateUtils';

/**
 * `datetime-local` input value (`yyyy-MM-ddTHH:mm[:ss]`) -> ISO instant.
 * For exact-instant fields (`paid_at`, `sent_at`). Returns `''` when empty or
 * malformed.
 */
export const fromDateTimeInputValue = (value: string): string => {
  if (!value || !ISO_DATETIME_LOCAL.test(value)) return '';
  const date = new Date(value);
  return isValid(date) ? date.toISOString() : '';
};

export const resolveInvoiceNumber = (
  invoice: Pick<BillingInvoice, 'number' | 'invoice_number'> | null | undefined
): string => {
  if (!invoice) return 'Draft';
  return invoice.number ?? invoice.invoice_number ?? 'Draft';
};

export const resolveInvoiceTotal = (
  invoice: BillingInvoice | null | undefined
): number | undefined => {
  if (!invoice) return undefined;
  return invoice.total ?? invoice.grand_total;
};

export const resolveInvoiceAmountDue = (
  invoice: BillingInvoice | null | undefined
): number | undefined => {
  if (!invoice) return undefined;
  return invoice.amount_due ?? invoice.balance_due ?? invoice.balance;
};

export const resolveInvoiceAmountPaid = (
  invoice: BillingInvoice | null | undefined
): number | undefined => {
  if (!invoice) return undefined;
  return invoice.amount_paid ?? invoice.paid_amount;
};

export const resolveInvoiceSubtotal = (
  invoice: BillingInvoice | null | undefined
): number | undefined => {
  if (!invoice) return undefined;
  return invoice.subtotal ?? (invoice.sub_total as number | undefined);
};

export const resolveInvoiceTaxAmount = (
  invoice: BillingInvoice | null | undefined
): number | undefined => {
  if (!invoice) return undefined;
  return invoice.tax_amount ?? (invoice.tax_total as number | undefined);
};

export const resolveInvoiceDiscountAmount = (
  invoice: BillingInvoice | null | undefined
): number | undefined => {
  if (!invoice) return undefined;
  return invoice.discount_amount ?? (invoice.discount as number | undefined);
};

export const invoiceStatusLabel = (
  status: BillingInvoiceStatus | null | undefined
): string => {
  if (!status) return DASH;
  return INVOICE_STATUS_META[status]?.label ?? status;
};

export const invoiceKindLabel = (
  kind: BillingInvoiceKind | null | undefined
): string => {
  if (!kind) return 'Invoice';
  return INVOICE_KIND_META[kind]?.label ?? kind;
};

export const paymentMethodLabel = (
  method: BillingPaymentMethod | string | null | undefined
): string => {
  if (!method) return DASH;
  return PAYMENT_METHOD_LABELS[method as BillingPaymentMethod] ?? method;
};

export const buildNumberFormatPreview = (
  formatStr: string,
  {
    prefix = '',
    seq = 1,
    code = '',
    date = new Date(),
  }: { prefix?: string; seq?: number; code?: string; date?: Date } = {}
): string => {
  const yyyy = format(date, 'yyyy');
  const yy = format(date, 'yy');
  // Replace the longer {seq4} token BEFORE {seq} so the bare token cannot
  // clobber the padded one's leading digit.
  return formatStr
    .replace('{prefix}', prefix)
    .replace('{code}', code)
    .replace('{yyyy}', yyyy)
    .replace('{yy}', yy)
    .replace('{seq4}', String(seq).padStart(4, '0'))
    .replace('{seq}', String(seq));
};
