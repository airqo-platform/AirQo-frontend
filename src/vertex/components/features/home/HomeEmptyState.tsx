'use client';

import React, { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import ReusableButton from '@/components/shared/button/ReusableButton';
import { AqCollocation } from '@airqo/icons-react';
import dynamic from 'next/dynamic';

const ClaimDeviceModal = dynamic(
    () => import('../claim/claim-device-modal'),
    { ssr: false }
);

const ImportDeviceModal = dynamic(
    () => import('../devices/import-device-modal'),
    { ssr: false }
);

const HomeEmptyState = () => {
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center mt-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-full mb-6">
                <AqCollocation className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No Devices Found
            </h2>

            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                Add your AirQo devices or import existing devices from an external device
                network to begin tracking your device fleet.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <ReusableButton onClick={() => setIsClaimModalOpen(true)} Icon={Plus}>
                    Claim AirQo Device
                </ReusableButton>

                <ReusableButton
                    variant="outlined"
                    onClick={() => setIsImportModalOpen(true)}
                    Icon={Upload}
                >
                    Import Existing Device
                </ReusableButton>
            </div>

            <ClaimDeviceModal
                isOpen={isClaimModalOpen}
                onClose={() => setIsClaimModalOpen(false)}
                redirectOnSuccess={true}
            />
            <ImportDeviceModal
                open={isImportModalOpen}
                onOpenChange={setIsImportModalOpen}
            />
        </div>
    );
};

export default HomeEmptyState;