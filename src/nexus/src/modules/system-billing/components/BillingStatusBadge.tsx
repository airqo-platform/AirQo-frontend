import React from 'react';
import { cn } from '@/shared/lib/utils';
import {
  CUSTOMER_STATUS_META,
  INVOICE_KIND_META,
  INVOICE_STATUS_META,
  PAYMENT_STATUS_META,
} from '../constants';
import type {
  BillingInvoiceKind,
  BillingInvoiceStatus,
} from '@/shared/types/billing';

const PILL_BASE =
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
const NEUTRAL_PILL =
  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';

const Pill: React.FC<{
  color?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ color, className, children }) => (
  <span className={cn(PILL_BASE, color ?? NEUTRAL_PILL, className)}>
    {children}
  </span>
);

interface BillingStatusBadgeProps {
  status?: BillingInvoiceStatus | string | null;
  kind?: BillingInvoiceKind | null;
  className?: string;
}

const BillingStatusBadge: React.FC<BillingStatusBadgeProps> = ({
  status,
  kind,
  className,
}) => {
  const statusMeta =
    status && status in INVOICE_STATUS_META
      ? INVOICE_STATUS_META[status as BillingInvoiceStatus]
      : null;
  const kindMeta = kind ? INVOICE_KIND_META[kind] : null;

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      {kindMeta && <Pill color={kindMeta.color}>{kindMeta.label}</Pill>}
      {status ? (
        <Pill color={statusMeta?.color}>{statusMeta?.label ?? status}</Pill>
      ) : null}
    </span>
  );
};

export default BillingStatusBadge;

export const CustomerStatusBadge: React.FC<{
  status?: string | null;
  className?: string;
}> = ({ status, className }) => {
  const meta = status
    ? CUSTOMER_STATUS_META[status as 'active' | 'archived']
    : null;
  return (
    <Pill className={className} color={meta?.color}>
      {meta?.label ?? status ?? '—'}
    </Pill>
  );
};

/**
 * Payment statuses are only documented as `succeeded`; anything else renders as
 * a neutral pill with the raw value rather than an invented label.
 */
export const PaymentStatusBadge: React.FC<{
  status?: string | null;
  className?: string;
}> = ({ status, className }) => {
  const value = status ?? 'succeeded';
  return (
    <Pill className={className} color={PAYMENT_STATUS_META[value]?.color}>
      {PAYMENT_STATUS_META[value]?.label ?? value}
    </Pill>
  );
};
