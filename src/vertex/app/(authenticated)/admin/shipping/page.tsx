"use client";

import React, { useState } from 'react';
import { useShippingStatus } from '@/core/hooks/useDevices';
import ReusableButton from '@/components/shared/button/ReusableButton';
import { AqPlus } from '@airqo/icons-react';
import { PrepareShippingModal } from '@/components/features/shipping/PrepareShippingModal';
import ShippingBatchesTable from '@/components/features/shipping/ShippingBatchesTable';
import { Skeleton } from "@/components/ui/skeleton";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { PERMISSIONS } from "@/core/permissions/constants";

const ShippingPage = () => {
    const [showPrepareModal, setShowPrepareModal] = useState(false);

    return (
        <RouteGuard permissions={[PERMISSIONS.SHIPPING.VIEW, PERMISSIONS.NETWORK.VIEW]}>
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

                <div className="mt-6">
                    <ShippingBatchesTable />
                </div>

                <PrepareShippingModal
                    isOpen={showPrepareModal}
                    onClose={() => setShowPrepareModal(false)}
                />
            </div>
        </RouteGuard>
    );
};

const ShippingStatus = () => {
    const { data: statusData, isLoading } = useShippingStatus();

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
        </div>
    );
};

export default ShippingPage;
