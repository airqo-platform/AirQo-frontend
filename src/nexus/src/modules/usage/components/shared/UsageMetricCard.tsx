'use client';

import React from 'react';
import { MetricCard } from '@/shared/components/ui';

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
  <MetricCard
    label={label}
    value={value}
    hint={hint}
    valueClassName={valueClassName}
  />
);

export default UsageMetricCard;
