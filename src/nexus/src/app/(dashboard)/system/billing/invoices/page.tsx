'use client';

import React, { Suspense, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeading,
  SearchField,
  SegmentedTabs,
} from '@/shared/components/ui';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { AqPlus, AqRefreshCw05, AqReceipt } from '@airqo/icons-react';
import type {
  BillingInvoice,
  BillingInvoiceKind,
  BillingInvoiceStatus,
} from '@/shared/types/billing';
import {
  BillingFilterBar,
  BillingStatusBadge,
  CurrencyAmount,
  FilterGroup,
} from '@/modules/system-billing';
import {
  DEFAULT_LIST_LIMIT,
  DEFAULT_INVOICE_STATUS_ORDER,
  INVOICE_KIND_META,
  INVOICE_STATUS_META,
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
import {
  resolveInvoiceNumber,
  resolveInvoiceAmountDue,
  resolveInvoiceTotal,
  formatBillingDate,
} from '@/modules/system-billing/lib/format';
import { getBillingErrorMessage } from '@/modules/system-billing/lib/errors';

type StatusFilter = 'all' | BillingInvoiceStatus;
type KindFilter = 'all' | BillingInvoiceKind;
type InvoiceFilters = {
  status?: BillingInvoiceStatus[];
  kind?: BillingInvoiceKind;
};

const PAGE_SIZE_OPTIONS = [10, 20, 40];

const InvoicesPageInner: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusDeepLink = searchParams?.get('status') ?? '';

  const list = useBillingList<InvoiceFilters>({
    defaultFilters: statusDeepLink
      ? { status: [statusDeepLink as BillingInvoiceStatus] }
      : {},
    defaultLimit: DEFAULT_LIST_LIMIT,
  });
  const { status, kind } = list.filters;

  const statusFilter: StatusFilter = status?.[0] ?? 'all';
  const kindFilter: KindFilter = kind ?? 'all';

  const statusOptions = useMemo(
    () => [
      { value: 'all' as StatusFilter, label: 'All' },
      ...DEFAULT_INVOICE_STATUS_ORDER.filter(
        value => INVOICE_STATUS_META[value]
      ).map(value => ({
        value: value as StatusFilter,
        label: INVOICE_STATUS_META[value].label,
      })),
    ],
    []
  );

  const kindOptions = useMemo(
    () => [
      // "All types" rather than a second "All", which sat next to the status
      // group's own "All" and read as part of the same control.
      { value: 'all' as KindFilter, label: 'All types' },
      ...Object.values(INVOICE_KIND_META).map(meta => ({
        value: meta.value as KindFilter,
        label: meta.label,
      })),
    ],
    []
  );

  const params = list.params;
  const {
    data: invoicesResponse,
    error: invoicesError,
    isLoading: invoicesLoading,
    isValidating,
    mutate,
  } = useBillingQuery(billingKeys.invoices(params), signal =>
    billingFetchers.listInvoices(signal, params)
  );

  const invoices = invoicesResponse?.items ?? [];
  const pagination = toPaginationProps(invoicesResponse?.meta, list);

  const handleRefresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const columns = useMemo(
    () => [
      {
        key: 'number',
        label: 'Invoice',
        render: (_value: unknown, item: BillingInvoice) => (
          <button
            onClick={() => router.push(`/system/billing/invoices/${item.id}`)}
            className="text-left hover:text-primary hover:underline font-medium"
          >
            {resolveInvoiceNumber(item)}
          </button>
        ),
      },
      {
        key: 'customer',
        label: 'Customer',
        render: (_value: unknown, item: BillingInvoice) => (
          <span className="text-sm">{item.customer?.name ?? '—'}</span>
        ),
      },
      {
        key: 'kind',
        label: 'Kind',
        render: (_value: unknown, item: BillingInvoice) => (
          <BillingStatusBadge kind={item.kind} />
        ),
      },
      {
        key: 'issue',
        label: 'Issue',
        render: (_value: unknown, item: BillingInvoice) => (
          <span className="whitespace-nowrap">
            {formatBillingDate(item.issue_date)}
          </span>
        ),
      },
      {
        key: 'due',
        label: 'Due date',
        render: (_value: unknown, item: BillingInvoice) => (
          <span className="whitespace-nowrap">
            {formatBillingDate(item.due_date)}
          </span>
        ),
      },
      {
        key: 'total',
        label: 'Total',
        render: (_value: unknown, item: BillingInvoice) => (
          <CurrencyAmount
            amount={resolveInvoiceTotal(item)}
            currency={item.currency}
          />
        ),
      },
      {
        key: 'amount_due',
        label: 'Amount due',
        render: (_value: unknown, item: BillingInvoice) => (
          <CurrencyAmount
            amount={resolveInvoiceAmountDue(item)}
            currency={item.currency}
          />
        ),
      },
      {
        key: 'status',
        label: 'Status',
        render: (_value: unknown, item: BillingInvoice) => (
          <BillingStatusBadge status={item.status} />
        ),
      },
    ],
    [router]
  );

  const pageAction = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outlined"
        Icon={AqRefreshCw05}
        iconPosition="start"
        onClick={handleRefresh}
        loading={isValidating}
      >
        Refresh
      </Button>
      <Button
        Icon={AqPlus}
        iconPosition="start"
        path="/system/billing/invoices/new"
      >
        New invoice
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeading
        title="Invoices"
        subtitle="Manage invoices, pro formas, and track payments."
        action={pageAction}
      />

      <BillingFilterBar
        fields={[
          {
            label: 'Search',
            className: 'sm:col-span-2 lg:col-span-1',
            children: (
              <SearchField
                placeholder="Search invoices…"
                value={list.searchInput}
                onChange={event => list.setSearchInput(event.target.value)}
                onClear={() => list.setSearchInput('')}
              />
            ),
          },
        ]}
        groups={
          <>
            <FilterGroup label="Status">
              <SegmentedTabs
                options={statusOptions}
                value={statusFilter}
                onChange={value =>
                  list.setFilter(
                    'status',
                    value === 'all' ? undefined : [value]
                  )
                }
                ariaLabel="Filter invoices by status"
              />
            </FilterGroup>

            <FilterGroup label="Type">
              <SegmentedTabs
                options={kindOptions}
                value={kindFilter}
                onChange={value =>
                  list.setFilter('kind', value === 'all' ? undefined : value)
                }
                ariaLabel="Filter invoices by kind"
              />
            </FilterGroup>
          </>
        }
      />

      {invoicesError ? (
        <ErrorState
          title="Could not load invoices"
          description={getBillingErrorMessage(invoicesError)}
          retryAction={{ label: 'Try again', onClick: handleRefresh }}
        />
      ) : invoicesLoading ? (
        <LoadingState text="Loading invoices..." />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={<AqReceipt />}
          title="No invoices found"
          description="Create your first invoice to get started."
          action={{
            label: 'New invoice',
            onClick: () => router.push('/system/billing/invoices/new'),
          }}
        />
      ) : (
        <ServerSideTable
          data={invoices as unknown as { id: string }[]}
          columns={columns}
          searchable={false}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          {...pagination}
          onRowClick={item =>
            router.push(
              `/system/billing/invoices/${(item as BillingInvoice).id}`
            )
          }
        />
      )}
    </div>
  );
};

const InvoicesPage: React.FC = () => (
  <Suspense fallback={<LoadingState text="Loading invoices..." />}>
    <InvoicesPageInner />
  </Suspense>
);

export default InvoicesPage;
