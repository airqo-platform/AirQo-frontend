'use client';

import React from 'react';
import { Card } from '@/shared/components/ui';

export interface UsageMetricCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  valueClassName?: string;
}

/** Small, consistent KPI card shared by platform and user usage views. */
const UsageMetricCard: React.FC<UsageMetricCardProps> = ({
  label,
  value,
  hint,
  valueClassName = 'text-2xl',
}) => (
  <Card className="space-y-1 p-4">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className={`${valueClassName} font-bold tabular-nums`}>{value}</p>
    {hint}
  </Card>
);

export default UsageMetricCard;
