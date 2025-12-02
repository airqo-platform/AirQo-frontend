'use client';

import React, { useState, useCallback, useEffect, Component, ReactNode } from 'react';
import { CheckCircle2, Loader2, AlertCircle, QrCode, Keyboard } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReusableDialog from '@/components/shared/dialog/ReusableDialog';
import ReusableInputField from '@/components/shared/inputfield/ReusableInputField';
import { Form, FormField } from '@/components/ui/form';
import { useAppSelector } from '@/core/redux/hooks';
import { useRouter } from 'next/navigation';
import { QRScanner } from '../devices/qr-scanner';
import { useClaimDevice, useBulkClaimDevices } from '@/core/hooks/useDevices';
import logger from '@/lib/logger';
import { FileUploadParser } from './FileUploadParser';
import { DeviceEntryRow } from './DeviceEntryRow';
import { BulkClaimResults } from './BulkClaimResults';
import ReusableButton from '@/components/shared/button/ReusableButton';
import { BulkDeviceClaimResponse } from '@/app/types/devices';
import { AqPlus } from '@airqo/icons-react';

interface QRScannerErrorBoundaryProps {
    children: ReactNode;
    onError?: () => void;
}

interface QRScannerErrorBoundaryState {
    hasError: boolean;
}

class QRScannerErrorBoundary extends Component<QRScannerErrorBoundaryProps, QRScannerErrorBoundaryState> {
    constructor(props: QRScannerErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): QRScannerErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        if (process.env.NODE_ENV === 'development') {
            logger.warn('QR Scanner error caught by boundary:', error);
        }

        if (this.props.onError) {
            this.props.onError();
        }
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return null;
        }

        return this.props.children;
    }
}

// ============================================================
// FORM SCHEMA
// ============================================================
const claimDeviceSchema = z.object({
    device_id: z
        .string()
        .min(1, 'Device ID is required')
        .min(3, 'Device ID must be at least 3 characters')
        .regex(
            /^[a-zA-Z0-9_-]+$/,
            'Device ID can only contain letters, numbers, underscores, and hyphens'
        ),
    claim_token: z
        .string()
        .min(1, 'Claim token is required')
        .min(4, 'Claim token must be at least 4 characters'),
});

type ClaimDeviceFormData = z.infer<typeof claimDeviceSchema>;

type ClaimMode = 'single' | 'bulk';
type FlowStep = 'method-select' | 'manual-input' | 'qr-scan' | 'claiming' | 'success' | 'bulk-input' | 'bulk-claiming' | 'bulk-results';

export interface ClaimedDeviceInfo {
    deviceId: string;
    deviceName: string;
    cohortId: string;
}

export interface ClaimDeviceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (deviceInfo: ClaimedDeviceInfo) => void;
    redirectOnSuccess?: boolean;
    initialStep?: FlowStep;
}

