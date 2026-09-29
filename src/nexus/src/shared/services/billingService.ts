/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiClient, createAuthenticatedClient } from './apiClient';
import { syncClientSessionToken } from './sessionAuthToken';
import type {
  BillingApiEnvelope,
  BillingApiErrorPayload,
  BillingApiErrorField,
  BillingCatalogItem,
  BillingCustomer,
  BillingCustomerInput,
  BillingCustomerListParams,
  BillingCustomerUpdate,
  BillingFinalizeOptions,
  BillingInvoice,
  BillingInvoiceActivity,
  BillingInvoiceInput,
  BillingInvoiceListParams,
  BillingInvoiceUpdate,
  BillingLineItem,
  BillingListResult,
  BillingListMeta,
  BillingMarkSentOptions,
  BillingMutationResult,
  BillingPayment,
  BillingPaymentInput,
  BillingPaymentInstruction,
  BillingPaymentListParams,
  BillingPdfOptions,
  BillingRemindOptions,
  BillingSendOptions,
  BillingSendReceiptOptions,
  BillingSeller,
  BillingSettings,
  BillingSettingsUpdate,
  BillingSummary,
  BillingSummaryBucket,
  BillingSummaryParams,
  BillingVoidOptions,
} from '../types/billing';

const SETTINGS_PATH = '/users/billing/settings';
const SUMMARY_PATH = '/users/billing/summary';
const CUSTOMERS_PATH = '/users/billing/customers';
const INVOICES_PATH = '/users/billing/invoices';
const PAYMENTS_PATH = '/users/billing/payments';

type QueryValue = string | number | boolean | string[] | undefined | null;

/**
 * Builds the query string, dropping undefined/null/empty-string params so an
 * optional filter never becomes `?status=` on the wire. Array values are
 * joined with commas; numbers are stringified.
 */
const buildQuery = (params: Record<string, QueryValue>): string => {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      query.set(key, value.join(','));
    } else {
      query.set(key, String(value));
    }
  }

  return query.toString();
};

const withQuery = (path: string, query: string): string =>
  query ? `${path}?${query}` : path;

/**
 * Extracts a human-readable message from a billing error envelope.
 * `errors.message` may be a string OR an array of {param?,message}.
 */
const extractErrorMessage = (
  payload: BillingApiErrorPayload | undefined,
  fallback: string
): string => {
  if (!payload) return fallback;

  const fieldMessage = payload.errors?.message;
  if (typeof fieldMessage === 'string' && fieldMessage) {
    return fieldMessage;
  }
  if (Array.isArray(fieldMessage) && fieldMessage.length > 0) {
    const first = fieldMessage[0];
    if (first && typeof first.message === 'string' && first.message) {
      return first.message;
    }
  }

  if (typeof payload.message === 'string' && payload.message) {
    return payload.message;
  }

  return fallback;
};

/**
 * Coerces any thrown value into a normalized Error, never swallowing
 * non-Error throws. AxiosErrors ARE `instanceof Error`, so the
 * `response.data` branch is checked FIRST — otherwise real server error
 * envelopes would be silently dropped and the caller would only ever see
 * "Request failed with status code 409".
 */
const toBillingError = (error: unknown, fallback: string): Error => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: { data?: BillingApiErrorPayload; status?: number };
      message?: string;
    };
    const message = extractErrorMessage(
      axiosError.response?.data,
      axiosError.message || fallback
    );
    return new Error(message);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(fallback);
};

/**
 * Shared PDF error helper: decodes a JSON error Blob, and on any failure
 * (missing blob, non-JSON body, empty payload) throws a normalized Error
 * carrying the fallback. Never lets a raw SyntaxError escape.
 */
const throwBlobError = async (blob: Blob, fallback: string): Promise<never> => {
  let parsed: BillingApiErrorPayload | undefined;
  try {
    const text = await blob.text();
    parsed = JSON.parse(text) as BillingApiErrorPayload;
  } catch {
    throw new Error(fallback);
  }
  throw new Error(extractErrorMessage(parsed, fallback));
};

