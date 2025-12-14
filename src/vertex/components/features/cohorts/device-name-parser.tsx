'use client';

import React, { useRef, useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import ReusableButton from '@/components/shared/button/ReusableButton';
import ReusableToast from '@/components/shared/toast/ReusableToast';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ParsedFileData {
    headers: string[];
    data: unknown[][];
    fileName: string;
}

interface DeviceNameColumnMapperProps {
    filePreview: ParsedFileData;
    onConfirm: (deviceNameColumn: number) => void;
    onCancel: () => void;
}

const DeviceNameColumnMapper: React.FC<DeviceNameColumnMapperProps> = ({
    filePreview,
    onConfirm,
    onCancel,
}) => {
    const [deviceNameColumn, setDeviceNameColumn] = useState<number>(() => {
        // Auto-detect device name column
        const index = filePreview.headers.findIndex(h =>
            /device.*name|name|device.*id|device|long.*name|device_name/i.test(h.toLowerCase())
        );
        return index !== -1 ? index : 0;
    });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Map Device Name Column
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        File: {filePreview.fileName}
                    </p>
                </div>

                <div className="p-6 overflow-auto flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        Please select which column contains the device names:
                    </p>

                    {/* Column Selector */}
                    <div className="mb-6">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
                            Device Name Column
                        </label>
                        <select
                            value={deviceNameColumn}
                            onChange={(e) => setDeviceNameColumn(Number(e.target.value))}
                            className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            {filePreview.headers.map((header, index) => (
                                <option key={index} value={index}>
                                    {header}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Preview Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200 dark:border-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    {filePreview.headers.map((header, index) => (
                                        <th
                                            key={index}
                                            className={`px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-sm font-medium ${index === deviceNameColumn
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-gray-900 dark:text-gray-100'
                                                }`}
                                        >
                                            {header}
                                            {index === deviceNameColumn && (
                                                <span className="ml-2 text-xs">(Device Name)</span>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filePreview.data.slice(1, 6).map((row, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        className={
                                            rowIndex % 2 === 0
                                                ? 'bg-white dark:bg-gray-800'
                                                : 'bg-gray-50 dark:bg-gray-900'
                                        }
                                    >
                                        {row.map((cell, cellIndex) => (
                                            <td
                                                key={cellIndex}
                                                className={`px-4 py-2 text-sm border-b border-gray-200 dark:border-gray-700 ${cellIndex === deviceNameColumn
                                                    ? 'bg-primary/10 font-medium text-primary'
                                                    : 'text-gray-700 dark:text-gray-300'
                                                    }`}
                                            >
                                                {String(cell || '')}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                        Showing first 5 rows as preview
                    </p>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <ReusableButton onClick={onCancel} variant="outlined">
                        Cancel
                    </ReusableButton>
                    <ReusableButton onClick={() => onConfirm(deviceNameColumn)}>
                        Import Devices
                    </ReusableButton>
                </div>
            </div>
        </div>
    );
};

interface DeviceNameCohortParserProps {
    onDevicesParsed: (deviceNames: string[]) => void;
    shouldBlock?: boolean;
    tooltipMessage?: string;
    onBlock?: () => void;
}

export const DeviceNameParser: React.FC<DeviceNameCohortParserProps> = ({
    onDevicesParsed,
    shouldBlock = false,
    tooltipMessage,
    onBlock
}) => {
    const [isImporting, setIsImporting] = useState(false);
    const [filePreview, setFilePreview] = useState<ParsedFileData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLinkClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (shouldBlock) {
            onBlock?.();
            return;
        }

        if (!isImporting) {
            fileInputRef.current?.click();
        }
    };

    const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
            ReusableToast({
                message: 'Invalid file format. Please upload a CSV or Excel file.',
                type: 'ERROR',
            });
            e.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            ReusableToast({ message: 'File too large. Maximum size is 5MB.', type: 'ERROR' });
            e.target.value = '';
            return;
        }

        setIsImporting(true);

        try {
            let parsedData: unknown[][] = [];
            let headers: string[] = [];

            if (fileExtension === 'csv') {
                const Papa = (await import('papaparse')).default;
                Papa.parse(file, {
                    complete: (results) => {
                        parsedData = results.data as unknown[][];
                        if (parsedData.length > 0) {
                            const firstRow = parsedData[0];
                            headers = (firstRow as unknown[]).map((cell: unknown, index: number) => {
                                const cellStr = String(cell || '').trim();
                                return cellStr || `Column ${index + 1}`;
                            });
                            setFilePreview({ headers, data: parsedData, fileName: file.name });
                        }
                        setIsImporting(false);
                    },
                    error: (error) => {
                        ReusableToast({
                            message: `Error parsing CSV: ${error.message}`,
                            type: 'ERROR',
                        });
                        setIsImporting(false);
                    },
                });
            } else {
                const XLSX = await import('xlsx');
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const bstr = evt.target?.result;
                    const workbook = XLSX.read(bstr, { type: 'binary' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    parsedData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as unknown[][];
                    if (parsedData.length > 0) {
                        const firstRow = parsedData[0];
                        headers = (firstRow as unknown[]).map((cell: unknown, index: number) => {
                            const cellStr = String(cell || '').trim();
                            return cellStr || `Column ${index + 1}`;
                        });
                        setFilePreview({ headers, data: parsedData, fileName: file.name });
                    }
                    setIsImporting(false);
                };
                reader.onerror = () => {
                    ReusableToast({ message: 'Error reading Excel file', type: 'ERROR' });
                    setIsImporting(false);
                };
                reader.readAsBinaryString(file);
            }
        } catch {
            ReusableToast({
                message: 'Error importing file. Please ensure papaparse and xlsx libraries are installed.',
                type: 'ERROR',
            });
            setIsImporting(false);
        }

        e.target.value = '';
    };

    const handleConfirmImport = (deviceNameColumn: number) => {
        if (!filePreview) return;

        const deviceNames = filePreview.data
            .slice(1)
            .map((row) => {
                const deviceName = row[deviceNameColumn];
                return typeof deviceName === 'string'
                    ? deviceName.trim()
                    : String(deviceName || '').trim();
            })
            .filter((name) => name.length > 0);

        if (deviceNames.length === 0) {
            ReusableToast({
                message: 'No valid device names found in the selected column',
                type: 'ERROR',
            });
            return;
        }

        onDevicesParsed(deviceNames);
        setFilePreview(null);
    };

    const handleCancelImport = () => {
        setFilePreview(null);
    };

    return (
        <TooltipProvider>
            {filePreview && (
                <DeviceNameColumnMapper
                    filePreview={filePreview}
                    onConfirm={handleConfirmImport}
                    onCancel={handleCancelImport}
                />
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileImport}
                className="hidden"
            />

            {shouldBlock && tooltipMessage ? (
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <span tabIndex={0} className="cursor-not-allowed opacity-50 flex items-center gap-1.5">
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Import from CSV</span>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tooltipMessage}</p>
                    </TooltipContent>
                </Tooltip>
            ) : (
                <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleLinkClick}
                    disabled={isImporting}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    {isImporting ? 'Processing...' : 'Import from CSV'}
                </button>
            )}
        </TooltipProvider>
    );
};
