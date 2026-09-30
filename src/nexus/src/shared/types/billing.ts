/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Typed data layer contracts for the Billing API (manual device sales:
 * invoices, pro forma invoices, payments/receipts, customers, settings,
 * summary). Field shapes are taken verbatim from the authoritative
 * BILLING_API.md. Normalized entities expose `id: string` (where the
 * resource carries one), allow the raw `_id`, and carry an index signature so
 * undocumented backend fields survive normalization instead of being stripped.
 */

// ---------------------------------------------------------------------------
// Wire envelopes
// ---------------------------------------------------------------------------

export interface BillingApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BillingApiErrorField {
  param?: string;
  message: string;
}

export interface BillingApiErrorPayload {
  success: false;
  message: string;
  errors?: {
    message?: string | BillingApiErrorField[];
  };
}

// ---------------------------------------------------------------------------
// List envelopes
// ---------------------------------------------------------------------------

export interface BillingListMeta {
  total: number;
  limit: number;
  skip: number;
}

export interface BillingListResult<T> {
  items: T[];
  meta: BillingListMeta;
}

// ---------------------------------------------------------------------------
// Settings / catalog primitives
// ---------------------------------------------------------------------------

export interface BillingSeller {
  name: string;
  address_lines: string[];
  email?: string;
  phone?: string;
  [key: string]: unknown;
}

export interface BillingPaymentInstruction {
  label: string;
  value: string;
}

export interface BillingCatalogItem {
  item?: string;
  description?: string;
  unit_price: number;
  currency?: string;
  [key: string]: unknown;
}

export interface BillingSettings {
  seller?: BillingSeller;
  payment_instructions?: BillingPaymentInstruction[];
  catalog?: BillingCatalogItem[];
  default_currency?: string;
  default_payment_terms_days?: number;
  default_terms?: string[];
  footer?: string;
  tax_label?: string;
  default_tax_rate?: number;
  number_prefix?: string;
  number_format?: string;
  sequence_reset?: string;
  sequence_starts?: { invoice?: number; receipt?: number };
  billing_cc_emails?: string[];
  reminders_enabled?: boolean;
  reminder_days_before_due?: number[];
  reminder_days_after_due?: number[];
  [key: string]: unknown;
}

export type BillingSettingsUpdate = Partial<BillingSettings>;

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export interface BillingCustomerInput {
  name?: string;
  contact_name?: string;
  billing_emails?: string[];
  phone?: string;
  address_lines?: string[];
  country?: string;
  tax_id?: string;
  currency?: string;
  group_id?: string;
  [key: string]: unknown;
}

export interface BillingCustomerUpdate extends BillingCustomerInput {
  status?: 'active' | 'archived';
}

