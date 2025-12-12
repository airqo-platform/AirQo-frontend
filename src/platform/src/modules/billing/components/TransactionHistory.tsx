'use client';

import React, { useState, useEffect } from 'react';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { Button } from '@/shared/components/ui';
import { formatDate } from '@/shared/utils';
import { AqDownload01 } from '@airqo/icons-react';
import type {
  Transaction,
  TransactionHistoryResponse,
} from '@/shared/types/api';

type TransactionTableItem = Transaction & { [key: string]: unknown };

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/payments');
        const data: TransactionHistoryResponse = await response.json();
        if (data.success) {
          setTransactions(data.transactions);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to load transaction history');
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'refunded':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const columns = [
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
      key: 'description',
      label: 'Description',
      sortable: true,
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value: unknown, item: Transaction) =>
        `${item.currency} ${item.amount.toFixed(2)}`,
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      render: (value: unknown, item: Transaction) => item.paymentMethod,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: unknown, item: Transaction) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      ),
    },
    {
      key: 'reference',
      label: 'Reference',
      render: (value: unknown, item: Transaction) => item.reference,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: unknown, item: Transaction) => (
        <Button
          size="sm"
          variant="ghost"
          Icon={AqDownload01}
          onClick={() => handleDownloadReceipt(item)}
          className="p-1 h-6 w-6"
          aria-label="Download receipt"
        />
      ),
    },
  ];

  const handleDownloadReceipt = (transaction: Transaction) => {
    // In a real implementation, this would download the actual receipt
    // For now, just show a message
    alert(`Downloading receipt for transaction ${transaction.reference}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Payment history</h3>
        <Button
          size="sm"
          variant="outlined"
          Icon={AqDownload01}
          onClick={() => window.print()}
        >
          Download all
        </Button>
      </div>

      <ServerSideTable
        data={transactions as TransactionTableItem[]}
        columns={columns}
        loading={loading}
        error={error}
        title=""
        showClientPagination={true}
        className="border rounded-lg"
      />
    </div>
  );
};

export default TransactionHistory;
