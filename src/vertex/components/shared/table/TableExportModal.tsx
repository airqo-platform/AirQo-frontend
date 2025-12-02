'use client';

import React, { useState, useEffect } from 'react';
import ReusableDialog from '@/components/shared/dialog/ReusableDialog';

interface TableExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (selectedColumns: string[], scope: 'current' | 'all') => void;
    columns: { key: string; title: string }[];
    totalRows: number;
    currentPageRows: number;
    hasServerSidePagination: boolean;
}

export const TableExportModal: React.FC<TableExportModalProps> = ({
    isOpen,
    onClose,
    onExport,
    columns,
    totalRows,
    currentPageRows,
    hasServerSidePagination,
}) => {
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [scope, setScope] = useState<'current' | 'all'>('current');

    // Initialize selected columns with all columns when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedColumns(columns.map(col => col.key));
            // For client-side pagination, default to 'all' since all data is available
            // For server-side pagination, only allow 'current' page
            setScope(hasServerSidePagination ? 'current' : 'all');
        }
    }, [isOpen, columns, hasServerSidePagination]);

    const handleColumnToggle = (key: string) => {
        setSelectedColumns(prev =>
            prev.includes(key)
                ? prev.filter(k => k !== key)
                : [...prev, key]
        );
    };

    const handleSelectAll = () => {
        if (selectedColumns.length === columns.length) {
            setSelectedColumns([]);
        } else {
            setSelectedColumns(columns.map(col => col.key));
        }
    };

    const handleExport = () => {
        onExport(selectedColumns, scope);
        onClose();
    };

    const exportCount = scope === 'current' ? currentPageRows : totalRows;

    return (
        <ReusableDialog
            isOpen={isOpen}
            onClose={onClose}
            title="Export Data"
            showCloseButton
            showFooter
            primaryAction={{
                label: `Export ${exportCount} Rows`,
                onClick: handleExport,
                disabled: selectedColumns.length === 0,
            }}
            secondaryAction={{
                label: 'Cancel',
                onClick: onClose,
                variant: 'outline',
            }}
        >
            <div className="space-y-6">
                {/* Scope Selection */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Export Scope
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${scope === 'current' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                            <input
                                type="radio"
                                name="scope"
                                value="current"
                                checked={scope === 'current'}
                                onChange={() => setScope('current')}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <div className="ml-3">
                                <span className="block text-sm font-medium text-gray-900 dark:text-white">Current Page</span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">{currentPageRows} rows</span>
                            </div>
                        </label>

                        <label className={`flex items-center p-3 border rounded-lg ${hasServerSidePagination ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} transition-colors ${scope === 'all' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                            <input
                                type="radio"
                                name="scope"
                                value="all"
                                checked={scope === 'all'}
                                onChange={() => setScope('all')}
                                disabled={hasServerSidePagination}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed"
                            />
                            <div className="ml-3">
                                <span className="block text-sm font-medium text-gray-900 dark:text-white">All Data</span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">
                                    {hasServerSidePagination ? 'Not available for server-side pagination' : `${totalRows} rows`}
                                </span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Select Columns
                        </label>
                        <button
                            onClick={handleSelectAll}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            {selectedColumns.length === columns.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                        {columns.map((col) => (
                            <label key={col.key} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedColumns.includes(col.key)}
                                    onChange={() => handleColumnToggle(col.key)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate" title={col.title}>
                                    {col.title}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </ReusableDialog>
    );
};
