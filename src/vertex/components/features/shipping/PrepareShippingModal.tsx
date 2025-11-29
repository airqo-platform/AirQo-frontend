"use client";

import React, { useState, useRef } from 'react';
import { usePrepareBulkDevicesForShipping } from '@/core/hooks/useDevices';
import ReusableInputField from '@/components/shared/inputfield/ReusableInputField';
import ReusableButton from '@/components/shared/button/ReusableButton';
import ReusableToast from '@/components/shared/toast/ReusableToast';
import { AqPlus, AqXClose, AqUploadCloud02 } from '@airqo/icons-react';
import ReusableDialog from '@/components/shared/dialog/ReusableDialog';

interface PrepareShippingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PrepareShippingModal: React.FC<PrepareShippingModalProps> = ({ isOpen, onClose }) => {
    const [devices, setDevices] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [tokenType, setTokenType] = useState<'hex' | 'readable'>('readable');
    const [isImporting, setIsImporting] = useState(false);
    const [filePreview, setFilePreview] = useState<{ headers: string[], data: unknown[][], fileName: string } | null>(null);
    const [selectedColumn, setSelectedColumn] = useState<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { mutate: prepareBulk, isPending } = usePrepareBulkDevicesForShipping();

    const handleAddDevice = () => {
        const trimmedInput = currentInput.trim();
        if (!trimmedInput) return;
        if (devices.includes(trimmedInput)) {
            ReusableToast({ message: 'Device already added', type: 'ERROR' });
            return;
        }
        setDevices([...devices, trimmedInput]);
        setCurrentInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddDevice();
        }
    };

    const handleRemoveDevice = (deviceToRemove: string) => {
        setDevices(devices.filter(device => device !== deviceToRemove));
    };

    const handleClearAll = () => {
        setDevices([]);
    };

    const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
            ReusableToast({ message: 'Invalid file format. Please upload a CSV or Excel file.', type: 'ERROR' });
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
                            setSelectedColumn(0);
                        }
                        setIsImporting(false);
                    },
                    error: (error) => {
                        ReusableToast({ message: `Error parsing CSV: ${error.message}`, type: 'ERROR' });
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
                        setSelectedColumn(0);
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
            ReusableToast({ message: 'Error importing file. Please ensure papaparse and xlsx libraries are installed.', type: 'ERROR' });
            setIsImporting(false);
        }

        e.target.value = '';
    };

    const handleConfirmImport = () => {
        if (!filePreview) return;
        const importedDevices = filePreview.data.slice(1).map(row => {
            const value = row[selectedColumn];
            return typeof value === 'string' ? value.trim() : String(value || '').trim();
        }).filter((name: string) => name.length > 0);

        const uniqueImportedDevices = Array.from(new Set(importedDevices));
        processImportedDevices(uniqueImportedDevices);
        setFilePreview(null);
    };

    const handleCancelImport = () => {
        setFilePreview(null);
        setSelectedColumn(0);
    };

    const processImportedDevices = (importedDevices: string[]) => {
        if (importedDevices.length === 0) {
            ReusableToast({ message: 'No valid device names found in the selected column', type: 'ERROR' });
            return;
        }

        const newDevices = importedDevices.filter(device => !devices.includes(device));
        const duplicateCount = importedDevices.length - newDevices.length;

        if (newDevices.length > 0) {
            setDevices([...devices, ...newDevices]);
            let message = `Imported ${newDevices.length} device${newDevices.length !== 1 ? 's' : ''}`;
            if (duplicateCount > 0) {
                message += ` (${duplicateCount} duplicate${duplicateCount !== 1 ? 's' : ''} skipped)`;
            }
            ReusableToast({ message, type: 'SUCCESS' });
        } else if (duplicateCount > 0) {
            ReusableToast({ message: 'All devices in the file are already added', type: 'INFO' });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (devices.length === 0) {
            ReusableToast({ message: 'Please add at least one device', type: 'ERROR' });
            return;
        }
        prepareBulk(
            { deviceNames: devices, tokenType },
            {
                onSuccess: () => {
                    // Reset form state
                    setDevices([]);
                    setCurrentInput('');
                    setTokenType('readable');
                    // Close modal
                    onClose();
                }
            }
        );
    };

    return (
        <ReusableDialog
            size="4xl"
            maxHeight='70vh'
            isOpen={isOpen}
            onClose={onClose}
            title="Prepare New Batch for Shipping"
            showCloseButton
            preventBackdropClose={false}
        >
            <div className="space-y-6 py-2">
                {filePreview && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Device Name Column</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">File: {filePreview.fileName}</p>
                            </div>
                            <div className="p-6 overflow-auto flex-1">
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Please select which column contains the device names:</p>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border border-gray-200 dark:border-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr>
                                                {filePreview.headers.map((header, index) => (
                                                    <th key={index} className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                                        <label className="flex items-center justify-center cursor-pointer">
                                                            <input type="radio" name="column-select" checked={selectedColumn === index} onChange={() => setSelectedColumn(index)} className="form-radio text-primary mr-2" />
                                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{header}</span>
                                                        </label>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filePreview.data.slice(1, 6).map((row, rowIndex) => (
                                                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}>
                                                    {row.map((cell, cellIndex) => (
                                                        <td key={cellIndex} className={`px-4 py-2 text-sm border-b border-gray-200 dark:border-gray-700 ${selectedColumn === cellIndex ? 'bg-primary/10 font-medium text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                                                            {String(cell || '')}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Showing first 5 rows as preview</p>
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                                <ReusableButton onClick={handleCancelImport} variant="outlined">Cancel</ReusableButton>
                                <ReusableButton onClick={handleConfirmImport}>Import Device Names</ReusableButton>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Add Device Names</label>
                        <div className="flex gap-2">
                            <div className="flex-1"><ReusableInputField value={currentInput} onChange={(e) => setCurrentInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Enter device name (e.g. airqo_g5241) and press Enter or Add" className="w-full" /></div>
                            <ReusableButton Icon={AqPlus} onClick={handleAddDevice} disabled={!currentInput.trim()} variant="outlined">Add</ReusableButton>
                            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileImport} className="hidden" />
                            <ReusableButton Icon={AqUploadCloud02} onClick={() => fileInputRef.current?.click()} disabled={isImporting} loading={isImporting} variant="outlined">Import</ReusableButton>
                        </div>
                        <p className="text-xs text-gray-500">Import a CSV or Excel file and select which column has device names</p>
                        {devices.length > 0 && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-h-40 overflow-y-auto">
                                <div className="flex flex-wrap gap-2">
                                    {devices.map((device, index) => (
                                        <div key={index} className="inline-flex items-center gap-1 px-2 py-0 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                                            <span>{device}</span>
                                            <button type="button" onClick={() => handleRemoveDevice(device)} className="hover:bg-primary/20 rounded-full p-0 transition-colors" title="Remove device"><AqXClose className='w-4 h-4' /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-500">{devices.length} device{devices.length !== 1 ? 's' : ''} added</span>
                            {devices.length > 0 && (<button type="button" onClick={handleClearAll} className="text-sm text-red-600 hover:text-red-700 hover:underline">Clear All</button>)}
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Token Type</label>
                        <div className="flex space-x-4">
                            <label className="inline-flex items-center"><input type="radio" className="form-radio text-primary" name="bulkTokenType" value="hex" checked={tokenType === 'hex'} onChange={() => setTokenType('hex')} /><span className="ml-2">Hex</span></label>
                            <label className="inline-flex items-center"><input type="radio" className="form-radio text-primary" name="bulkTokenType" value="readable" checked={tokenType === 'readable'} onChange={() => setTokenType('readable')} /><span className="ml-2">Readable</span></label>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <ReusableButton type="submit" disabled={isPending || devices.length === 0} loading={isPending}>Prepare {devices.length} Device{devices.length !== 1 ? 's' : ''}</ReusableButton>
                    </div>
                </form>
            </div>
        </ReusableDialog>
    );
};
