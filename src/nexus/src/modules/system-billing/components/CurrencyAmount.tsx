import React from 'react';
import { cn } from '@/shared/lib/utils';
import { formatMoney } from '../lib/format';

interface CurrencyAmountProps {
  amount?: number | null;
  currency?: string | null;
  className?: string;
}

const CurrencyAmount: React.FC<CurrencyAmountProps> = ({
  amount,
  currency,
  className,
}) => {
  return (
    <span className={cn('tabular-nums', className)}>
      {formatMoney(amount, currency)}
    </span>
  );
};

export default CurrencyAmount;