/**
 * Pure helper: normalizes a variety of summary shapes into a flat
 * BillingSummaryBucket[], injecting a `currency` key and skipping
 * non-object entries. Exported for testing and reuse.
 */
export const normalizeSummaryBuckets = (
  summary: unknown
): BillingSummaryBucket[] => {
  if (!summary) return [];

  // Shape: { currencies: [...] }
  if (
    summary &&
    typeof summary === 'object' &&
    Array.isArray((summary as { currencies?: unknown }).currencies)
  ) {
    return (summary as { currencies: unknown[] }).currencies
      .filter((b): b is Record<string, unknown> =>
        Boolean(b && typeof b === 'object')
      )
      .map(injectCurrency);
  }

  // Shape: { by_currency: { USD: {...}, EUR: {...} } }
  if (
    summary &&
    typeof summary === 'object' &&
    (summary as { by_currency?: unknown }).by_currency &&
    typeof (summary as { by_currency: unknown }).by_currency === 'object'
  ) {
    const byCurrency = (summary as { by_currency: Record<string, unknown> })
      .by_currency;
    return Object.entries(byCurrency)
      .filter(([, value]) => Boolean(value && typeof value === 'object'))
      .map(([currency, bucket]) => ({
        ...(bucket as Record<string, unknown>),
        currency,
      }));
  }

  // Shape: flat array of buckets
  if (Array.isArray(summary)) {
    return summary
      .filter((b): b is Record<string, unknown> =>
        Boolean(b && typeof b === 'object')
      )
      .map(injectCurrency);
  }

  // Shape: flat map { USD: {...}, KES: {...} }
  if (typeof summary === 'object') {
    return Object.entries(summary as Record<string, unknown>)
      .filter(([, value]) => Boolean(value && typeof value === 'object'))
      .map(([currency, bucket]) => ({
        ...(bucket as Record<string, unknown>),
        currency,
      }));
  }

  return [];
};

const injectCurrency = (
  bucket: Record<string, unknown>
): BillingSummaryBucket => {
  if (typeof bucket.currency === 'string' && bucket.currency) {
    return bucket as BillingSummaryBucket;
  }
  return { ...bucket, currency: (bucket.currency as string) || 'USD' };
};

const normalizeSeller = (raw: any): BillingSeller => ({
  name: raw?.name ?? '',
  address_lines: Array.isArray(raw?.address_lines) ? raw.address_lines : [],
  email: raw?.email,
  phone: raw?.phone,
  ...raw,
});

const normalizePaymentInstructions = (
  raw: any
): BillingPaymentInstruction[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry: any) => ({
    label: entry?.label ?? '',
    value: entry?.value ?? '',
    ...(typeof entry === 'object' && entry ? entry : {}),
  }));
};

const normalizeCatalog = (raw: any): BillingCatalogItem[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry: any) => ({
    item: entry?.item,
    description: entry?.description,
    unit_price: Number(entry?.unit_price ?? 0),
    currency: entry?.currency,
    ...(typeof entry === 'object' && entry ? entry : {}),
  }));
};

const normalizeCustomer = (raw: any): BillingCustomer => {
  const id = String(raw?._id ?? raw?.id ?? '');
  if (!id) throw new Error('Customer record is missing an id');
  return {
    id,
    _id: raw?._id != null ? String(raw._id) : undefined,
    name: raw?.name,
    contact_name: raw?.contact_name,
    billing_emails: raw?.billing_emails,
    phone: raw?.phone,
    address_lines: raw?.address_lines,
    country: raw?.country,
    tax_id: raw?.tax_id,
    currency: raw?.currency,
    group_id: raw?.group_id,
    status: raw?.status,
    invoice_count: raw?.invoice_count,
    outstanding_balance: raw?.outstanding_balance,
    created_at: raw?.created_at,
    updated_at: raw?.updated_at,
    ...raw,
  };
};

