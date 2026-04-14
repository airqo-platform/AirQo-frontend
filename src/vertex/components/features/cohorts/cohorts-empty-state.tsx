'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ReusableButton from '@/components/shared/button/ReusableButton';
import { AqCollocation } from '@airqo/icons-react';
import dynamic from 'next/dynamic';

const ClaimDeviceModal = dynamic(
    () => import('../claim/claim-device-modal'),
    { ssr: false }
);

const CohortsEmptyState = () => {
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center mt-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-full mb-6">
                <AqCollocation className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No Cohorts Found
            </h2>

            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                Get started by claiming widespread AirQo devices to automatically create your first device cohort.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <ReusableButton onClick={() => setIsClaimModalOpen(true)} Icon={Plus}>
                    Claim AirQo Device
                </ReusableButton>
            </div>

            <ClaimDeviceModal
                isOpen={isClaimModalOpen}
                onClose={() => setIsClaimModalOpen(false)}
            />
        </div>
    );
};

export default CohortsEmptyState;
