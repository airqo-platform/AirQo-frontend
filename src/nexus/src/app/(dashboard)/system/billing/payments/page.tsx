'use client';

import React, { Suspense, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeading,
  SearchField,
  SegmentedTabs,
  Select,
} from '@/shared/components/ui';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { AqRefreshCw05, AqCreditCard01 } from '@airqo/icons-react';
import type {
  BillingPayment,
  BillingPaymentMethod,
} from '@/shared/types/billing';
import {
  BillingDateRange,
  BillingFilterBar,
  CurrencyAmount,
  FilterGroup,
  PaymentReceiptActions,
  PaymentStatusBadge,
} from '@/modules/system-billing';
import {
  DEFAULT_LIST_LIMIT,
  PAYMENT_METHOD_LABELS,
} from '@/modules/system-billing/constants';
import {
  billingKeys,
  billingFetchers,
} from '@/modules/system-billing/lib/queries';
import {
  toPaginationProps,
  useBillingList,
  useBillingQuery,
} from '@/modules/system-billing/lib/hooks';
import { getBillingErrorMessage } from '@/modules/system-billing/lib/errors';
import {
  formatBillingDateTime,
  paymentMethodLabel,
} from '@/modules/system-billing/lib/format';

type StatusFilter = 'all' | 'succeeded';
type MethodFilter = 'all' | BillingPaymentMethod;

type PaymentFilters = {
  status?: 'succeeded'[];
  method?: BillingPaymentMethod;
  from?: string;
  to?: string;
  invoice_id?: string;
};

const PAGE_SIZE_OPTIONS = [10, 20, 40];

const METHOD_OPTIONS: { value: MethodFilter; label: string }[] = [
  { value: 'all', label: 'All methods' },
  ...Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
    value: value as MethodFilter,
    label,
  })),
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'succeeded', label: 'Succeeded' },
];

const PaymentsPageInner: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const invoiceIdDeepLink = searchParams?.get('invoice_id') ?? '';

  const list = useBillingList<PaymentFilters>({
    defaultFilters: invoiceIdDeepLink ? { invoice_id: invoiceIdDeepLink } : {},
    defaultLimit: DEFAULT_LIST_LIMIT,
  });

  const params = list.params;
  const {
    data: paymentsResponse,
    error: paymentsError,
    isLoading: paymentsLoading,
    isValidating,
    mutate,
  } = useBillingQuery(billingKeys.payments(params), signal =>
    billingFetchers.listPayments(signal, params)
  );

  const payments = paymentsResponse?.items ?? [];
  const pagination = toPaginationProps(paymentsResponse?.meta, list);
  const statusFilter: StatusFilter = list.filters.status?.[0] ?? 'all';
  const methodFilter: MethodFilter = list.filters.method ?? 'all';

  const handleRefresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const columns = useMemo(
    () => [
      {
        key: 'receipt_number',
        label: 'Receipt',
        render: (_value: unknown, item: BillingPayment) => (
          <span className="font-medium">{item.receipt_number ?? '—'}</span>
        ),
      },
      {
        key: 'paid_at',
        label: 'Paid at',
        render: (_value: unknown, item: BillingPayment) => (
          <span className="whitespace-nowrap">
            {formatBillingDateTime(item.paid_at)}
          </span>
        ),
      },
      {
        key: 'customer',
        label: 'Customer',
        render: (_value: unknown, item: BillingPayment) => (
          <span className="text-sm">
            {item.customer?.name ?? item.customer_id ?? '—'}
          </span>
        ),
      },
      {
        key: 'invoice',
        label: 'Invoice',
        render: (_value: unknown, item: BillingPayment) =>
          item.invoice_id ? (
            <button
              onClick={() =>
                router.push(`/system/billing/invoices/${item.invoice_id}`)
              }
              className="text-left hover:text-primary hover:underline font-medium"
            >
              {item.invoice?.number ?? item.invoice_id}
            </button>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        key: 'amount',
        label: 'Amount',
        render: (_value: unknown, item: BillingPayment) => (
          <CurrencyAmount amount={item.amount} currency={item.currency} />
        ),
      },
      {
        key: 'method',
        label: 'Method',
        render: (_value: unknown, item: BillingPayment) => (
          <span>{paymentMethodLabel(item.method)}</span>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        render: (_value: unknown, item: BillingPayment) => (
          <PaymentStatusBadge status={item.status} />
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        render: (_value: unknown, item: BillingPayment) => (
          <PaymentReceiptActions payment={item} onChanged={mutate} />
        ),
      },
    ],
    [router, mutate]
  );

  return (
    <div className="space-y-6">
      <PageHeading
        title="Payments"
        subtitle="Record and manage invoice payments and receipts."
        action={
          <Button
            variant="outlined"
            Icon={AqRefreshCw05}
            iconPosition="start"
            onClick={handleRefresh}
            loading={isValidating}
          >
            Refresh
          </Button>
        }
      />

      <BillingFilterBar
        fields={[
          {
            label: 'Search',
            children: (
              <SearchField
                placeholder="Search payments…"
                value={list.searchInput}
                onChange={event => list.setSearchInput(event.target.value)}
                onClear={() => list.setSearchInput('')}
              />
            ),
          },
          {
            label: 'Method',
            children: (
              <Select
                containerClassName="!mb-0"
                value={methodFilter}
                onChange={event =>
                  list.setFilter(
                    'method',
                    event.target.value === 'all'
                      ? undefined
                      : (event.target.value as BillingPaymentMethod)
                  )
                }
              >
                {METHOD_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            ),
          },
          {
            label: 'Date range',
            children: (
              <BillingDateRange
                id="payments-range"
                showLabel={false}
                className="w-full"
                from={list.filters.from}
                to={list.filters.to}
                onChange={range => {
                  list.setFilter('from', range.from || undefined);
                  list.setFilter('to', range.to || undefined);
                }}
              />
            ),
          },
        ]}
        groups={
          <FilterGroup label="Status">
            <SegmentedTabs
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={value =>
                list.setFilter('status', value === 'all' ? undefined : [value])
              }
              ariaLabel="Filter payments by status"
            />
          </FilterGroup>
        }
      />

      {paymentsError ? (
        <ErrorState
          title="Could not load payments"
          description={getBillingErrorMessage(paymentsError)}
          retryAction={{ label: 'Try again', onClick: handleRefresh }}
        />
      ) : paymentsLoading ? (
        <LoadingState text="Loading payments..." />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<AqCreditCard01 />}
          title="No payments found"
          description="Payments recorded against invoices appear here."
        />
      ) : (
        <ServerSideTable
          data={payments as unknown as { id: string }[]}
          columns={columns}
          searchable={false}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          {...pagination}
        />
      )}
    </div>
  );
};

const PaymentsPage: React.FC = () => (
  <Suspense fallback={<LoadingState text="Loading payments..." />}>
    <PaymentsPageInner />
  </Suspense>
);

export default PaymentsPage;
