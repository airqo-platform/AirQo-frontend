"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useShippingBatchDetails } from '@/core/hooks/useDevices';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import ReusableTable, { TableColumn } from '@/components/shared/table/ReusableTable';
import { Device } from '@/app/types/devices';
import { Skeleton } from "@/components/ui/skeleton";
import ReusableButton from '@/components/shared/button/ReusableButton';
import { AqArrowLeft } from '@airqo/icons-react';
import { useGenerateShippingLabels } from '@/core/hooks/useDevices';
import ReusableToast from '@/components/shared/toast/ReusableToast';
import ShippingLabelPrintModal from '@/components/features/shipping/ShippingLabelPrintModal';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

const BatchDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const batchId = params.batchId as string;
    const { data, isLoading, error } = useShippingBatchDetails(batchId);
    const { mutate: generateLabels, isPending: isGenerating, data: labelsData } = useGenerateShippingLabels();
    const [showLabelModal, setShowLabelModal] = useState(false);

    const handleGenerateLabels = useCallback((ids: (string | number)[]) => {
        const selectedDeviceNames = (data?.batch?.devices || [])
            .filter(device => ids.includes(device._id || device.name))
            .map(device => device.name);

        generateLabels(selectedDeviceNames, {
            onSuccess: (data) => {
                if (data.success) {
                    ReusableToast({
                        message: `Successfully generated ${data.shipping_labels.labels.length} shipping label(s)`,
                        type: 'SUCCESS',
                    });

                    setShowLabelModal(true);
                }
            }
        });
    }, [generateLabels, data?.batch?.devices]);

    const handleGenerateAllLabels = useCallback(() => {
        const allDeviceNames = (data?.batch?.devices || [])
            .map(device => device.name);

        if (allDeviceNames.length === 0) {
            ReusableToast({
                message: 'No devices found in this batch',
                type: 'ERROR',
            });
            return;
        }

        generateLabels(allDeviceNames, {
            onSuccess: (data) => {
                if (data.success) {
                    ReusableToast({
                        message: `Successfully generated ${data.shipping_labels.labels.length} shipping label(s)`,
                        type: 'SUCCESS',
                    });

                    setShowLabelModal(true);
                }
            }
        });
    }, [generateLabels, data?.batch?.devices]);

    const handleCloseModal = useCallback(() => {
        setShowLabelModal(false);
        queryClient.invalidateQueries({ queryKey: ['shippingBatchDetails', batchId] });
    }, [queryClient, batchId]);

    const actions = [
        {
            label: isGenerating ? 'Generating...' : 'Generate Labels',
            value: 'generate_labels',
            handler: handleGenerateLabels
        }
    ];

    const columns: TableColumn<Device>[] = [
        {
            key: 'name',
            label: 'Device Name',
            render: (value) => <span className="font-medium text-gray-900 dark:text-white">{value as string}</span>
        },
        {
            key: 'claim_token',
            label: 'Claim Token',
            render: (value) => <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{(value as string | null) || '-'}</span>
        },
        {
            key: 'claim_status',
            label: 'Status',
            render: (value) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(value as string) === 'claimed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                    {value ? (value as string).charAt(0).toUpperCase() + (value as string).slice(1) : 'Unknown'}
                </span>
            )
        },
        {
            key: 'createdAt',
            label: 'Created At',
            render: (value) => {
                const date = value ? new Date(value as string) : null;
                return <span className="text-gray-500 dark:text-gray-400">
                    {date && !isNaN(date.getTime()) ? format(date, 'MMM dd, yyyy HH:mm') : '-'}
                </span>;
            }
        },
    ];

    if (!isLoading && (error || !data?.batch)) {
        return (
            <div className="p-6">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                    Error loading batch details: {error?.message || 'Batch not found'}
                </div>
                <button
                    onClick={() => router.back()}
                    className="mt-4 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Shipping
                </button>
            </div>
        );
    }

    const batch = data?.batch;

    const tableData = (batch?.devices || []).map(device => ({
        ...device,
        id: device._id || device.name
    }));

    return (
        <div className='space-y-4'>
            {/* Header */}
            <ReusableButton variant="text" onClick={() => router.back()} Icon={AqArrowLeft}>
                Back
            </ReusableButton>
            <div className="flex items-center gap-4">
                <div>
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {batch?.batch_name || 'Unnamed Batch'}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Batch ID: <span className="font-mono">{batch?._id}</span>
                            </p>
                        </>
                    )}
                </div>
                {!isLoading && (
                    <div className="ml-auto">
                        <ReusableButton
                            onClick={handleGenerateAllLabels}
                            disabled={isGenerating}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isGenerating ? 'Generating...' : 'Generate Labels'}
                        </ReusableButton>
                    </div>
                )}
            </div>

            {/* Devices Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <ReusableTable
                    title="Devices in Batch"
                    data={tableData}
                    columns={columns as any}
                    searchableColumns={['name', 'long_name']}
                    loading={isLoading}
                    multiSelect
                    actions={actions}
                    isRowSelectable={(device) => device.claim_status !== 'claimed'}
                />
            </div>

            {/* Label Print Modal */}
            {labelsData?.success && (
                <ShippingLabelPrintModal
                    labels={labelsData.shipping_labels.labels}
                    isOpen={showLabelModal}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default BatchDetailsPage;
