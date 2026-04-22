'use client';

import React, { useMemo, useState, useEffect } from 'react';
import ReusableDialog from '@/components/shared/dialog/ReusableDialog';
import { InfoBanner } from '@/components/ui/banner';

interface TableExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (selectedColumns: string[], scope: 'current' | 'all') => void;
    columns: { key: string; title: string }[];
    additionalColumns?: { key: string; title: string }[];
    totalRows: number;
    currentPageRows: number;
    hasServerSidePagination: boolean;
}

export const TableExportModal: React.FC<TableExportModalProps> = ({
    isOpen,
    onClose,
    onExport,
    columns,
    additionalColumns,
    totalRows,
    currentPageRows,
}) => {
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const hasMoreThanOnePage = totalRows > currentPageRows;

    const allColumns = useMemo(() => {
        const merged = [...(columns || []), ...(additionalColumns || [])];
        const seen = new Set<string>();
        return merged.filter((c) => {
            if (!c?.key) return false;
            if (seen.has(c.key)) return false;
            seen.add(c.key);
            return true;
        });
    }, [columns, additionalColumns]);

    const additionalOnlyColumns = useMemo(() => {
        if (!additionalColumns || additionalColumns.length === 0) return [];
        const baseKeys = new Set((columns || []).map((c) => c.key));
        return additionalColumns.filter((c) => c?.key && !baseKeys.has(c.key));
    }, [additionalColumns, columns]);

    // Initialize selected columns with all columns when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedColumns(allColumns.map(col => col.key));
        }
    }, [isOpen, allColumns]);

    const handleColumnToggle = (key: string) => {
        setSelectedColumns(prev =>
            prev.includes(key)
                ? prev.filter(k => k !== key)
                : [...prev, key]
        );
    };

    const handleSelectAll = () => {
        if (selectedColumns.length === allColumns.length) {
            setSelectedColumns([]);
        } else {
            setSelectedColumns(allColumns.map(col => col.key));
        }
    };

    const handleExport = () => {
        onExport(selectedColumns, 'current');
        onClose();
    };

    const exportCount = currentPageRows;

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
                <InfoBanner
                    dense
                    message={
                        hasMoreThanOnePage
                            ? "Exports only this table page's rows. For more, select all & export each page. Select columns below to customize."
                            : "Exports only this table page's rows. Select columns below to customize."
                    }
                />

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Select Columns
                        </label>
                        <button
                            onClick={handleSelectAll}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            {selectedColumns.length === allColumns.length ? 'Deselect All' : 'Select All'}
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

                        {additionalOnlyColumns.length > 0 && (
                            <div className="col-span-2 px-2 pt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                                Extra fields
                            </div>
                        )}

                        {additionalOnlyColumns.map((col) => (
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