const normalizeLineItem = (raw: any): BillingLineItem => ({
  item: raw?.item,
  description: raw?.description,
  quantity: Number(raw?.quantity ?? 0),
  unit_price: Number(raw?.unit_price ?? 0),
  amount: raw?.amount,
});

const normalizeActivity = (raw: any): BillingInvoiceActivity => ({
  id: raw?.id != null ? String(raw.id) : undefined,
  _id: raw?._id != null ? String(raw._id) : undefined,
  type: raw?.type,
  message: raw?.message,
  note: raw?.note,
  at: raw?.at,
  created_at: raw?.created_at,
  ...raw,
});

const normalizeInvoice = (raw: any): BillingInvoice => {
  const id = String(raw?._id ?? raw?.id ?? '');
  if (!id) throw new Error('Invoice record is missing an id');

  const customer =
    raw?.customer && typeof raw.customer === 'object'
      ? normalizeCustomer(raw.customer)
      : undefined;

  const lineItems = Array.isArray(raw?.line_items)
    ? raw.line_items.map(normalizeLineItem)
    : undefined;

  const activity = Array.isArray(raw?.activity)
    ? raw.activity.map(normalizeActivity)
    : undefined;

  // Alias resolution for totals; `terms` may arrive as a string or array.
  const terms = raw?.terms;
  const termsResolved =
    typeof terms === 'string' || Array.isArray(terms) ? terms : undefined;

  return {
    id,
    _id: raw?._id != null ? String(raw._id) : undefined,
    kind: raw?.kind,
    status: raw?.status,
    number: raw?.number ?? raw?.invoice_number,
    invoice_number: raw?.invoice_number,
    customer_id: raw?.customer_id,
    customer,
    subject: raw?.subject,
    reference: raw?.reference,
    currency: raw?.currency,
    payment_terms_days: raw?.payment_terms_days,
    issue_date: raw?.issue_date,
    due_date: raw?.due_date,
    line_items: lineItems,
    subtotal: raw?.subtotal ?? raw?.sub_total,
    sub_total: raw?.sub_total,
    discount_amount: raw?.discount_amount ?? raw?.discount,
    discount: raw?.discount,
    tax_rate: raw?.tax_rate,
    tax_amount: raw?.tax_amount ?? raw?.tax_total,
    tax_total: raw?.tax_total,
    total: raw?.total ?? raw?.grand_total,
    grand_total: raw?.grand_total,
    amount_paid: raw?.amount_paid ?? raw?.paid_amount,
    paid_amount: raw?.paid_amount,
    amount_due: raw?.amount_due ?? raw?.balance_due ?? raw?.balance,
    balance_due: raw?.balance_due,
    balance: raw?.balance,
    is_overdue: raw?.is_overdue,
    days_overdue: raw?.days_overdue,
    notes: raw?.notes,
    terms: termsResolved,
    payments: raw?.payments,
    activity,
    created_at: raw?.created_at,
    updated_at: raw?.updated_at,
    ...raw,
  };
};

const normalizePayment = (raw: any): BillingPayment => {
  const id = String(raw?._id ?? raw?.id ?? '');
  if (!id) throw new Error('Payment record is missing an id');
  return {
    id,
    _id: raw?._id != null ? String(raw._id) : undefined,
    receipt_number: raw?.receipt_number,
    invoice_id: raw?.invoice_id,
    customer_id: raw?.customer_id,
    customer:
      raw?.customer && typeof raw.customer === 'object'
        ? normalizeCustomer(raw.customer)
        : undefined,
    amount: raw?.amount,
    currency: raw?.currency,
    method: raw?.method,
    reference: raw?.reference,
    paid_at: raw?.paid_at ?? raw?.payment_date,
    status: raw?.status,
    notes: raw?.notes,
    created_at: raw?.created_at,
    updated_at: raw?.updated_at,
    ...raw,
  };
};

