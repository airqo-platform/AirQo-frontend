import React from 'react';
import { useRouter } from 'next/navigation';
import { useShippingBatches } from '@/core/hooks/useDevices';
import { format } from 'date-fns';
import { ShippingBatch } from '@/app/types/devices';
import ReusableTable, { TableColumn } from '@/components/shared/table/ReusableTable';

const ShippingBatchesTable: React.FC = () => {
    const router = useRouter();
    const { data, isLoading, error } = useShippingBatches();

    const columns: TableColumn<ShippingBatch & { id: string }>[] = [
        {
            key: 'batch_name',
            label: 'Batch Name',
            render: (value) => (
                <span className="font-medium text-gray-900 dark:text-white">
                    {value as string || 'Unnamed Batch'}
                </span>
            )
        },
        {
            key: 'device_count',
            label: 'Device Count',
            render: (value) => (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                    {value as number} devices
                </span>
            )
        },
        {
            key: 'createdAt',
            label: 'Created Date',
            render: (value) => (
                <span className="text-gray-500 dark:text-gray-400">
                    {format(new Date(value as string), 'MMM dd, yyyy HH:mm')}
                </span>
            )
        },
        {
            key: 'actions' as keyof (ShippingBatch & { id: string }),
            label: 'Actions',
            render: (_, item) => (
                <button
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/shipping/${item._id}`);
                    }}
                >
                    View Details
                </button>
            )
        }
    ];

    if (error) {
        return (
            <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                Error loading batches: {error.message}
            </div>
        );
    }

    const batches = (data?.batches || []).map(batch => ({
        ...batch,
        id: batch._id
    }));

    return (
        <ReusableTable
            title="Shipping Batches"
            data={batches}
            columns={columns as any}
            loading={isLoading}
            emptyState={
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No shipping batches found. Create a new batch by preparing devices for shipping.
                </div>
            }
            onRowClick={(batch) => router.push(`/admin/shipping/${batch._id}`)}
            searchableColumns={['batch_name']}
        />
    );
};

export default ShippingBatchesTable;
