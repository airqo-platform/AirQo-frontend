'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { formatDate } from '@/shared/utils';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { subscriptionService } from '@/shared/services/subscriptionService';
import type { Transaction } from '@/shared/types/api';

type TransactionTableItem = Transaction & { [key: string]: unknown };

const statusColor: Record<string, string> = {
  completed:
    'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-200',
  pending:
    'text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-200',
  failed: 'text-rose-700 bg-rose-100 dark:bg-rose-900/40 dark:text-rose-200',
  refunded: 'text-blue-700 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-200',
};

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionTableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await subscriptionService.getTransactionHistory({
        page: 1,
        limit: 100,
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to load transactions');
      }

      const items = response.transactions || response.data || [];
      setTransactions(items as TransactionTableItem[]);
    } catch (err) {
      setTransactions([]);
      setError(getUserFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const columns = useMemo(
    () => [
      {
        key: 'date',
        label: 'Date',
        sortable: true,
        render: (value: unknown, item: Transaction) =>
          formatDate(item.date, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
      },
      {
        key: 'reference',
        label: 'Reference',
        sortable: true,
        render: (value: unknown, item: Transaction) =>
          item.reference || item.id,
      },
      {
        key: 'description',
        label: 'Description',
        render: (value: unknown, item: Transaction) => item.description,
      },
      {
        key: 'amount',
        label: 'Amount',
        sortable: true,
        render: (value: unknown, item: Transaction) =>
          `${item.currency} ${item.amount.toFixed(2)}`,
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value: unknown, item: Transaction) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[item.status] || statusColor.pending}`}
          >
            {item.status.replace('_', ' ')}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <ServerSideTable
      data={transactions}
      columns={columns}
      loading={loading}
      error={error}
      onRefresh={() => {
        void loadTransactions();
      }}
      title="Transaction History"
      showClientPagination={true}
      className="border rounded-lg"
    />
  );
};

export default TransactionHistory;