const normalizeSettings = (raw: any): BillingSettings => {
  const seller = raw?.seller ? normalizeSeller(raw.seller) : undefined;
  const paymentInstructions = raw?.payment_instructions
    ? normalizePaymentInstructions(raw.payment_instructions)
    : undefined;
  const catalog = raw?.catalog ? normalizeCatalog(raw.catalog) : undefined;

  return {
    seller,
    payment_instructions: paymentInstructions,
    catalog,
    default_currency: raw?.default_currency,
    default_payment_terms_days: raw?.default_payment_terms_days,
    default_terms: raw?.default_terms,
    footer: raw?.footer,
    tax_label: raw?.tax_label,
    default_tax_rate: raw?.default_tax_rate,
    number_prefix: raw?.number_prefix,
    number_format: raw?.number_format,
    sequence_reset: raw?.sequence_reset,
    sequence_starts: raw?.sequence_starts,
    billing_cc_emails: raw?.billing_cc_emails,
    reminders_enabled: raw?.reminders_enabled,
    reminder_days_before_due: raw?.reminder_days_before_due,
    reminder_days_after_due: raw?.reminder_days_after_due,
    ...raw,
  };
};

const unwrapList = <T>(
  data: any,
  normalize: (raw: any) => T
): BillingListResult<T> => {
  const rawItems =
    (data && typeof data === 'object' && Array.isArray(data.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : []) ?? [];

  const meta: BillingListMeta =
    data && typeof data === 'object' && data.meta
      ? {
          total: Number(data.meta.total ?? rawItems.length),
          limit: Number(data.meta.limit ?? 0),
          skip: Number(data.meta.skip ?? 0),
        }
      : {
          total: rawItems.length,
          limit: 0,
          skip: 0,
        };

  const items: T[] = [];
  for (const raw of rawItems) {
    items.push(normalize(raw));
  }

  return { items, meta };
};

const buildMutationResult = (
  data: any,
  fallback: string
): BillingMutationResult => ({
  success: Boolean(data?.success ?? true),
  message: String(data?.message ?? fallback),
  data: data?.data,
});

// Re-exported so consumers and tests can share the error-field type.
export type { BillingApiErrorField };

export class BillingService {
  private authenticatedClient: ApiClient;

  constructor() {
    this.authenticatedClient = createAuthenticatedClient();
  }

  private async ensureAuthenticated() {
    await syncClientSessionToken(this.authenticatedClient);
  }

  // ---------------------------------------------------------------------------
  // Settings / Summary
  // ---------------------------------------------------------------------------

  async getSettings(signal?: AbortSignal): Promise<BillingSettings> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.get<
        BillingApiEnvelope<BillingSettings> | BillingSettings
      >(SETTINGS_PATH, { signal });
      const envelope = response.data as any;
      const raw = envelope?.data ?? envelope;
      return normalizeSettings(raw);
    } catch (error) {
      throw toBillingError(error, 'Failed to load billing settings');
    }
  }

  async updateSettings(
    payload: BillingSettingsUpdate,
    signal?: AbortSignal
  ): Promise<BillingSettings> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.put<
        BillingApiEnvelope<BillingSettings>
      >(SETTINGS_PATH, payload, { signal });
      const envelope = response.data as any;
      const raw = envelope?.data ?? envelope;
      return normalizeSettings(raw);
    } catch (error) {
      throw toBillingError(error, 'Failed to update billing settings');
    }
  }

  async getSummary(
    { from, to }: BillingSummaryParams = {},
    signal?: AbortSignal
  ): Promise<BillingSummary> {
    await this.ensureAuthenticated();
    try {
      const query = buildQuery({ from, to });
      const response = await this.authenticatedClient.get<
        BillingApiEnvelope<any> | any
      >(withQuery(SUMMARY_PATH, query), { signal });
      const envelope = response.data as any;
      const raw = envelope?.data ?? envelope;
      // Spread raw FIRST so the canonical fields below always win — a server
      // stray `buckets`/`from`/`to` key can never overwrite our normalized
      // values.
      const buckets = normalizeSummaryBuckets(raw);
      return {
        ...(typeof raw === 'object' && raw ? raw : {}),
        buckets,
        from: raw?.from ?? from,
        to: raw?.to ?? to,
      };
    } catch (error) {
      throw toBillingError(error, 'Failed to load billing summary');
    }
  }

  // ---------------------------------------------------------------------------
  // Customers
  // ---------------------------------------------------------------------------

  async createCustomer(
    payload: BillingCustomerInput
  ): Promise<BillingCustomer> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.post<
        BillingApiEnvelope<BillingCustomer>
      >(CUSTOMERS_PATH, payload);
      const envelope = response.data as any;
      return normalizeCustomer(envelope?.data ?? envelope);
    } catch (error) {
      throw toBillingError(error, 'Failed to create customer');
    }
  }

  async listCustomers(
    params?: BillingCustomerListParams,
    signal?: AbortSignal
  ): Promise<BillingListResult<BillingCustomer>> {
    await this.ensureAuthenticated();
    try {
      const query = buildQuery({
        skip: params?.skip,
        limit: params?.limit,
        status: params?.status,
        search: params?.search,
        group_id: params?.group_id,
      });
      const response = await this.authenticatedClient.get<
        BillingApiEnvelope<any> | any
      >(withQuery(CUSTOMERS_PATH, query), { signal });
      const envelope = response.data as any;
      const raw = envelope?.data ?? envelope;
      return unwrapList(raw, normalizeCustomer);
    } catch (error) {
      throw toBillingError(error, 'Failed to load customers');
    }
  }

  async getCustomer(
    id: string,
    signal?: AbortSignal
  ): Promise<BillingCustomer> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.get<
        BillingApiEnvelope<BillingCustomer>
      >(`${CUSTOMERS_PATH}/${id}`, { signal });
      const envelope = response.data as any;
      return normalizeCustomer(envelope?.data ?? envelope);
    } catch (error) {
      throw toBillingError(error, 'Failed to load customer');
    }
  }

  async updateCustomer(
    id: string,
    payload: BillingCustomerUpdate
  ): Promise<BillingCustomer> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.put<
        BillingApiEnvelope<BillingCustomer>
      >(`${CUSTOMERS_PATH}/${id}`, payload);
      const envelope = response.data as any;
      return normalizeCustomer(envelope?.data ?? envelope);
    } catch (error) {
      throw toBillingError(error, 'Failed to update customer');
    }
  }

  // ---------------------------------------------------------------------------
  // Invoices
  // ---------------------------------------------------------------------------

  async createInvoice(payload: BillingInvoiceInput): Promise<BillingInvoice> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.post<
        BillingApiEnvelope<BillingInvoice>
      >(INVOICES_PATH, payload);
      const envelope = response.data as any;
      return normalizeInvoice(envelope?.data ?? envelope);
    } catch (error) {
      throw toBillingError(error, 'Failed to create invoice');
    }
  }

  async listInvoices(
    params?: BillingInvoiceListParams,
    signal?: AbortSignal
  ): Promise<BillingListResult<BillingInvoice>> {
    await this.ensureAuthenticated();
    try {
      const query = buildQuery({
        skip: params?.skip,
        limit: params?.limit,
        status: params?.status,
        search: params?.search,
        from: params?.from,
        to: params?.to,
        customer_id: params?.customer_id,
        kind: params?.kind,
        group_id: params?.group_id,
        currency: params?.currency,
      });
      const response = await this.authenticatedClient.get<
        BillingApiEnvelope<any> | any
      >(withQuery(INVOICES_PATH, query), { signal });
      const envelope = response.data as any;
      const raw = envelope?.data ?? envelope;
      return unwrapList(raw, normalizeInvoice);
    } catch (error) {
      throw toBillingError(error, 'Failed to load invoices');
    }
  }

  async getInvoice(id: string, signal?: AbortSignal): Promise<BillingInvoice> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.get<
        BillingApiEnvelope<BillingInvoice>
      >(`${INVOICES_PATH}/${id}`, { signal });
      const envelope = response.data as any;
      return normalizeInvoice(envelope?.data ?? envelope);
    } catch (error) {
      throw toBillingError(error, 'Failed to load invoice');
    }
  }

  async updateInvoice(
    id: string,
    payload: BillingInvoiceUpdate
  ): Promise<BillingInvoice> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.put<
        BillingApiEnvelope<BillingInvoice>
      >(`${INVOICES_PATH}/${id}`, payload);
      const envelope = response.data as any;
      return normalizeInvoice(envelope?.data ?? envelope);
    } catch (error) {
      throw toBillingError(error, 'Failed to update invoice');
    }
  }

  async deleteInvoice(id: string): Promise<BillingMutationResult> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.delete<
        BillingApiEnvelope<any>
      >(`${INVOICES_PATH}/${id}`);
      return buildMutationResult(response.data, 'Failed to delete invoice');
    } catch (error) {
      throw toBillingError(error, 'Failed to delete invoice');
    }
  }

  async getInvoicePdf(
    id: string,
    { download }: BillingPdfOptions = {},
    signal?: AbortSignal
  ): Promise<Blob> {
    await this.ensureAuthenticated();
    try {
      const query = buildQuery({ download: download ? 'true' : undefined });
      const response = await this.authenticatedClient.get<Blob>(
        withQuery(`${INVOICES_PATH}/${id}/pdf`, query),
        { signal, responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as { response?: { data?: Blob } };
      if (axiosError?.response?.data instanceof Blob) {
        await throwBlobError(axiosError.response.data, 'Failed to load PDF');
      }
      throw toBillingError(error, 'Failed to load invoice PDF');
      // Unreachable — throwBlobError/toBillingError always throw — but keeps
      // control-flow explicit.
    }
  }

  async finalizeInvoice(
    id: string,
    options: BillingFinalizeOptions = {}
  ): Promise<BillingInvoice> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.post<
        BillingApiEnvelope<BillingInvoice>
      >(`${INVOICES_PATH}/${id}/finalize`, options);
      const envelope = response.data as any;
      return normalizeInvoice(envelope?.data ?? envelope);
    } catch (error) {
      throw toBillingError(error, 'Failed to finalize invoice');
    }
  }

  async sendInvoice(
    id: string,
    options: BillingSendOptions = {}
  ): Promise<BillingMutationResult> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.post<
        BillingApiEnvelope<any>
      >(`${INVOICES_PATH}/${id}/send`, options);
      return buildMutationResult(response.data, 'Failed to send invoice');
    } catch (error) {
      throw toBillingError(error, 'Failed to send invoice');
    }
  }

  async markInvoiceSent(
    id: string,
    options: BillingMarkSentOptions = {}
  ): Promise<BillingInvoice> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.post<
        BillingApiEnvelope<BillingInvoice>
      >(`${INVOICES_PATH}/${id}/mark-sent`, options);
      const envelope = response.data as any;
      return normalizeInvoice(envelope?.data ?? envelope);
    } catch (error) {
      throw toBillingError(error, 'Failed to mark invoice sent');
    }
  }

  async remindInvoice(
    id: string,
    options: BillingRemindOptions = {}
  ): Promise<BillingMutationResult> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.post<
        BillingApiEnvelope<any>
      >(`${INVOICES_PATH}/${id}/remind`, options);
      return buildMutationResult(response.data, 'Failed to send reminder');
    } catch (error) {
      throw toBillingError(error, 'Failed to send reminder');
    }
  }

  async voidInvoice(
    id: string,
    options: BillingVoidOptions = {}
  ): Promise<BillingInvoice> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.post<
        BillingApiEnvelope<BillingInvoice>
      >(`${INVOICES_PATH}/${id}/void`, options);
      const envelope = response.data as any;
      return normalizeInvoice(envelope?.data ?? envelope);
    } catch (error) {
      throw toBillingError(error, 'Failed to void invoice');
    }
  }

  async convertInvoice(id: string): Promise<BillingInvoice> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.post<
        BillingApiEnvelope<BillingInvoice>
      >(`${INVOICES_PATH}/${id}/convert`);
      const envelope = response.data as any;
      return normalizeInvoice(envelope?.data ?? envelope);
    } catch (error) {
      throw toBillingError(error, 'Failed to convert pro forma to invoice');
    }
  }

  // ---------------------------------------------------------------------------
  // Payments
  // ---------------------------------------------------------------------------

  async recordPayment(
    invoiceId: string,
    payload: BillingPaymentInput
  ): Promise<BillingPayment> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.post<
        BillingApiEnvelope<BillingPayment>
      >(`${INVOICES_PATH}/${invoiceId}/payments`, payload);
      const envelope = response.data as any;
      return normalizePayment(envelope?.data ?? envelope);
    } catch (error) {
      throw toBillingError(error, 'Failed to record payment');
    }
  }

  async listPayments(
    params?: BillingPaymentListParams,
    signal?: AbortSignal
  ): Promise<BillingListResult<BillingPayment>> {
    await this.ensureAuthenticated();
    try {
      const query = buildQuery({
        skip: params?.skip,
        limit: params?.limit,
        status: params?.status,
        search: params?.search,
        from: params?.from,
        to: params?.to,
        invoice_id: params?.invoice_id,
        customer_id: params?.customer_id,
        method: params?.method,
        group_id: params?.group_id,
        currency: params?.currency,
      });
      const response = await this.authenticatedClient.get<
        BillingApiEnvelope<any> | any
      >(withQuery(PAYMENTS_PATH, query), { signal });
      const envelope = response.data as any;
      const raw = envelope?.data ?? envelope;
      return unwrapList(raw, normalizePayment);
    } catch (error) {
      throw toBillingError(error, 'Failed to load payments');
    }
  }

  async getPayment(id: string, signal?: AbortSignal): Promise<BillingPayment> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.get<
        BillingApiEnvelope<BillingPayment>
      >(`${PAYMENTS_PATH}/${id}`, { signal });
      const envelope = response.data as any;
      return normalizePayment(envelope?.data ?? envelope);
    } catch (error) {
      throw toBillingError(error, 'Failed to load payment');
    }
  }

  async getReceiptPdf(
    id: string,
    { download }: BillingPdfOptions = {},
    signal?: AbortSignal
  ): Promise<Blob> {
    await this.ensureAuthenticated();
    try {
      const query = buildQuery({ download: download ? 'true' : undefined });
      const response = await this.authenticatedClient.get<Blob>(
        withQuery(`${PAYMENTS_PATH}/${id}/receipt`, query),
        { signal, responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as { response?: { data?: Blob } };
      if (axiosError?.response?.data instanceof Blob) {
        await throwBlobError(
          axiosError.response.data,
          'Failed to load receipt'
        );
      }
      throw toBillingError(error, 'Failed to load receipt PDF');
    }
  }

  async sendReceipt(
    id: string,
    options: BillingSendReceiptOptions = {}
  ): Promise<BillingMutationResult> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.post<
        BillingApiEnvelope<any>
      >(`${PAYMENTS_PATH}/${id}/send-receipt`, options);
      return buildMutationResult(response.data, 'Failed to send receipt');
    } catch (error) {
      throw toBillingError(error, 'Failed to send receipt');
    }
  }

  async voidPayment(
    id: string,
    options: BillingVoidOptions = {}
  ): Promise<BillingPayment> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.post<
        BillingApiEnvelope<BillingPayment>
      >(`${PAYMENTS_PATH}/${id}/void`, options);
      const envelope = response.data as any;
      return normalizePayment(envelope?.data ?? envelope);
    } catch (error) {
      throw toBillingError(error, 'Failed to void payment');
    }
  }

  // ---------------------------------------------------------------------------
  // Group / org views
  // ---------------------------------------------------------------------------

  async listGroupInvoices(
    grpId: string,
    params?: BillingInvoiceListParams,
    signal?: AbortSignal
  ): Promise<BillingListResult<BillingInvoice>> {
    await this.ensureAuthenticated();
    try {
      const query = buildQuery({
        skip: params?.skip,
        limit: params?.limit,
        status: params?.status,
        search: params?.search,
        from: params?.from,
        to: params?.to,
        customer_id: params?.customer_id,
        kind: params?.kind,
        group_id: params?.group_id,
        currency: params?.currency,
      });
      const response = await this.authenticatedClient.get<
        BillingApiEnvelope<any> | any
      >(withQuery(`/users/billing/groups/${grpId}/invoices`, query), {
        signal,
      });
      const envelope = response.data as any;
      const raw = envelope?.data ?? envelope;
      return unwrapList(raw, normalizeInvoice);
    } catch (error) {
      throw toBillingError(error, 'Failed to load group invoices');
    }
  }

  async getGroupInvoice(
    grpId: string,
    invoiceId: string,
    signal?: AbortSignal
  ): Promise<BillingInvoice> {
    await this.ensureAuthenticated();
    try {
      const response = await this.authenticatedClient.get<
        BillingApiEnvelope<BillingInvoice>
      >(`/users/billing/groups/${grpId}/invoices/${invoiceId}`, { signal });
      const envelope = response.data as any;
      return normalizeInvoice(envelope?.data ?? envelope);
    } catch (error) {
      throw toBillingError(error, 'Failed to load group invoice');
    }
  }

  async getGroupInvoicePdf(
    grpId: string,
    invoiceId: string,
    { download }: BillingPdfOptions = {},
    signal?: AbortSignal
  ): Promise<Blob> {
    await this.ensureAuthenticated();
    try {
      const query = buildQuery({ download: download ? 'true' : undefined });
      const response = await this.authenticatedClient.get<Blob>(
        withQuery(
          `/users/billing/groups/${grpId}/invoices/${invoiceId}/pdf`,
          query
        ),
        { signal, responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as { response?: { data?: Blob } };
      if (axiosError?.response?.data instanceof Blob) {
        await throwBlobError(axiosError.response.data, 'Failed to load PDF');
      }
      throw toBillingError(error, 'Failed to load group invoice PDF');
    }
  }

  async listGroupPayments(
    grpId: string,
    params?: BillingPaymentListParams,
    signal?: AbortSignal
  ): Promise<BillingListResult<BillingPayment>> {
    await this.ensureAuthenticated();
    try {
      const query = buildQuery({
        skip: params?.skip,
        limit: params?.limit,
        status: params?.status,
        search: params?.search,
        from: params?.from,
        to: params?.to,
        invoice_id: params?.invoice_id,
        customer_id: params?.customer_id,
        method: params?.method,
        group_id: params?.group_id,
        currency: params?.currency,
      });
      const response = await this.authenticatedClient.get<
        BillingApiEnvelope<any> | any
      >(withQuery(`/users/billing/groups/${grpId}/payments`, query), {
        signal,
      });
      const envelope = response.data as any;
      const raw = envelope?.data ?? envelope;
      return unwrapList(raw, normalizePayment);
    } catch (error) {
      throw toBillingError(error, 'Failed to load group payments');
    }
  }

  async getGroupReceiptPdf(
    grpId: string,
    paymentId: string,
    { download }: BillingPdfOptions = {},
    signal?: AbortSignal
  ): Promise<Blob> {
    await this.ensureAuthenticated();
    try {
      const query = buildQuery({ download: download ? 'true' : undefined });
      const response = await this.authenticatedClient.get<Blob>(
        withQuery(
          `/users/billing/groups/${grpId}/payments/${paymentId}/receipt`,
          query
        ),
        { signal, responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as { response?: { data?: Blob } };
      if (axiosError?.response?.data instanceof Blob) {
        await throwBlobError(
          axiosError.response.data,
          'Failed to load receipt'
        );
      }
      throw toBillingError(error, 'Failed to load group receipt PDF');
    }
  }
}

export const billingService = new BillingService();
