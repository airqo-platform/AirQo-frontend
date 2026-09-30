import { useSWRConfig } from 'swr';
import { billingService } from '@/shared/services/billingService';
import type {
  BillingCustomer,
  BillingCustomerListParams,
  BillingInvoice,
  BillingInvoiceListParams,
  BillingListResult,
  BillingPayment,
  BillingPaymentListParams,
  BillingSettings,
  BillingSummary,
  BillingSummaryParams,
} from '@/shared/types/billing';

/**
 * Canonical serializer: sorted keys, empties dropped. Produces a stable
 * string for use as part of an SWR key so equivalent param sets share a cache.
 */
export const serializeParams = (params: Record<string, unknown>): string => {
  const query = new URLSearchParams();
  Object.keys(params)
    .sort()
    .forEach(key => {
      const value = params[key];
      if (
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return;
      }
      query.set(key, String(value));
    });
  return query.toString();
};

export const billingKeys = {
  settings: 'billing/settings',
  summary: (from?: string, to?: string) =>
    `billing/summary:${serializeParams({ from, to })}`,
  customers: (params: BillingCustomerListParams = {}) =>
    `billing/customers:${serializeParams({
      skip: params.skip,
      limit: params.limit,
      status: params.status,
      search: params.search,
      group_id: params.group_id,
    })}`,
  customer: (id: string) => `billing/customers/${id}`,
  invoices: (params: BillingInvoiceListParams = {}) =>
    `billing/invoices:${serializeParams({
      skip: params.skip,
      limit: params.limit,
      status: Array.isArray(params.status)
        ? params.status.slice().sort().join(',')
        : params.status,
      search: params.search,
      from: params.from,
      to: params.to,
      customer_id: params.customer_id,
      kind: params.kind,
      group_id: params.group_id,
      currency: params.currency,
    })}`,
  invoice: (id: string) => `billing/invoices/${id}`,
  payments: (params: BillingPaymentListParams = {}) =>
    `billing/payments:${serializeParams({
      skip: params.skip,
      limit: params.limit,
      status: Array.isArray(params.status)
        ? params.status.slice().sort().join(',')
        : params.status,
      search: params.search,
      from: params.from,
      to: params.to,
      invoice_id: params.invoice_id,
      customer_id: params.customer_id,
      method: params.method,
      group_id: params.group_id,
      currency: params.currency,
    })}`,
  payment: (id: string) => `billing/payments/${id}`,
};

/**
 * Revalidates every cached billing key. Filter predicate only — never pass an
 * explicit data argument, which would wipe the SWR cache (per app rules).
 */
export const revalidateBilling = (
  mutate: (
    key: (key: unknown) => boolean,
    options?: { revalidate: boolean }
  ) => Promise<unknown>
): Promise<unknown> =>
  mutate(
    (key: unknown) => typeof key === 'string' && key.startsWith('billing/'),
    { revalidate: true }
  );

export const useBillingMutate = () => {
  const { mutate } = useSWRConfig();
  return () => revalidateBilling(mutate);
};

// Fetchers
export const billingFetchers = {
  getSettings: (signal: AbortSignal) => billingService.getSettings(signal),
  getSummary: (signal: AbortSignal, from?: string, to?: string) =>
    billingService.getSummary({ from, to }, signal),
  listCustomers: (signal: AbortSignal, params: BillingCustomerListParams) =>
    billingService.listCustomers(params, signal),
  getCustomer: (signal: AbortSignal, id: string) =>
    billingService.getCustomer(id, signal),
  listInvoices: (signal: AbortSignal, params: BillingInvoiceListParams) =>
    billingService.listInvoices(params, signal),
  getInvoice: (signal: AbortSignal, id: string) =>
    billingService.getInvoice(id, signal),
  listPayments: (signal: AbortSignal, params: BillingPaymentListParams) =>
    billingService.listPayments(params, signal),
  getPayment: (signal: AbortSignal, id: string) =>
    billingService.getPayment(id, signal),
};

export type { BillingCustomer, BillingInvoice, BillingPayment };
export type {
  BillingListResult,
  BillingCustomerListParams,
  BillingInvoiceListParams,
  BillingPaymentListParams,
  BillingSettings,
  BillingSummary,
  BillingSummaryParams,
};
