"use client";

import React, { useState } from 'react';
import { useGenerateShippingLabels, useShippingStatus } from '@/core/hooks/useDevices';
import ReusableButton from '@/components/shared/button/ReusableButton';
import ShippingLabelPrint from '@/components/features/shipping/ShippingLabelPrint';
import { AqPlus } from '@airqo/icons-react';
import ReusableTable, { TableColumn } from '@/components/shared/table/ReusableTable';
import { PrepareShippingModal } from '@/components/features/shipping/PrepareShippingModal';
import { Skeleton } from "@/components/ui/skeleton";

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
                    Prep Shipment
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
    const { data: statusData, isLoading } = useShippingStatus();
    const { mutate: generateLabels, isPending: isGenerating, data: labelsData } = useGenerateShippingLabels();

    const columns: TableColumn<any>[] = [
        {
            key: 'name',
            label: 'Device Name',
            render: (value) => (
                <div className="flex flex-col gap-1">
                    <span className="font-medium uppercase truncate" title={value}>
                        {value}
                    </span>
                </div>
            )
        },
        {
            key: 'claim_status',
            label: 'Status',
            render: (value) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value === 'claimed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {value}
                </span>
            )
        },
        {
            key: 'claim_token',
            label: 'Claim Token',
            render: (value) => <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{value || '-'}</span>
        },
        {
            key: 'shipping_prepared_at',
            label: 'Prepared At',
            render: (value) => <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(value).toLocaleDateString()}</span>
        }
    ];

    if (labelsData?.success) {
        return (<div><div className="mb-4"><ReusableButton onClick={() => window.location.reload()} variant="outlined">Back to Status</ReusableButton></div><ShippingLabelPrint labels={labelsData.shipping_labels.labels} /></div>);
    }

    const devices = statusData?.shipping_status?.devices?.map((device: any) => ({
        ...device,
        id: device.name
    })) || [];

    const actions = [
        {
            label: isGenerating ? 'Generating...' : 'Generate Labels',
            value: 'generate_labels',
            handler: (ids: (string | number)[]) => generateLabels(ids as string[])
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
                        <div className="p-4 bg-gray-50 rounded-lg text-center"><p className="text-2xl font-bold">{statusData.shipping_status.summary.total_devices}</p><p className="text-sm text-gray-500">Total Devices</p></div>
                        <div className="p-4 bg-blue-50 rounded-lg text-center"><p className="text-2xl font-bold text-blue-600">{statusData.shipping_status.summary.prepared_for_shipping}</p><p className="text-sm text-gray-500">Prepared</p></div>
                        <div className="p-4 bg-green-50 rounded-lg text-center"><p className="text-2xl font-bold text-green-600">{statusData.shipping_status.summary.claimed_devices}</p><p className="text-sm text-gray-500">Claimed</p></div>
                        <div className="p-4 bg-purple-50 rounded-lg text-center"><p className="text-2xl font-bold text-purple-600">{statusData.shipping_status.summary.deployed_devices}</p><p className="text-sm text-gray-500">Deployed</p></div>
                    </div>
                )
            )}

            <ReusableTable
                title="Shipping Status"
                data={devices}
                columns={columns}
                multiSelect
                actions={actions}
                searchableColumns={['name', 'claim_token']}
                loading={isLoading}
            />
        </div>
    );
};

export default ShippingPage;
