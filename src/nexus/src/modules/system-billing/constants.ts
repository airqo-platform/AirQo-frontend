import type {
  BillingInvoiceKind,
  BillingInvoiceStatus,
  BillingPaymentMethod,
} from '@/shared/types/billing';

export const BILLING_NAV = {
  dashboard: '/system/billing',
  invoices: '/system/billing/invoices',
  customers: '/system/billing/customers',
  payments: '/system/billing/payments',
  settings: '/system/billing/settings',
} as const;

export const INVOICE_STATUS_META: Record<
  BillingInvoiceStatus,
  { label: string; value: BillingInvoiceStatus; color: string }
> = {
  draft: {
    label: 'Draft',
    value: 'draft',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  open: {
    label: 'Open',
    value: 'open',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  partially_paid: {
    label: 'Partially Paid',
    value: 'partially_paid',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  },
  paid: {
    label: 'Paid',
    value: 'paid',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  overdue: {
    label: 'Overdue',
    value: 'overdue',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  },
  void: {
    label: 'Void',
    value: 'void',
    color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  },
  converted: {
    label: 'Converted',
    value: 'converted',
    color:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  },
};

export const DEFAULT_INVOICE_STATUS_ORDER: BillingInvoiceStatus[] = [
  'draft',
  'open',
  'partially_paid',
  'paid',
  'overdue',
  'void',
  'converted',
];

export const INVOICE_KIND_META: Record<
  BillingInvoiceKind,
  { label: string; value: BillingInvoiceKind; color: string }
> = {
  invoice: {
    label: 'Invoice',
    value: 'invoice',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  },
  proforma: {
    label: 'Pro Forma',
    value: 'proforma',
    color:
      'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300',
  },
};

export const PAYMENT_METHOD_LABELS: Record<BillingPaymentMethod, string> = {
  bank_transfer: 'Bank Transfer',
  mobile_money: 'Mobile Money',
  cheque: 'Cheque',
  cash: 'Cash',
  card: 'Card',
  other: 'Other',
};

/** Only `succeeded` is documented by the API; unknown statuses fall back to a neutral pill. */
export const PAYMENT_STATUS_META: Record<
  string,
  { label: string; color: string }
> = {
  succeeded: {
    label: 'Succeeded',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
};

export const CUSTOMER_STATUS_META: Record<
  'active' | 'archived',
  { label: string; color: string }
> = {
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  },
  archived: {
    label: 'Archived',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  },
};

export const NUMBER_FORMAT_TOKENS: Record<string, string> = {
  '{prefix}': 'Your configured prefix',
  '{code}': 'A short code (e.g. INV, RCP)',
  '{yyyy}': '4-digit year',
  '{yy}': '2-digit year',
  '{seq}': 'Sequence number',
  '{seq4}': 'Zero-padded 4-digit sequence',
};

export const FALLBACK_CURRENCY = 'USD';

export const DEFAULT_LIST_LIMIT = 10;
export const CUSTOMER_PAGE_SIZE_OPTIONS = [10, 20, 40];
