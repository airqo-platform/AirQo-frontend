'use client';

import React, { useRef, useState } from 'react';
import { AqUploadCloud02 } from '@airqo/icons-react';
import ReusableButton from '@/components/shared/button/ReusableButton';
import ReusableToast from '@/components/shared/toast/ReusableToast';

export interface ParsedFileData {
    headers: string[];
    data: unknown[][];
    fileName: string;
}

interface BulkClaimColumnMapperProps {
    filePreview: ParsedFileData;
    onConfirm: (deviceNameColumn: number, claimTokenColumn: number) => void;
    onCancel: () => void;
}

export const BulkClaimColumnMapper: React.FC<BulkClaimColumnMapperProps> = ({
    filePreview,
    onConfirm,
    onCancel,
}) => {
    const [deviceNameColumn, setDeviceNameColumn] = useState<number>(() => {
        // Auto-detect device name column
        const index = filePreview.headers.findIndex(h =>
            /device.*name|name|device.*id|device/i.test(h.toLowerCase())
        );
        return index !== -1 ? index : 0;
    });

    const [claimTokenColumn, setClaimTokenColumn] = useState<number>(() => {
        // Auto-detect claim token column
        const index = filePreview.headers.findIndex(h =>
            /claim.*token|token|claim/i.test(h.toLowerCase())
        );
        return index !== -1 ? index : filePreview.headers.length > 1 ? 1 : 0;
    });

    const handleConfirm = () => {
        if (deviceNameColumn === claimTokenColumn) {
            ReusableToast({
                message: 'Device name and claim token must be in different columns',
                type: 'ERROR',
            });
            return;
        }
        onConfirm(deviceNameColumn, claimTokenColumn);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Map Columns for Device Claiming
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        File: {filePreview.fileName}
                    </p>
                </div>

                <div className="p-6 overflow-auto flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        Please select which columns contain the device names and claim tokens:
                    </p>

                    {/* Column Selectors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
                                Device Name Column
                            </label>
                            <select
                                value={deviceNameColumn}
                                onChange={(e) => setDeviceNameColumn(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                            >
                                {filePreview.headers.map((header, index) => (
                                    <option key={index} value={index}>
                                        {header}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
                                Claim Token Column
                            </label>
                            <select
                                value={claimTokenColumn}
                                onChange={(e) => setClaimTokenColumn(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                            >
                                {filePreview.headers.map((header, index) => (
                                    <option key={index} value={index}>
                                        {header}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Preview Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200 dark:border-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                                <tr>
                                    {filePreview.headers.map((header, index) => (
                                        <th
                                            key={index}
                                            className={`px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-sm font-medium ${index === deviceNameColumn || index === claimTokenColumn
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-gray-900 dark:text-gray-100'
                                                }`}
                                        >
                                            {header}
                                            {index === deviceNameColumn && (
                                                <span className="ml-2 text-xs">(Device)</span>
                                            )}
                                            {index === claimTokenColumn && (
                                                <span className="ml-2 text-xs">(Token)</span>
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
                                                className={`px-4 py-2 text-sm border-b border-gray-200 dark:border-gray-700 ${cellIndex === deviceNameColumn ||
                                                    cellIndex === claimTokenColumn
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
                    <ReusableButton onClick={handleConfirm}>Import Devices</ReusableButton>
                </div>
            </div>
        </div>
    );
};

interface FileUploadParserProps {
    onFilesParsed: (devices: Array<{ device_name: string; claim_token: string }>) => void;
    variant?: 'button' | 'dropzone';
}

export const FileUploadParser: React.FC<FileUploadParserProps> = ({ onFilesParsed, variant = 'button' }) => {
    const [isImporting, setIsImporting] = useState(false);
    const [filePreview, setFilePreview] = useState<ParsedFileData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleConfirmImport = (deviceNameColumn: number, claimTokenColumn: number) => {
        if (!filePreview) return;

        const devices = filePreview.data
            .slice(1)
            .map((row) => {
                const deviceName = row[deviceNameColumn];
                const claimToken = row[claimTokenColumn];
                return {
                    device_name:
                        typeof deviceName === 'string'
                            ? deviceName.trim()
                            : String(deviceName || '').trim(),
                    claim_token:
                        typeof claimToken === 'string'
                            ? claimToken.trim()
                            : String(claimToken || '').trim(),
                };
            })
            .filter((device) => device.device_name.length > 0 && device.claim_token.length > 0);

        if (devices.length === 0) {
            ReusableToast({
                message: 'No valid devices found in the selected columns',
                type: 'ERROR',
            });
            return;
        }

        onFilesParsed(devices);
        setFilePreview(null);
    };

    const handleCancelImport = () => {
        setFilePreview(null);
    };

    return (
        <>
            {filePreview && (
                <BulkClaimColumnMapper
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

            {variant === 'dropzone' ? (
                <div
                    onClick={() => !isImporting && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors w-full ${isImporting
                            ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400'
                        }`}
                >
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-3">
                        <AqUploadCloud02 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {isImporting ? 'Processing file...' : 'Click to upload or drag and drop'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        CSV or Excel files (max 5MB)
                    </span>
                </div>
            ) : (
                <ReusableButton
                    Icon={AqUploadCloud02}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    loading={isImporting}
                    variant="outlined"
                >
                    Import File
                </ReusableButton>
            )}
        </>
    );
};
