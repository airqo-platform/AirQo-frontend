"use client";

import React, { useState, useRef } from 'react';
import { usePrepareDeviceForShipping, usePrepareBulkDevicesForShipping, useGenerateShippingLabels, useShippingStatus } from '@/core/hooks/useDevices';
import ReusableInputField from '@/components/shared/inputfield/ReusableInputField';
import ReusableButton from '@/components/shared/button/ReusableButton';
import CardWrapper from '@/components/shared/card/CardWrapper';
import ShippingLabelPrint from '@/components/features/shipping/ShippingLabelPrint';
import ReusableToast from '@/components/shared/toast/ReusableToast';
import { AqPlus, AqXClose, AqUploadCloud02 } from '@airqo/icons-react';

const ShippingPage = () => {
    const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'status'>('single');

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Device Shipping Management</h1>
            </div>

            <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
                <button className={`py-2 px-4 font-medium ${activeTab === 'single' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('single')}>Prepare Single Device</button>
                <button className={`py-2 px-4 font-medium ${activeTab === 'bulk' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('bulk')}>Prepare Bulk Devices</button>
                <button className={`py-2 px-4 font-medium ${activeTab === 'status' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('status')}>Status & Labels</button>
            </div>

            <div className="mt-6">
                {activeTab === 'single' && <PrepareSingleDevice />}
                {activeTab === 'bulk' && <PrepareBulkDevices />}
                {activeTab === 'status' && <ShippingStatus />}
            </div>
        </div>
    );
};

const PrepareSingleDevice = () => {
    const [deviceName, setDeviceName] = useState('');
    const [tokenType, setTokenType] = useState<'hex' | 'readable'>('hex');
    const { mutate: prepareDevice, isPending, data } = usePrepareDeviceForShipping();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!deviceName) return;
        prepareDevice({ deviceName, tokenType });
    };

    return (
        <CardWrapper className="max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Prepare Single Device</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <ReusableInputField label="Device Name" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} placeholder="e.g. airqo_g5241" required />
                <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Token Type</label>
                    <div className="flex space-x-4">
                        <label className="inline-flex items-center"><input type="radio" className="form-radio text-primary" name="tokenType" value="hex" checked={tokenType === 'hex'} onChange={() => setTokenType('hex')} /><span className="ml-2">Hex (e.g. A1B2C3D4)</span></label>
                        <label className="inline-flex items-center"><input type="radio" className="form-radio text-primary" name="tokenType" value="readable" checked={tokenType === 'readable'} onChange={() => setTokenType('readable')} /><span className="ml-2">Readable (e.g. AIR123)</span></label>
                    </div>
                </div>
                <ReusableButton type="submit" disabled={isPending} loading={isPending}>Prepare Device</ReusableButton>
            </form>
            {data && data.success && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h3 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">Device Prepared Successfully</h3>
                    <div className="space-y-2 text-sm">
                        <p><strong>Device:</strong> {data.device_preparation.device_name}</p>
                        <p><strong>Claim Token:</strong> {data.device_preparation.claim_token}</p>
                        <p><strong>Token Type:</strong> {data.device_preparation.token_type}</p>
                        <div className="mt-4"><p className="font-medium mb-2">QR Code:</p><img src={data.device_preparation.qr_code_image} alt="QR Code" className="w-32 h-32 border p-1 bg-white" /></div>
                    </div>
                </div>
            )}
        </CardWrapper>
    );
};

const PrepareBulkDevices = () => {
    const [devices, setDevices] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [tokenType, setTokenType] = useState<'hex' | 'readable'>('readable');
    const [isImporting, setIsImporting] = useState(false);
    const [filePreview, setFilePreview] = useState<{ headers: string[], data: any[][], fileName: string } | null>(null);
    const [selectedColumn, setSelectedColumn] = useState<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { mutate: prepareBulk, isPending, data } = usePrepareBulkDevicesForShipping();

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
            let parsedData: any[][] = [];
            let headers: string[] = [];

            if (fileExtension === 'csv') {
                const Papa = (await import('papaparse')).default;
                Papa.parse(file, {
                    complete: (results) => {
                        parsedData = results.data as any[][];
                        if (parsedData.length > 0) {
                            const firstRow = parsedData[0];
                            headers = firstRow.map((cell: any, index: number) => {
                                const cellStr = String(cell || '').trim();
                                return cellStr || `Column ${index + 1}`;
                            });
                            setFilePreview({ headers, data: parsedData.slice(0, 6), fileName: file.name });
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
                    parsedData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
                    if (parsedData.length > 0) {
                        const firstRow = parsedData[0];
                        headers = firstRow.map((cell: any, index: number) => {
                            const cellStr = String(cell || '').trim();
                            return cellStr || `Column ${index + 1}`;
                        });
                        setFilePreview({ headers, data: parsedData.slice(0, 6), fileName: file.name });
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
        } catch (error) {
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

        processImportedDevices(importedDevices);
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
        prepareBulk({ deviceNames: devices, tokenType });
    };

    return (
        <>
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
                            <ReusableButton onClick={handleConfirmImport}>Import from {filePreview.headers[selectedColumn]}</ReusableButton>
                        </div>
                    </div>
                </div>
            )}

            <CardWrapper className="max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Prepare Multiple Devices</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{devices.length} device{devices.length !== 1 ? 's' : ''} added</span>
                        {devices.length > 0 && (<button type="button" onClick={handleClearAll} className="text-sm text-red-600 hover:text-red-700 hover:underline">Clear All</button>)}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Add Device Names</label>
                        <div className="flex gap-2">
                            <div className="flex-1"><ReusableInputField value={currentInput} onChange={(e) => setCurrentInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Enter device name (e.g. airqo_g5241) and press Enter or Add" className="w-full" /></div>
                            <ReusableButton Icon={AqPlus} onClick={handleAddDevice} disabled={!currentInput.trim()} variant="outlined">Add Device</ReusableButton>
                            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileImport} className="hidden" />
                            <ReusableButton Icon={AqUploadCloud02} onClick={() => fileInputRef.current?.click()} disabled={isImporting} loading={isImporting} variant="outlined">Import File</ReusableButton>
                        </div>
                        <p className="text-xs text-gray-500">Import a CSV or Excel file and select which column has device names</p>
                        {devices.length > 0 && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Token Type</label>
                        <div className="flex space-x-4">
                            <label className="inline-flex items-center"><input type="radio" className="form-radio text-primary" name="bulkTokenType" value="hex" checked={tokenType === 'hex'} onChange={() => setTokenType('hex')} /><span className="ml-2">Hex</span></label>
                            <label className="inline-flex items-center"><input type="radio" className="form-radio text-primary" name="bulkTokenType" value="readable" checked={tokenType === 'readable'} onChange={() => setTokenType('readable')} /><span className="ml-2">Readable</span></label>
                        </div>
                    </div>
                    <ReusableButton type="submit" disabled={isPending || devices.length === 0} loading={isPending}>Prepare {devices.length} Device{devices.length !== 1 ? 's' : ''}</ReusableButton>
                </form>

                {data && data.success && (
                    <div className="mt-6 space-y-6">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Summary</h3>
                            <p>Total Requested: {data.bulk_preparation_results.summary.total_requested}</p>
                            <p className="text-green-600 dark:text-green-400">Successful: {data.bulk_preparation_results.summary.successful_count}</p>
                            <p className="text-red-600 dark:text-red-400">Failed: {data.bulk_preparation_results.summary.failed_count}</p>
                        </div>
                        {data.bulk_preparation_results.successful_preparations.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-2">Successful Preparations</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {data.bulk_preparation_results.successful_preparations.map((prep, idx) => (
                                        <div key={idx} className="p-3 border rounded-md flex items-center space-x-4">
                                            <img src={prep.qr_code_image} alt="QR" className="w-16 h-16" />
                                            <div><p className="font-bold">{prep.device_name}</p><p className="text-sm text-gray-500">Token: {prep.claim_token}</p></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {data.bulk_preparation_results.failed_preparations.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-2 text-red-600">Failed Preparations</h4>
                                <ul className="list-disc pl-5 text-red-600">
                                    {data.bulk_preparation_results.failed_preparations.map((fail, idx) => (<li key={idx}>{fail.device_name}: {fail.error}</li>))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </CardWrapper>
        </>
    );
};

const ShippingStatus = () => {
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
    const { data: statusData, isLoading } = useShippingStatus();
    const { mutate: generateLabels, isPending: isGenerating, data: labelsData } = useGenerateShippingLabels();

    const handleGenerateLabels = () => {
        if (selectedDevices.length === 0) {
            ReusableToast({ message: 'Please select at least one device', type: 'ERROR' });
            return;
        }
        generateLabels(selectedDevices);
    };

    const toggleDeviceSelection = (deviceName: string) => {
        setSelectedDevices(prev => prev.includes(deviceName) ? prev.filter(d => d !== deviceName) : [...prev, deviceName]);
    };

    const toggleAll = () => {
        if (!statusData?.shipping_status?.devices) return;
        if (selectedDevices.length === statusData.shipping_status.devices.length) {
            setSelectedDevices([]);
        } else {
            setSelectedDevices(statusData.shipping_status.devices.map(d => d.name));
        }
    };

    if (isLoading) return <div>Loading status...</div>;

    if (labelsData?.success) {
        return (<div><div className="mb-4"><ReusableButton onClick={() => window.location.reload()} variant="outlined">Back to Status</ReusableButton></div><ShippingLabelPrint labels={labelsData.shipping_labels.labels} /></div>);
    }

    return (
        <div className="space-y-6">
            <CardWrapper>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Shipping Status</h2>
                    <ReusableButton onClick={handleGenerateLabels} disabled={selectedDevices.length === 0 || isGenerating} loading={isGenerating}>Generate Labels ({selectedDevices.length})</ReusableButton>
                </div>
                {statusData?.shipping_status?.summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-gray-50 rounded-lg text-center"><p className="text-2xl font-bold">{statusData.shipping_status.summary.total_devices}</p><p className="text-sm text-gray-500">Total Devices</p></div>
                        <div className="p-4 bg-blue-50 rounded-lg text-center"><p className="text-2xl font-bold text-blue-600">{statusData.shipping_status.summary.prepared_for_shipping}</p><p className="text-sm text-gray-500">Prepared</p></div>
                        <div className="p-4 bg-green-50 rounded-lg text-center"><p className="text-2xl font-bold text-green-600">{statusData.shipping_status.summary.claimed_devices}</p><p className="text-sm text-gray-500">Claimed</p></div>
                        <div className="p-4 bg-purple-50 rounded-lg text-center"><p className="text-2xl font-bold text-purple-600">{statusData.shipping_status.summary.deployed_devices}</p><p className="text-sm text-gray-500">Deployed</p></div>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><input type="checkbox" checked={!!statusData?.shipping_status?.devices?.length && selectedDevices.length === statusData.shipping_status.devices.length} onChange={toggleAll} className="rounded border-gray-300 text-primary focus:ring-primary" /></th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim Token</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prepared At</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {statusData?.shipping_status?.devices?.map((device) => (
                                <tr key={device.name}>
                                    <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" checked={selectedDevices.includes(device.name)} onChange={() => toggleDeviceSelection(device.name)} className="rounded border-gray-300 text-primary focus:ring-primary" /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{device.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${device.claim_status === 'claimed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{device.claim_status}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">{device.claim_token || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(device.shipping_prepared_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardWrapper>
        </div>
    );
};

export default ShippingPage;