export interface BillingCustomer {
  id: string;
  _id?: string;
  name?: string;
  contact_name?: string;
  billing_emails?: string[];
  phone?: string;
  address_lines?: string[];
  country?: string;
  tax_id?: string;
  currency?: string;
  group_id?: string;
  status?: string;
  invoice_count?: number;
  outstanding_balance?: number | Record<string, number>;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

export type BillingInvoiceKind = 'invoice' | 'proforma';
export type BillingInvoiceStatus =
  | 'draft'
  | 'open'
  | 'partially_paid'
  | 'paid'
  | 'void'
  | 'converted'
  | 'overdue'
  | (string & {});

export interface BillingLineItem {
  item?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  amount?: number;
}

export interface BillingInvoiceInput {
  customer_id: string;
  kind?: BillingInvoiceKind;
  subject?: string;
  reference?: string;
  currency?: string;
  payment_terms_days?: number;
  line_items: BillingLineItem[];
  discount_amount?: number;
  tax_rate?: number;
  notes?: string;
  terms?: string[];
  [key: string]: unknown;
}

export type BillingInvoiceUpdate = Partial<BillingInvoiceInput>;

export interface BillingInvoice {
  id: string;
  _id?: string;
  kind?: BillingInvoiceKind;
  status?: BillingInvoiceStatus;
  number?: string;
  invoice_number?: string;
  customer_id?: string;
  customer?: BillingCustomer;
  subject?: string;
  reference?: string;
  currency?: string;
  payment_terms_days?: number;
  issue_date?: string;
  due_date?: string;
  line_items?: BillingLineItem[];
  subtotal?: number;
  discount_amount?: number;
  tax_rate?: number;
  tax_amount?: number;
  total?: number;
  grand_total?: number;
  amount_paid?: number;
  paid_amount?: number;
  amount_due?: number;
  balance_due?: number;
  balance?: number;
  is_overdue?: boolean;
  days_overdue?: number;
  notes?: string;
  terms?: string[] | string;
  payments?: BillingPayment[];
  activity?: BillingInvoiceActivity[];
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface BillingInvoiceActivity {
  id?: string;
  _id?: string;
  type?: string;
  message?: string;
  note?: string;
  at?: string;
  created_at?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export type BillingPaymentMethod =
  | 'bank_transfer'
  | 'mobile_money'
  | 'cheque'
  | 'cash'
  | 'card'
  | 'other';

export interface BillingPaymentInput {
  amount: number;
  method: BillingPaymentMethod;
  reference?: string;
  paid_at?: string;
  receipt_number?: string;
  notes?: string;
  send_receipt?: boolean;
  [key: string]: unknown;
}

export interface BillingPayment {
  id: string;
  _id?: string;
  receipt_number?: string;
  invoice_id?: string;
  /** Present when the API embeds the parent invoice (e.g. org views). */
  invoice?: BillingInvoice;
  customer_id?: string;
  customer?: BillingCustomer;
  amount?: number;
  currency?: string;
  method?: BillingPaymentMethod;
  reference?: string;
  paid_at?: string;
  status?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// List query params (per-resource; replaces the generic BillingListParams)
// ---------------------------------------------------------------------------

export interface BillingInvoiceListParams {
  status?: BillingInvoiceStatus[];
  kind?: BillingInvoiceKind;
  customer_id?: string;
  group_id?: string;
  currency?: string;
  from?: string;
  to?: string;
  search?: string;
  limit?: number;
  skip?: number;
}

export interface BillingPaymentListParams {
  status?: string[];
  method?: BillingPaymentMethod;
  invoice_id?: string;
  customer_id?: string;
  group_id?: string;
  currency?: string;
  from?: string;
  to?: string;
  search?: string;
  limit?: number;
  skip?: number;
}

export interface BillingCustomerListParams {
  search?: string;
  status?: 'active' | 'archived' | 'all';
  group_id?: string;
  limit?: number;
  skip?: number;
}

export interface BillingSummaryParams {
  from?: string;
  to?: string;
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

export interface BillingSummaryBucket {
  currency?: string;
  outstanding_amount?: number;
  outstanding_count?: number;
  overdue_amount?: number;
  overdue_count?: number;
  invoiced_amount?: number;
  collected_amount?: number;
  counts_by_status?: Record<string, number>;
  status_counts?: Record<string, number>;
  [key: string]: unknown;
}

export interface BillingSummary {
  buckets: BillingSummaryBucket[];
  from?: string;
  to?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Mutation results (no-content responses)
// ---------------------------------------------------------------------------

export interface BillingMutationResult {
  success: boolean;
  message: string;
  data?: unknown;
}

// ---------------------------------------------------------------------------
// PDF fetch options
// ---------------------------------------------------------------------------

export interface BillingPdfOptions {
  download?: boolean;
}

// ---------------------------------------------------------------------------
// Action payloads
// ---------------------------------------------------------------------------

export interface BillingFinalizeOptions {
  send?: boolean;
  message?: string;
  invoice_number?: string;
  issue_date?: string;
}

export interface BillingSendOptions {
  to?: string[];
  cc?: string[];
  message?: string;
}

export interface BillingMarkSentOptions {
  sent_at?: string;
  note?: string;
}

export interface BillingRemindOptions {
  to?: string[];
}

export interface BillingVoidOptions {
  reason?: string;
}

export interface BillingSendReceiptOptions {
  to?: string[];
  cc?: string[];
}
