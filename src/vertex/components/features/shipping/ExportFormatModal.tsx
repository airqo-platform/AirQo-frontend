'use client';

import React, { useState } from 'react';
import ReusableDialog from '@/components/shared/dialog/ReusableDialog';
import ReusableButton from '@/components/shared/button/ReusableButton';
import { AqDownload01 } from '@airqo/icons-react';

interface ExportFormatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (format: 'csv' | 'xlsx') => void;
    deviceCount: number;
}

export const ExportFormatModal: React.FC<ExportFormatModalProps> = ({
    isOpen,
    onClose,
    onExport,
    deviceCount,
}) => {
    const [selectedFormat, setSelectedFormat] = useState<'csv' | 'xlsx'>('csv');

    const handleExport = () => {
        onExport(selectedFormat);
        onClose();
    };

    return (
        <ReusableDialog
            isOpen={isOpen}
            onClose={onClose}
            title="Export Devices"
            showCloseButton
            showFooter
            primaryAction={{
                label: 'Export',
                onClick: handleExport,
            }}
            secondaryAction={{
                label: 'Cancel',
                onClick: onClose,
                variant: 'outline',
            }}
        >
            <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Export {deviceCount} device{deviceCount !== 1 ? 's' : ''} with their claim tokens
                </p>

                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Select Export Format
                    </label>

                    <div className="space-y-2">
                        <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedFormat === 'csv' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}">
                            <input
                                type="radio"
                                name="format"
                                value="csv"
                                checked={selectedFormat === 'csv'}
                                onChange={() => setSelectedFormat('csv')}
                                className="form-radio text-blue-600 focus:ring-blue-500"
                            />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    CSV (Comma-Separated Values)
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Compatible with Excel, Google Sheets, and most applications
                                </p>
                            </div>
                        </label>

                        <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedFormat === 'xlsx' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                            <input
                                type="radio"
                                name="format"
                                value="xlsx"
                                checked={selectedFormat === 'xlsx'}
                                onChange={() => setSelectedFormat('xlsx')}
                                className="form-radio text-blue-600 focus:ring-blue-500"
                            />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    XLSX (Excel Workbook)
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Native Microsoft Excel format with better formatting support
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>Exported columns:</strong> Device Name, Claim Token
                    </p>
                </div>
            </div>
        </ReusableDialog>
    );
};
