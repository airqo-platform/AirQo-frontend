'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeading,
} from '@/shared/components/ui';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { AqArrowLeft, AqEdit05, AqPlus } from '@airqo/icons-react';
import type { BillingInvoice } from '@/shared/types/billing';
import {
  BillingStatusBadge,
  CurrencyAmount,
  CustomerFormDialog,
} from '@/modules/system-billing';
import {
  CUSTOMER_PAGE_SIZE_OPTIONS,
  DEFAULT_LIST_LIMIT,
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
  resolveInvoiceNumber,
  resolveInvoiceAmountDue,
  resolveInvoiceTotal,
  formatBillingDate,
  formatMoney,
} from '@/modules/system-billing/lib/format';
import { useRouter } from 'next/navigation';

const CustomerDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const customerId = String(params?.customerId ?? '');

  const list = useBillingList<{ customer_id: string }>({
    defaultFilters: { customer_id: customerId },
    defaultLimit: DEFAULT_LIST_LIMIT,
  });
  const [formOpen, setFormOpen] = useState(false);

  const {
    data: customer,
    error: customerError,
    isLoading: customerLoading,
    mutate: mutateCustomer,
  } = useBillingQuery(billingKeys.customer(customerId), signal =>
    billingFetchers.getCustomer(signal, customerId)
  );

  const {
    data: invoicesResponse,
    error: invoicesError,
    isLoading: invoicesLoading,
  } = useBillingQuery(billingKeys.invoices(list.params), signal =>
    billingFetchers.listInvoices(signal, list.params)
  );

  const invoices = invoicesResponse?.items ?? [];
  const pagination = toPaginationProps(invoicesResponse?.meta, list);

  const handleEdit = useCallback(() => {
    setFormOpen(true);
  }, []);

  const invoicesColumns = useMemo(
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
        key: 'kind',
        label: 'Kind',
        render: (_value: unknown, item: BillingInvoice) => (
          <BillingStatusBadge kind={item.kind} />
        ),
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
        label: 'Due',
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

  return (
    <div className="space-y-6">
      <Link
        href="/system/billing/customers"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <AqArrowLeft className="w-4 h-4" />
        Back to customers
      </Link>

      {customerLoading ? (
        <LoadingState text="Loading customer..." />
      ) : customerError ? (
        <Card className="p-6">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-destructive">
              {getBillingErrorMessage(customerError)}
            </p>
            <div>
              <Button variant="outlined" onClick={() => mutateCustomer()}>
                Try again
              </Button>
            </div>
          </div>
        </Card>
      ) : !customer ? (
        <EmptyState title="Customer not found" />
      ) : (
        <>
          <PageHeading
            title={customer.name ?? 'Customer'}
            subtitle={`ID: ${customer.id}`}
            action={
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outlined"
                  Icon={AqEdit05}
                  iconPosition="start"
                  onClick={handleEdit}
                >
                  Edit
                </Button>
                <Button
                  Icon={AqPlus}
                  iconPosition="start"
                  onClick={() =>
                    router.push(
                      `/system/billing/invoices/new?customer_id=${customer.id}`
                    )
                  }
                >
                  New invoice
                </Button>
              </div>
            }
          />

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Contact details
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Contact name" value={customer.contact_name} />
                <Field label="Phone" value={customer.phone} />
                <Field label="Country" value={customer.country} />
                <Field label="Tax ID" value={customer.tax_id} />
                <Field label="Currency" value={customer.currency} />
                <Field
                  label="Status"
                  value={customer.status === 'archived' ? 'Archived' : 'Active'}
                />
              </div>
              <Field
                label="Billing emails"
                value={
                  Array.isArray(customer.billing_emails)
                    ? customer.billing_emails.join(', ')
                    : customer.billing_emails
                }
              />
              <Field
                label="Address"
                value={
                  Array.isArray(customer.address_lines)
                    ? customer.address_lines.join('\n')
                    : customer.address_lines
                }
              />
            </Card>

            <Card className="p-5 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Balances
              </h2>
              <div>
                <p className="text-sm text-muted-foreground">
                  Outstanding balance
                </p>
                <p className="text-xl font-bold tabular-nums">
                  {typeof customer.outstanding_balance === 'number'
                    ? formatMoney(
                        customer.outstanding_balance,
                        customer.currency
                      )
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Invoices</p>
                <p className="text-lg font-semibold">
                  {customer.invoice_count ?? 0}
                </p>
              </div>
            </Card>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Invoices
            </h2>
            {invoicesLoading ? (
              <LoadingState text="Loading invoices..." />
            ) : invoicesError ? (
              <ErrorState
                compact
                title="Could not load invoices"
                description={getBillingErrorMessage(invoicesError)}
              />
            ) : invoices.length === 0 ? (
              <EmptyState
                title="No invoices yet"
                description="Create the first invoice for this customer."
              />
            ) : (
              <ServerSideTable
                data={invoices as unknown as { id: string }[]}
                columns={invoicesColumns}
                searchable={false}
                pageSizeOptions={CUSTOMER_PAGE_SIZE_OPTIONS}
                {...pagination}
              />
            )}
          </div>

          <CustomerFormDialog
            isOpen={formOpen}
            onClose={() => setFormOpen(false)}
            onSuccess={() => {
              setFormOpen(false);
              mutateCustomer();
            }}
            customer={customer}
          />
        </>
      )}
    </div>
  );
};

const Field: React.FC<{ label: string; value?: string | null }> = ({
  label,
  value,
}) => (
  <div>
    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
      {label}
    </dt>
    <dd className="mt-1 text-sm text-foreground whitespace-pre-wrap">
      {value ?? '—'}
    </dd>
  </div>
);

export default CustomerDetailPage;
