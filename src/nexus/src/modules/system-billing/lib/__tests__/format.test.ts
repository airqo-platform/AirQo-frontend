import {
  formatMoney,
  formatBillingDate,
  formatBillingDateTime,
  toDateInputValue,
  toDateTimeInputValue,
  fromDateInputValue,
  fromDateTimeInputValue,
  toLocalDate,
  toDateInputString,
  resolveInvoiceNumber,
  resolveInvoiceTotal,
  resolveInvoiceAmountDue,
  resolveInvoiceAmountPaid,
  resolveInvoiceSubtotal,
  resolveInvoiceTaxAmount,
  resolveInvoiceDiscountAmount,
  invoiceStatusLabel,
  invoiceKindLabel,
  paymentMethodLabel,
  buildNumberFormatPreview,
} from '../format';
import type { BillingInvoice } from '@/shared/types/billing';

const DASH = '—';

describe('formatMoney', () => {
  it('formats USD as currency', () => {
    const result = formatMoney(1234.56, 'USD');
    expect(result).toContain('1,234.56');
    expect(result).not.toBe(DASH);
  });

  it('returns DASH for null/undefined/non-finite', () => {
    expect(formatMoney(null)).toBe(DASH);
    expect(formatMoney(undefined)).toBe(DASH);
    expect(formatMoney(NaN)).toBe(DASH);
  });

  it('falls back gracefully for invalid currency codes without throwing', () => {
    const result = formatMoney(50, 'NOT_A_CODE');
    expect(result).toContain('50');
    expect(result).not.toBe(DASH);
  });
});

describe('resolveInvoiceNumber', () => {
  it('prefers number over invoice_number', () => {
    expect(
      resolveInvoiceNumber({ number: 'INV-1', invoice_number: 'OLD-1' })
    ).toBe('INV-1');
  });

  it('falls back to invoice_number then Draft', () => {
    expect(resolveInvoiceNumber({ invoice_number: 'OLD-1' })).toBe('OLD-1');
    expect(resolveInvoiceNumber({})).toBe('Draft');
    expect(resolveInvoiceNumber(null)).toBe('Draft');
  });
});

describe('resolve* alias helpers', () => {
  const invoice: BillingInvoice = {
    id: '1',
    total: 100,
    grand_total: 90,
    amount_due: 80,
    balance_due: 70,
    balance: 60,
    amount_paid: 20,
    paid_amount: 10,
    subtotal: 90,
    tax_amount: 10,
    discount_amount: 5,
  } as BillingInvoice;

  it('prefers the canonical field over the alias', () => {
    expect(resolveInvoiceTotal(invoice)).toBe(100);
    expect(resolveInvoiceAmountDue(invoice)).toBe(80);
    expect(resolveInvoiceAmountPaid(invoice)).toBe(20);
    expect(resolveInvoiceSubtotal(invoice)).toBe(90);
    expect(resolveInvoiceTaxAmount(invoice)).toBe(10);
    expect(resolveInvoiceDiscountAmount(invoice)).toBe(5);
  });

  it('returns undefined for null input', () => {
    expect(resolveInvoiceTotal(null)).toBeUndefined();
  });
});

describe('resolveInvoiceSubtotal handles index-signature alias', () => {
  it('reads sub_total when subtotal is absent', () => {
    const invoice = { id: '1', sub_total: 42 } as BillingInvoice;
    expect(resolveInvoiceSubtotal(invoice)).toBe(42);
  });
});

describe('formatBillingDate / date input helpers', () => {
  it('formats an ISO date string to a readable date', () => {
    expect(formatBillingDate('2025-09-29')).toBe('Sep 29, 2025');
  });

  it('returns DASH for empty input', () => {
    expect(formatBillingDate(null)).toBe(DASH);
  });

  it('passes a valid date input through unchanged (TZ-safe, no UTC shift)', () => {
    expect(toDateInputValue('2025-09-29')).toBe('2025-09-29');
    expect(fromDateInputValue('2026-09-29')).toBe('2026-09-29');
  });

  it('returns empty string for empty or malformed date input values', () => {
    expect(fromDateInputValue('')).toBe('');
    expect(fromDateInputValue('2026-9-3')).toBe('');
    expect(fromDateInputValue('garbage')).toBe('');
  });

  it('converts a datetime-local value to an ISO instant', () => {
    const result = fromDateTimeInputValue('2026-09-29T14:30');
    expect(new Date(result).getTime()).toBe(
      new Date('2026-09-29T14:30').getTime()
    );
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('returns empty string for invalid datetime-local input values', () => {
    expect(fromDateTimeInputValue('')).toBe('');
    expect(fromDateTimeInputValue('2026-09-29')).toBe('');
    expect(fromDateTimeInputValue('garbage')).toBe('');
  });

  it('round-trips a datetime input value', () => {
    expect(toDateTimeInputValue('2025-09-29T14:30:00')).toBe(
      '2025-09-29T14:30'
    );
  });

  it('formats a datetime string', () => {
    expect(formatBillingDateTime('2025-09-29T14:30:00')).toBe(
      'Sep 29, 2025 02:30 PM'
    );
  });
});

describe('label helpers', () => {
  it('maps status and kind to labels', () => {
    expect(invoiceStatusLabel('paid')).toBe('Paid');
    expect(invoiceKindLabel('proforma')).toBe('Pro Forma');
    expect(invoiceKindLabel(null)).toBe('Invoice');
  });

  it('maps payment methods', () => {
    expect(paymentMethodLabel('mobile_money')).toBe('Mobile Money');
    expect(paymentMethodLabel('unknown_method' as never)).toBe(
      'unknown_method'
    );
  });
});

describe('buildNumberFormatPreview', () => {
  const date = new Date('2025-09-29T00:00:00');

  it('replaces all supported tokens', () => {
    const preview = buildNumberFormatPreview('{prefix}{code}-{yyyy}-{seq}', {
      prefix: 'ACME',
      code: 'INV',
      seq: 7,
      date,
    });
    expect(preview).toBe('ACMEINV-2025-7');
  });

  it('zero-pads the seq4 token without touching seq', () => {
    const preview = buildNumberFormatPreview('{prefix}{seq4}/{yy}', {
      prefix: 'R',
      seq: 3,
      date,
    });
    expect(preview).toBe('R0003/25');
  });
});

describe('date range conversion helpers', () => {
  it('parses a yyyy-MM-dd string into a local date (no UTC shift)', () => {
    const parsed = toLocalDate('2026-09-29');
    expect(parsed).toBeDefined();
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(8);
    expect(parsed?.getDate()).toBe(29);
  });

  it('rejects malformed or empty date strings', () => {
    expect(toLocalDate('')).toBeUndefined();
    expect(toLocalDate('2026-9-3')).toBeUndefined();
    expect(toLocalDate(undefined)).toBeUndefined();
  });

  it('round-trips a local date back to the same yyyy-MM-dd string', () => {
    expect(toDateInputString(toLocalDate('2026-01-01'))).toBe('2026-01-01');
  });

  it('returns an empty string for missing or invalid dates', () => {
    expect(toDateInputString(undefined)).toBe('');
    expect(toDateInputString(new Date('not-a-date'))).toBe('');
  });
});
