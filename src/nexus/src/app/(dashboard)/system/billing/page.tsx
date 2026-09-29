'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  EmptyState,
  LoadingState,
  PageHeading,
} from '@/shared/components/ui';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import {
  AqPlus,
  AqReceipt,
  AqSettings01,
  AqRefreshCw05,
} from '@airqo/icons-react';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { BillingDateRange, SummaryTiles } from '@/modules/system-billing';
import { BillingStatusBadge, CurrencyAmount } from '@/modules/system-billing';
import { DEFAULT_LIST_LIMIT } from '@/modules/system-billing/constants';
import {
  billingKeys,
  billingFetchers,
  useBillingMutate,
} from '@/modules/system-billing/lib/queries';
import {
  useBillingAction,
  useBillingQuery,
} from '@/modules/system-billing/lib/hooks';
import { getBillingErrorMessage } from '@/modules/system-billing/lib/errors';
import {
  resolveInvoiceNumber,
  formatBillingDate,
} from '@/modules/system-billing/lib/format';
import type { BillingInvoice } from '@/shared/types/billing';

const currentMonthFrom = () => format(startOfMonth(new Date()), 'yyyy-MM-dd');
const currentMonthTo = () => format(endOfMonth(new Date()), 'yyyy-MM-dd');

const BillingDashboard: React.FC = () => {
  const router = useRouter();
  const [from, setFrom] = useState(currentMonthFrom());
  const [to, setTo] = useState(currentMonthTo());
  const [currency, setCurrency] = useState('USD');

  const {
    data: summary,
    error: summaryError,
    isLoading: summaryLoading,
    mutate: mutateSummary,
  } = useBillingQuery(
    billingKeys.summary(from || undefined, to || undefined),
    signal =>
      billingFetchers.getSummary(signal, from || undefined, to || undefined)
  );

  const {
    data: overdueData,
    error: overdueError,
    isLoading: overdueLoading,
    mutate: mutateOverdue,
  } = useBillingQuery(
    billingKeys.invoices({
      status: ['overdue'],
      kind: 'invoice',
      limit: DEFAULT_LIST_LIMIT,
    }),
    signal =>
      billingFetchers.listInvoices(signal, {
        status: ['overdue'],
        kind: 'invoice',
        limit: DEFAULT_LIST_LIMIT,
      })
  );

  const overdueInvoices = overdueData?.items ?? [];

  const revalidateAll = useBillingMutate();
  const { run } = useBillingAction();

  const handleRefresh = useCallback(
    () =>
      run(
        'refresh',
        async () => {
          await revalidateAll();
          await Promise.all([mutateSummary(), mutateOverdue()]);
        },
        { success: 'Billing refreshed' }
      ),
    [run, revalidateAll, mutateSummary, mutateOverdue]
  );

  const overdueColumns = useMemo(
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
        render: (_value: unknown, item: BillingInvoice) =>
          item.customer?.name ?? item.customer_id ?? '—',
      },
      {
        key: 'issue_date',
        label: 'Issue date',
        render: (_value: unknown, item: BillingInvoice) => (
          <span className="whitespace-nowrap">
            {formatBillingDate(item.issue_date)}
          </span>
        ),
      },
      {
        key: 'due_date',
        label: 'Due date',
        render: (_value: unknown, item: BillingInvoice) => (
          <span className="whitespace-nowrap">
            {formatBillingDate(item.due_date)}
          </span>
        ),
      },
      {
        key: 'amount_due',
        label: 'Amount due',
        render: (_value: unknown, item: BillingInvoice) => (
          <CurrencyAmount
            amount={item.amount_due ?? item.balance_due ?? item.balance}
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

  const quickActions = (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="filled"
        Icon={AqPlus}
        iconPosition="start"
        onClick={() => router.push('/system/billing/invoices/new')}
      >
        New invoice
      </Button>
      <Button
        variant="outlined"
        Icon={AqReceipt}
        iconPosition="start"
        onClick={() => router.push('/system/billing/customers')}
      >
        New customer
      </Button>
      <Button
        variant="outlined"
        Icon={AqSettings01}
        iconPosition="start"
        onClick={() => router.push('/system/billing/settings')}
      >
        Settings
      </Button>
      <Button
        variant="outlined"
        Icon={AqRefreshCw05}
        iconPosition="start"
        onClick={handleRefresh}
        loading={summaryLoading}
      >
        Refresh
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeading
        title="Billing"
        subtitle="Track outstanding invoices, revenue, and customer balances across your currencies."
        action={quickActions}
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <BillingDateRange
            id="billing-range"
            from={from}
            to={to}
            onChange={range => {
              setFrom(range.from);
              setTo(range.to);
            }}
          />
        </div>
      </Card>

      {summaryError ? (
        <Card className="p-6">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-destructive">
              {getBillingErrorMessage(summaryError)}
            </p>
            <div>
              <Button
                variant="outlined"
                Icon={AqRefreshCw05}
                onClick={handleRefresh}
              >
                Retry
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <SummaryTiles
          summary={summary}
          isLoading={summaryLoading}
          currency={currency}
          onCurrencyChange={setCurrency}
        />
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">
            Overdue invoices
          </h2>
          <Link
            href="/system/billing/invoices?status=overdue"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {overdueLoading ? (
          <LoadingState text="Loading overdue invoices..." />
        ) : overdueError ? (
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">
              {getBillingErrorMessage(overdueError)}
            </p>
          </Card>
        ) : overdueInvoices.length === 0 ? (
          <EmptyState
            title="No overdue invoices"
            description="All caught up. Overdue invoices will appear here."
          />
        ) : (
          <ServerSideTable
            data={overdueInvoices as unknown as { id: string }[]}
            columns={overdueColumns}
            searchable={false}
          />
        )}
      </div>
    </div>
  );
};

export default BillingDashboard;
