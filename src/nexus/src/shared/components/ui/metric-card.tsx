import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Card } from './card';

export interface MetricCardProps {
  /** Short label shown above the value (e.g. "Total calls"). */
  label: string;
  /** The metric value. Formatted by the caller. */
  value: React.ReactNode;
  /** Optional supporting line under the value (subtitle, badge, delta…). */
  hint?: React.ReactNode;
  /** Tailwind size for the value. Defaults to `text-2xl`; use a smaller size for text values. */
  valueClassName?: string;
  className?: string;
}

/**
 * Compact KPI card used by the analytics/admin dashboards (platform usage,
 * API key usage, …). Numbers always use `tabular-nums` so columns of metrics
 * line up, and the value size is overridable for non-numeric values such as a
 * datetime or a service name.
 */
const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  hint,
  valueClassName = 'text-2xl',
  className,
}) => (
  <Card className={cn('space-y-1 p-4', className)}>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className={cn(valueClassName, 'font-bold tabular-nums')}>{value}</p>
    {hint}
  </Card>
);

export { MetricCard };
