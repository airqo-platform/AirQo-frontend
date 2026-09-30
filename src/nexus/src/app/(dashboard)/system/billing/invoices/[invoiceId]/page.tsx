'use client';

import React, { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, LoadingState, PageHeading } from '@/shared/components/ui';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { AqArrowLeft } from '@airqo/icons-react';
import { ErrorState } from '@/shared/components/ui';
import type { BillingPayment } from '@/shared/types/billing';
import {
  BillingStatusBadge,
  CurrencyAmount,
  InvoiceActions,
  PaymentReceiptActions,
  PaymentStatusBadge,
} from '@/modules/system-billing';
import {
  billingKeys,
  billingFetchers,
} from '@/modules/system-billing/lib/queries';
import { useBillingQuery } from '@/modules/system-billing/lib/hooks';
import { getBillingErrorMessage } from '@/modules/system-billing/lib/errors';
import {
  formatMoney,
  formatBillingDate,
  formatBillingDateTime,
  resolveInvoiceNumber,
  resolveInvoiceTotal,
  resolveInvoiceAmountDue,
  resolveInvoiceAmountPaid,
  resolveInvoiceSubtotal,
  resolveInvoiceTaxAmount,
  resolveInvoiceDiscountAmount,
  paymentMethodLabel,
} from '@/modules/system-billing/lib/format';

const InvoiceDetailPage: React.FC = () => {
  const params = useParams();
  const invoiceId = String(params?.invoiceId ?? '');

  const {
    data: invoice,
    error: invoiceError,
    isLoading: invoiceLoading,
    mutate,
  } = useBillingQuery(billingKeys.invoice(invoiceId), signal =>
    billingFetchers.getInvoice(signal, invoiceId)
  );

  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const payments = invoice?.payments ?? [];
  const activity = invoice?.activity ?? [];

  const paymentsColumns = useMemo(
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
        key: 'method',
        label: 'Method',
        render: (_value: unknown, item: BillingPayment) => (
          <span>{paymentMethodLabel(item.method)}</span>
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
    [mutate]
  );

  if (invoiceLoading) {
    return (
      <div className="space-y-6">
        <LoadingState text="Loading invoice..." />
      </div>
    );
  }

  if (invoiceError) {
    return (
      <div className="space-y-6">
        <ErrorState
          title="Failed to load invoice"
          description={getBillingErrorMessage(invoiceError)}
          retryAction={{ label: 'Retry', onClick: refresh }}
        />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <ErrorState
          title="Invoice not found"
          description="This invoice may have been deleted or does not exist."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/system/billing/invoices"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <AqArrowLeft className="w-4 h-4" />
        Back to invoices
      </Link>

      <PageHeading
        title={resolveInvoiceNumber(invoice)}
        subtitle={`Created ${formatBillingDateTime(invoice.created_at)}`}
        action={<InvoiceActions invoice={invoice} onRefresh={refresh} />}
      />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Customer</h2>
          {invoice.customer && typeof invoice.customer === 'object' && (
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Name</dt>
                <dd>{invoice.customer.name ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Emails</dt>
                <dd>
                  {Array.isArray(invoice.customer.billing_emails)
                    ? invoice.customer.billing_emails.join(', ') || '—'
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd>{invoice.customer.phone ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Country</dt>
                <dd>{invoice.customer.country ?? '—'}</dd>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kind</span>
              <BillingStatusBadge kind={invoice.kind} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <BillingStatusBadge status={invoice.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Issue date</span>
              <span>{formatBillingDate(invoice.issue_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due date</span>
              <span>{formatBillingDate(invoice.due_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment terms</span>
              <span>{invoice.payment_terms_days ?? 0} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Currency</span>
              <span>{invoice.currency ?? 'USD'}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-foreground mb-3">Amounts</h2>
        <dl className="space-y-2 text-sm max-w-sm ml-auto">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">
              <CurrencyAmount
                amount={resolveInvoiceSubtotal(invoice)}
                currency={invoice.currency}
              />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Discount</dt>
            <dd className="tabular-nums">
              −
              <CurrencyAmount
                amount={resolveInvoiceDiscountAmount(invoice)}
                currency={invoice.currency}
              />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tax</dt>
            <dd className="tabular-nums">
              <CurrencyAmount
                amount={resolveInvoiceTaxAmount(invoice)}
                currency={invoice.currency}
              />
            </dd>
          </div>
          <div className="flex justify-between border-t pt-2">
            <dt className="font-semibold">Total</dt>
            <dd className="tabular-nums font-semibold">
              <CurrencyAmount
                amount={resolveInvoiceTotal(invoice)}
                currency={invoice.currency}
              />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Paid</dt>
            <dd className="tabular-nums">
              <CurrencyAmount
                amount={resolveInvoiceAmountPaid(invoice)}
                currency={invoice.currency}
              />
            </dd>
          </div>
          <div className="flex justify-between border-t pt-2">
            <dt className="font-semibold">Amount due</dt>
            <dd className="tabular-nums font-semibold">
              <CurrencyAmount
                amount={resolveInvoiceAmountDue(invoice)}
                currency={invoice.currency}
              />
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="p-5 overflow-x-auto">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Line items
        </h2>
        {!invoice.line_items || invoice.line_items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No line items.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wide">
                <th className="py-2 pr-4">Item</th>
                <th className="py-2 pr-4">Description</th>
                <th className="py-2 pr-4 text-right">Qty</th>
                <th className="py-2 pr-4 text-right">Unit price</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.line_items.map((item, idx) => (
                <tr key={idx} className="border-b border-border/50">
                  <td className="py-2 pr-4">{item.item ?? '—'}</td>
                  <td className="py-2 pr-4">{item.description ?? '—'}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums">
                    {formatMoney(item.unit_price, invoice.currency)}
                  </td>
                  <td className="py-2 text-right tabular-nums font-medium">
                    {formatMoney(
                      (item.quantity ?? 0) * (item.unit_price ?? 0),
                      invoice.currency
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Payments</h2>
        {payments.length === 0 ? (
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">
              No payments recorded.
            </p>
          </Card>
        ) : (
          <ServerSideTable
            data={payments as unknown as { id: string }[]}
            columns={paymentsColumns}
            currentPage={1}
            totalPages={1}
            pageSize={payments.length}
            totalItems={payments.length}
            onPageChange={() => undefined}
            onPageSizeChange={() => undefined}
            pageSizeOptions={[payments.length]}
          />
        )}
      </div>

      {activity.length > 0 && (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Activity
          </h2>
          <ul className="space-y-2">
            {activity.map((entry, idx) => (
              <li key={idx} className="text-sm flex gap-3">
                <span className="text-muted-foreground whitespace-nowrap">
                  {formatBillingDateTime(entry.at ?? entry.created_at)}
                </span>
                <span className="text-foreground">
                  {entry.type ?? entry.message ?? '—'}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default InvoiceDetailPage;
