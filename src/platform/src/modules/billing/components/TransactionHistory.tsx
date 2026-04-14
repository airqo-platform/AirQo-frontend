'use client';

import React, { useMemo } from 'react';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { formatDate } from '@/shared/utils';
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

const SERVICE_UNAVAILABLE_MESSAGE = 'Service not available';

const TransactionHistory: React.FC = () => {
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
      data={[] as TransactionTableItem[]}
      columns={columns}
      loading={false}
      error={SERVICE_UNAVAILABLE_MESSAGE}
      title="Transaction History"
      showClientPagination={true}
      className="border rounded-lg"
    />
  );
};

export default TransactionHistory;
