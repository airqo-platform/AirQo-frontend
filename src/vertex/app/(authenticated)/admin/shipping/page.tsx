"use client";

import React, { useState, useCallback } from 'react';
import { ShippingStatusDevice } from '@/app/types/devices';
import { useGenerateShippingLabels, useShippingStatus } from '@/core/hooks/useDevices';
import { useQueryClient } from '@tanstack/react-query';
import ReusableButton from '@/components/shared/button/ReusableButton';
import ShippingLabelPrintModal from '@/components/features/shipping/ShippingLabelPrintModal';
import { AqPlus } from '@airqo/icons-react';
import ReusableTable, { TableColumn } from '@/components/shared/table/ReusableTable';
import { PrepareShippingModal } from '@/components/features/shipping/PrepareShippingModal';
import { Skeleton } from "@/components/ui/skeleton";
import ReusableToast from '@/components/shared/toast/ReusableToast';

const ShippingPage = () => {
    const [showPrepareModal, setShowPrepareModal] = useState(false);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Device Shipping Management</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage device shipping status and labels</p>
                </div>
                <ReusableButton
                    onClick={() => setShowPrepareModal(true)}
                    Icon={AqPlus}
                >
                    Prepare New Batch
                </ReusableButton>
            </div>

            <div className="mt-6">
                <ShippingStatus />
            </div>

            <PrepareShippingModal
                isOpen={showPrepareModal}
                onClose={() => setShowPrepareModal(false)}
            />
        </div>
    );
};

const ShippingStatus = () => {
    const queryClient = useQueryClient();
    const { data: statusData, isLoading } = useShippingStatus();
    const { mutate: generateLabels, isPending: isGenerating, data: labelsData } = useGenerateShippingLabels();

    const [showLabelModal, setShowLabelModal] = useState(false);

    type ShippingDevice = ShippingStatusDevice & {
        id: string;
        [key: string]: unknown;
    };

    const columns: TableColumn<ShippingDevice>[] = [
        {
            key: 'name',
            label: 'Device Name',
            render: (value) => (
                <div className="flex flex-col gap-1">
                    <span className="font-medium uppercase truncate" title={value as string}>
                        {value as string}
                    </span>
                </div>
            )
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
            key: 'claim_token',
            label: 'Claim Token',
            render: (value) => <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{(value as string | null) || '-'}</span>
        },
        {
            key: 'shipping_prepared_at',
            label: 'Prepared At',
            render: (value) => {
                const date = value ? new Date(value as string) : null;
                const formatted = date && !isNaN(date.getTime()) ? date.toLocaleDateString() : '-';
                return <span className="text-sm text-gray-500 dark:text-gray-400">{formatted}</span>;
            }
        }
    ];

    const devices: ShippingDevice[] = statusData?.shipping_status?.devices?.map((device) => ({
        ...device,
        id: device.name
    })) || [];

    const claimedDevicesCount = devices.filter((d: ShippingDevice) => d.claim_status === 'claimed').length;

    const handleGenerateLabels = useCallback((ids: (string | number)[]) => {
        generateLabels(ids as string[], {
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
    }, [generateLabels]);

    const handleCloseModal = useCallback(() => {
        setShowLabelModal(false);

        queryClient.invalidateQueries({ queryKey: ['shippingStatus'] });
    }, [queryClient]);

    const actions = [
        {
            label: isGenerating ? 'Generating...' : 'Generate Labels',
            value: 'generate_labels',
            handler: handleGenerateLabels
        }
    ];

    return (
        <div className="space-y-6">
            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center flex flex-col items-center justify-center gap-2 h-[88px]">
                            <Skeleton className="h-8 w-12" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </div>
            ) : (
                statusData?.shipping_status?.summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusData.shipping_status.summary.total_devices}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Devices</p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statusData.shipping_status.summary.prepared_for_shipping}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Prepared</p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{statusData.shipping_status.summary.claimed_devices}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Claimed</p>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{statusData.shipping_status.summary.deployed_devices}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Deployed</p>
                        </div>
                    </div>
                )
            )}

            {!isLoading && claimedDevicesCount > 0 && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                            {claimedDevicesCount} {claimedDevicesCount === 1 ? 'device has' : 'devices have'} already been claimed and cannot be selected for label generation.
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                            Only devices with &quot;Unclaimed&quot; status can be selected to generate shipping labels.
                        </p>
                    </div>
                </div>
            )}

            <ReusableTable
                title="Shipping Status"
                data={devices}
                columns={columns}
                multiSelect
                actions={actions}
                searchableColumns={['name', 'claim_token']}
                loading={isLoading}
                isRowSelectable={(device) => device.claim_status !== 'claimed'}
            />

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

export default ShippingPage;