const ClaimDeviceModal: React.FC<ClaimDeviceModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    redirectOnSuccess = true,
    initialStep = 'method-select',
}) => {
    const router = useRouter();
    const user = useAppSelector(state => state.user.userDetails);

    // Single device claim hook
    const { mutate: claimDevice, isPending, isSuccess, data: claimData, error: claimError } = useClaimDevice();

    // Bulk device claim hook
    const { mutate: bulkClaimDevices, isPending: isBulkPending, isSuccess: isBulkSuccess, data: bulkClaimData, error: bulkClaimError } = useBulkClaimDevices();

    const [claimMode, setClaimMode] = useState<ClaimMode>('single');
    const [step, setStep] = useState<FlowStep>(initialStep);
    const [error, setError] = useState<string | null>(null);

    // Bulk device entries state
    const [bulkDevices, setBulkDevices] = useState<Array<{ device_name: string; claim_token: string }>>([
        { device_name: '', claim_token: '' }
    ]);

    const formMethods = useForm<ClaimDeviceFormData>({
        resolver: zodResolver(claimDeviceSchema),
        defaultValues: {
            device_id: '',
            claim_token: '',
        },
    });

    const resetState = useCallback(() => {
        formMethods.reset();
        setStep('method-select');
        setError(null);
        setClaimMode('single');
        setBulkDevices([{ device_name: '', claim_token: '' }]);
    }, [formMethods]);

    const handleClose = useCallback(() => {
        resetState();
        onClose();
    }, [resetState, onClose]);

    useEffect(() => {
        if (isSuccess && claimData) {
            setStep('success');

            if (onSuccess && claimData.device) {
                onSuccess({
                    deviceId: claimData.device.name,
                    deviceName: claimData.device.long_name || claimData.device.name,
                    cohortId: '',
                });
            }

            if (redirectOnSuccess) {
                const timer = setTimeout(() => {
                    handleClose();
                    router.push('/devices/my-devices');
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [isSuccess, claimData, redirectOnSuccess, router, handleClose, onSuccess]);

    useEffect(() => {
        if (claimError) {
            setError(claimError.message || 'Failed to claim device. Please try again.');
            setStep('manual-input');
        }
    }, [claimError]);

    useEffect(() => {
        if (isPending && step !== 'claiming') {
            setStep('claiming');
        }
    }, [isPending, step]);

    // Bulk claim effects
    useEffect(() => {
        if (isBulkSuccess && bulkClaimData) {
            setStep('bulk-results');
        }
    }, [isBulkSuccess, bulkClaimData]);

    useEffect(() => {
        if (bulkClaimError) {
            setError(bulkClaimError.message || 'Failed to claim devices. Please try again.');
            setStep('bulk-input');
        }
    }, [bulkClaimError]);

    useEffect(() => {
        if (isBulkPending && step !== 'bulk-claiming') {
            setStep('bulk-claiming');
        }
    }, [isBulkPending, step]);

    useEffect(() => {
        if (isOpen) {
            setStep(initialStep);
            setError(null);
            formMethods.reset();
        }
    }, [isOpen, initialStep, formMethods]);

    const handleClaimDevice = (deviceId: string, claimToken: string) => {
        if (!user?._id) {
            setError('User session not available. Please try again.');
            return;
        }
        setError(null);
        claimDevice({
            device_name: deviceId,
            user_id: user._id,
            claim_token: claimToken,
        });
    };

    const onManualSubmit = async (data: ClaimDeviceFormData) => {
        handleClaimDevice(data.device_id, data.claim_token);
    };

    // Bulk claim handlers
    const handleBulkSubmit = () => {
        if (!user?._id) {
            setError('User session not available. Please try again.');
            return;
        }

        // Filter out empty entries
        const validDevices = bulkDevices.filter(d => d.device_name.trim() && d.claim_token.trim());

        if (validDevices.length === 0) {
            setError('Please add at least one device with both name and token.');
            return;
        }

        setError(null);
        bulkClaimDevices({
            user_id: user._id,
            devices: validDevices,
        });
    };

    const handleAddDevice = () => {
        setBulkDevices([...bulkDevices, { device_name: '', claim_token: '' }]);
    };

    const handleRemoveDevice = (index: number) => {
        if (bulkDevices.length > 1) {
            setBulkDevices(bulkDevices.filter((_, i) => i !== index));
        }
    };

    const handleDeviceChange = (index: number, field: 'device_name' | 'claim_token', value: string) => {
        const updated = [...bulkDevices];
        updated[index][field] = value;
        setBulkDevices(updated);
    };

    const handleFileImport = (devices: Array<{ device_name: string; claim_token: string }>) => {
        setBulkDevices(devices);
    };

    const parseQRCode = (qrData: string): { deviceId: string; claimToken: string } | null => {
        try {
            const url = new URL(qrData);
            const deviceId = url.searchParams.get('id');
            const claimToken = url.searchParams.get('token');
            if (deviceId && claimToken) return { deviceId, claimToken };
        } catch {
            // Not a URL
        }

        try {
            const parsed = JSON.parse(qrData);
            if (parsed.device_id && parsed.token) {
                return { deviceId: parsed.device_id, claimToken: parsed.token };
            }
        } catch {
            // Not JSON
        }

        return null;
    };

    const handleQRScan = async (result: string) => {
        const parsed = parseQRCode(result);

        if (parsed) {
            handleClaimDevice(parsed.deviceId, parsed.claimToken);
        } else {
            setError('Invalid QR code format. Please try manual entry.');
            setStep('manual-input');
        }
    };

    const getDialogConfig = () => {
        const baseConfig = {
            title: 'Add AirQo Device',
            showFooter: false,
            showCloseButton: true,
            preventBackdropClose: false,
            primaryAction: undefined,
            secondaryAction: undefined,
        };

        switch (step) {
            case 'method-select':
                return { ...baseConfig, showFooter: false };
            case 'qr-scan':
                return {
                    ...baseConfig,
                    title: 'Scan QR Code',
                    showFooter: true,
                    secondaryAction: { label: 'Back', onClick: () => setStep('method-select'), variant: 'outline' as const },
                };
            case 'manual-input':
                return {
                    ...baseConfig,
                    showFooter: true,
                    primaryAction: { label: isPending ? 'Claiming...' : 'Claim Device', onClick: formMethods.handleSubmit(onManualSubmit), disabled: isPending },
                    secondaryAction: { label: 'Back', onClick: () => setStep('method-select'), variant: 'outline' as const },
                };
            case 'bulk-input':
                return {
                    ...baseConfig,
                    title: 'Bulk Claim Devices',
                    showFooter: true,
                    primaryAction: { label: isBulkPending ? 'Claiming...' : `Claim ${bulkDevices.filter(d => d.device_name.trim() && d.claim_token.trim()).length} Device(s)`, onClick: handleBulkSubmit, disabled: isBulkPending },
                    secondaryAction: { label: 'Back', onClick: () => setStep('method-select'), variant: 'outline' as const },
                };
            case 'claiming':
                return { ...baseConfig, title: 'Claiming Device...', showCloseButton: false, preventBackdropClose: true, showFooter: false };
            case 'bulk-claiming':
                return { ...baseConfig, title: 'Claiming Devices...', showCloseButton: false, preventBackdropClose: true, showFooter: false };
            case 'success':
                return { ...baseConfig, title: 'Success!', showCloseButton: false, preventBackdropClose: true, showFooter: false };
            case 'bulk-results':
                return { ...baseConfig, title: 'Bulk Claim Results', showFooter: true, primaryAction: { label: 'Done', onClick: handleClose } };
            default:
                return baseConfig;
        }
    };

    const dialogConfig = getDialogConfig();

    return (
        <ReusableDialog
            isOpen={isOpen}
            onClose={handleClose}
            title={dialogConfig.title}
            showCloseButton={dialogConfig.showCloseButton}
            preventBackdropClose={dialogConfig.preventBackdropClose}
            showFooter={dialogConfig.showFooter}
            primaryAction={dialogConfig.primaryAction}
            secondaryAction={dialogConfig.secondaryAction}
        >
            <div className="space-y-6 py-2">
                {step === 'method-select' && (
                    <div className="space-y-6">
                        {/* Mode Toggle */}
                        <div className="flex items-center justify-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <button
                                onClick={() => setClaimMode('single')}
                                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${claimMode === 'single'
                                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                Single Device
                            </button>
                            <button
                                onClick={() => setClaimMode('bulk')}
                                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${claimMode === 'bulk'
                                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                Bulk Claim
                            </button>
                        </div>

                        {claimMode === 'single' ? (
                            <>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Choose how you would like to add your device.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button onClick={() => setStep('qr-scan')} className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                        <QrCode className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-3" />
                                        <span className="font-medium text-gray-900 dark:text-white">Scan QR Code</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fast & automatic</span>
                                    </button>
                                    <button onClick={() => setStep('manual-input')} className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                        <Keyboard className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-3" />
                                        <span className="font-medium text-gray-900 dark:text-white">Enter Manually</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Type device details</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Claim multiple devices at once by uploading a file or entering them manually.</p>
                                <button
                                    onClick={() => setStep('bulk-input')}
                                    className="w-full flex flex-col items-center justify-center p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                >
                                    <AqPlus className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-3" />
                                    <span className="font-medium text-gray-900 dark:text-white">Start Bulk Claiming</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upload file or enter manually</span>
                                </button>
                            </>
                        )}
                    </div>
                )}

                {step === 'qr-scan' && isOpen && (
                    <QRScannerErrorBoundary
                        onError={() => {
                            setStep('manual-input');
                            setError('QR scanner encountered an issue. Please enter details manually.');
                        }}
                    >
                        <div className="space-y-4">
                            <QRScanner onScan={handleQRScan} />
                            <button onClick={() => setStep('manual-input')} className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                Having trouble? Enter details manually
                            </button>
                        </div>
                    </QRScannerErrorBoundary>
                )}

                {step === 'manual-input' && (
                    <Form {...formMethods}>
                        <div className="space-y-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enter the device details found on the shipping label.</p>
                            <div className="space-y-4">
                                <FormField
                                    control={formMethods.control}
                                    name="device_id"
                                    render={({ field, fieldState }) => (
                                        <ReusableInputField
                                            label="Device Name"
                                            placeholder="e.g. airqo_g5241"
                                            error={fieldState.error?.message}
                                            required
                                            {...field}
                                        />
                                    )}
                                />
                                <FormField
                                    control={formMethods.control}
                                    name="claim_token"
                                    render={({ field, fieldState }) => (
                                        <ReusableInputField
                                            label="Claim Token"
                                            placeholder="Enter claim token (e.g. A1B2C3D4)"
                                            error={fieldState.error?.message}
                                            required
                                            {...field}
                                        />
                                    )}
                                />
                            </div>
                            {error && (
                                <div className="flex items-center p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                    {error}
                                </div>
                            )}
                        </div>
                    </Form>
                )}

                {step === 'claiming' && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Claiming Your Device</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please wait while we set up your device...</p>
                        </div>
                    </div>
                )}

                {step === 'success' && claimData?.device && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Device Claimed Successfully!</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{redirectOnSuccess ? 'Redirecting you to your devices...' : 'You can now close this dialog.'}</p>
                        </div>
                        <div className="w-full space-y-3 mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Device Name:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{claimData.device.long_name || claimData.device.name}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Device ID:</span>
                                <span className="font-mono text-xs text-gray-900 dark:text-white">{claimData.device.name}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Claimed
                                </span>
                            </div>
                        </div>
                        <div className="w-full space-y-2 mt-2">
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Device claimed and added to your account</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Automatically added to your personal cohort</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bulk Input Step */}
                {step === 'bulk-input' && (
                    <div className="space-y-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enter device details manually or import from a CSV/XLSX file.
                        </p>

                        {/* File Upload */}
                        <div className="flex items-center gap-3">
                            <FileUploadParser onFilesParsed={handleFileImport} />
                            <span className="text-sm text-gray-500">or add devices manually below</span>
                        </div>

                        {/* Device Entry Rows */}
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {bulkDevices.map((device, index) => (
                                <DeviceEntryRow
                                    key={index}
                                    index={index}
                                    deviceName={device.device_name}
                                    claimToken={device.claim_token}
                                    onDeviceNameChange={(value) =>
                                        handleDeviceChange(index, 'device_name', value)
                                    }
                                    onClaimTokenChange={(value) =>
                                        handleDeviceChange(index, 'claim_token', value)
                                    }
                                    onRemove={() => handleRemoveDevice(index)}
                                    showRemove={bulkDevices.length > 1}
                                />
                            ))}
                        </div>

                        {/* Add Device Button */}
                        <ReusableButton
                            Icon={AqPlus}
                            onClick={handleAddDevice}
                            variant="outlined"
                            className="w-full"
                        >
                            Add Another Device
                        </ReusableButton>

                        {error && (
                            <div className="flex items-center p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">
                                {bulkDevices.filter((d) => d.device_name.trim() && d.claim_token.trim()).length}
                            </span>{' '}
                            device(s) ready to claim
                        </div>
                    </div>
                )}

                {/* Bulk Claiming Loading State */}
                {step === 'bulk-claiming' && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Claiming Devices
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Please wait while we process your devices...
                            </p>
                        </div>
                    </div>
                )}

                {/* Bulk Results Step */}
                {step === 'bulk-results' && bulkClaimData?.data && (
                    <BulkClaimResults results={bulkClaimData.data} />
                )}
            </div>
        </ReusableDialog>
    );
};

export default ClaimDeviceModal;
