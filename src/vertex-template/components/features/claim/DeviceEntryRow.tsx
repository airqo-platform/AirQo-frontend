'use client';

import React from 'react';
import { AqXClose } from '@airqo/icons-react';
import ReusableInputField from '@/components/shared/inputfield/ReusableInputField';

interface DeviceEntryRowProps {
    deviceName: string;
    claimToken: string;
    onDeviceNameChange: (value: string) => void;
    onClaimTokenChange: (value: string) => void;
    onRemove: () => void;
    deviceNameError?: string;
    claimTokenError?: string;
    index: number;
    showRemove?: boolean;
}

export const DeviceEntryRow: React.FC<DeviceEntryRowProps> = ({
    deviceName,
    claimToken,
    onDeviceNameChange,
    onClaimTokenChange,
    onRemove,
    deviceNameError,
    claimTokenError,
    index,
    showRemove = true,
}) => {
    return (
        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {index + 1}
                </span>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <ReusableInputField
                    label="Device Name"
                    placeholder="e.g. aq_g5v0_101"
                    value={deviceName}
                    onChange={(e) => onDeviceNameChange(e.target.value)}
                    error={deviceNameError}
                    required
                />
                <ReusableInputField
                    label="Claim Token"
                    placeholder="e.g. A1B2C3D4"
                    value={claimToken}
                    onChange={(e) => onClaimTokenChange(e.target.value)}
                    error={claimTokenError}
                    required
                />
            </div>
            {showRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-8"
                    title="Remove device"
                >
                    <AqXClose className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};
