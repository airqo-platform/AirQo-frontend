"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useShippingBatchDetails } from '@/core/hooks/useDevices';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import ReusableTable, { TableColumn } from '@/components/shared/table/ReusableTable';
import { ShippingStatusDevice } from '@/app/types/devices';
import { Skeleton } from "@/components/ui/skeleton";
import ReusableButton from '@/components/shared/button/ReusableButton';
import { AqArrowLeft } from '@airqo/icons-react';
import { useGenerateShippingLabels } from '@/core/hooks/useDevices';
import ReusableToast from '@/components/shared/toast/ReusableToast';
import ShippingLabelPrintModal from '@/components/features/shipping/ShippingLabelPrintModal';
import { ExportFormatModal } from '@/components/features/shipping/ExportFormatModal';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

type BatchDevice = ShippingStatusDevice & {
    id: string | number;
    createdAt?: string;
    [key: string]: unknown;
};

const BatchDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const batchId = params.batchId as string;
    const { data, isLoading, error } = useShippingBatchDetails(batchId);
    const { mutate: generateLabels, isPending: isGenerating, data: labelsData } = useGenerateShippingLabels();
    const [showLabelModal, setShowLabelModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedDevices, setSelectedDevices] = useState<BatchDevice[]>([]);

    const handleGenerateLabels = useCallback((ids: (string | number)[]) => {
        if (!ids || ids.length === 0) {
            ReusableToast({
                message: 'Please select at least one device',
                type: 'ERROR',
            });
            return;
        }

        const selectedDeviceNames = (data?.batch?.devices || [])
            .filter(device => ids.includes(device._id || device.name))
            .map(device => device.name)
            .filter(name => name && name.trim().length > 0);

        if (selectedDeviceNames.length === 0) {
            ReusableToast({
                message: 'Selected devices have no valid names',
                type: 'ERROR',
            });
            return;
        }

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
            .filter(device => device.claim_status !== 'claimed')
            .map(device => device.name)
            .filter(name => name && name.trim().length > 0);

        if (allDeviceNames.length === 0) {
            ReusableToast({
                message: 'No unclaimed devices found with valid names in this batch',
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

    const handleExportClick = useCallback((ids: (string | number)[]) => {
        if (!ids || ids.length === 0) {
            ReusableToast({
                message: 'Please select at least one device to export',
                type: 'ERROR',
            });
            return;
        }

        const selected = (data?.batch?.devices || [])
            .filter(device => ids.includes(device._id || device.name));

        setSelectedDevices(selected as BatchDevice[]);
        setShowExportModal(true);
    }, [data?.batch?.devices]);

    const handleExport = useCallback(async (format: 'csv' | 'xlsx') => {
        if (selectedDevices.length === 0) return;

        const exportData = selectedDevices.map(device => ({
            'Device Name': device.name,
            'Claim Token': device.claim_token || 'N/A',
        }));

        const batchName = data?.batch?.batch_name || 'batch';
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${batchName}_devices_${timestamp}`;

        try {
            if (format === 'csv') {
                const Papa = (await import('papaparse')).default;
                const csv = Papa.unparse(exportData);
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${filename}.csv`;
                link.click();
                URL.revokeObjectURL(link.href);
            } else {
                const XLSX = await import('xlsx');
                const worksheet = XLSX.utils.json_to_sheet(exportData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Devices');
                XLSX.writeFile(workbook, `${filename}.xlsx`);
            }

            ReusableToast({
                message: `Successfully exported ${selectedDevices.length} device${selectedDevices.length !== 1 ? 's' : ''} as ${format.toUpperCase()}`,
                type: 'SUCCESS',
            });
        } catch (error) {
            ReusableToast({
                message: `Failed to export devices: ${error instanceof Error ? error.message : 'Unknown error'}`,
                type: 'ERROR',
            });
        }
    }, [selectedDevices, data?.batch?.batch_name]);

    const actions = [
        {
            label: isGenerating ? 'Generating...' : 'Generate Labels',
            value: 'generate_labels',
            handler: handleGenerateLabels
        },
        {
            label: 'Export Devices',
            value: 'export_devices',
            handler: handleExportClick
        }
    ];

    const columns: TableColumn<BatchDevice>[] = [
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

    const tableData: BatchDevice[] = (batch?.devices || []).map(device => ({
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
                    columns={columns}
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

            {/* Export Format Modal */}
            <ExportFormatModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                onExport={handleExport}
                deviceCount={selectedDevices.length}
            />
        </div>
    );
};

export default BatchDetailsPage;
