'use client';

import React, { useState, useCallback, useEffect, Component, ReactNode } from 'react';
import { CheckCircle2, Loader2, AlertCircle, Smartphone, FileSpreadsheet, Database, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReusableDialog from '@/components/shared/dialog/ReusableDialog';
import ReusableInputField from '@/components/shared/inputfield/ReusableInputField';
import { Form, FormField } from '@/components/ui/form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAppSelector } from '@/core/redux/hooks';
import { useRouter } from 'next/navigation';
import { QRScanner } from '../devices/qr-scanner';
import { useClaimDevice, useBulkClaimDevices } from '@/core/hooks/useDevices';
import { useUserContext } from '@/core/hooks/useUserContext';
import { useGroupCohorts, useVerifyCohort } from '@/core/hooks/useCohorts';
import { cohorts as cohortsApi } from '@/core/apis/cohorts';
import logger from '@/lib/logger';
import { FileUploadParser } from './FileUploadParser';
import { DeviceEntryRow } from './DeviceEntryRow';
import { BulkClaimResults } from './BulkClaimResults';
import ReusableButton from '@/components/shared/button/ReusableButton';
import { Device } from '@/app/types/devices';

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

export type FlowStep = 'method-select' | 'manual-input' | 'qr-scan' | 'confirmation' | 'claiming' | 'success' | 'bulk-input' | 'bulk-confirmation' | 'bulk-claiming' | 'bulk-results' | 'cohort-import';

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

    const { isPersonalContext, isExternalOrg, activeGroup, userScope } = useUserContext();

    const { data: groupCohortIds } = useGroupCohorts(activeGroup?._id, {
        enabled: !isPersonalContext && !!activeGroup?._id,
    });

    const defaultCohort = groupCohortIds?.[0] || null;

    const { mutate: claimDevice, isPending, isSuccess, data: claimData, error: claimError } = useClaimDevice();

    const { mutate: bulkClaimDevices, isPending: isBulkPending, isSuccess: isBulkSuccess, data: bulkClaimData, error: bulkClaimError } = useBulkClaimDevices();

    const [step, setStep] = useState<FlowStep>(initialStep);
    const [error, setError] = useState<string | null>(null);

    const [bulkDevices, setBulkDevices] = useState<Array<{ device_name: string; claim_token: string }>>([]);
    const [pendingSingleClaim, setPendingSingleClaim] = useState<{ deviceId: string; claimToken: string } | null>(null);
    const [cohortIdInput, setCohortIdInput] = useState('');
    const [previousStep, setPreviousStep] = useState<FlowStep>('method-select');
    const [isImportingCohort, setIsImportingCohort] = useState(false);

    const { mutateAsync: verifyCohort } = useVerifyCohort();

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
        setBulkDevices([]);
        setPendingSingleClaim(null);
        setCohortIdInput('');
        setPreviousStep('method-select');
        setIsImportingCohort(false);
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
        }
    }, [isSuccess, claimData, onSuccess]);

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

        if (!isPersonalContext && !defaultCohort) {
            setError('No cohorts found. Please create a cohort first.');
            return;
        }

        setError(null);
        claimDevice({
            device_name: deviceId,
            user_id: user._id,
            claim_token: claimToken,
            ...(defaultCohort && { cohort_id: defaultCohort }),
        });
    };

    const onManualSubmit = (data: ClaimDeviceFormData) => {
        setPendingSingleClaim({ deviceId: data.device_id, claimToken: data.claim_token });
        setPreviousStep('manual-input');
        setStep('confirmation');
    };

    const handleConfirmSingleClaim = () => {
        if (isPending) return;
        if (pendingSingleClaim) {
            handleClaimDevice(pendingSingleClaim.deviceId, pendingSingleClaim.claimToken);
        }
    };

    const handleBulkSubmit = () => {
        if (!user?._id) {
            setError('User session not available. Please try again.');
            return;
        }

        const validDevices = bulkDevices.filter(d => d.device_name.trim() && d.claim_token.trim());

        if (validDevices.length === 0) {
            setError('Please add at least one device with both name and token.');
            return;
        }

        if (!isPersonalContext && !defaultCohort) {
            setError('No cohorts found. Please create a cohort first.');
            return;
        }

        setError(null);
        setStep('bulk-confirmation');
    };

    const handleConfirmBulkClaim = () => {
        if (!user?._id) return;

        const validDevices = bulkDevices.filter(d => d.device_name.trim() && d.claim_token.trim());

        bulkClaimDevices({
            user_id: user._id,
            devices: validDevices,
            ...(defaultCohort && { cohort_id: defaultCohort }),
        });
    };

    const handleAddDevice = () => {
        setBulkDevices([...bulkDevices, { device_name: '', claim_token: '' }]);
    };

    const handleRemoveDevice = (index: number) => {
        setBulkDevices(bulkDevices.filter((_, i) => i !== index));
    };

    const handleDeviceChange = (index: number, field: 'device_name' | 'claim_token', value: string) => {
        setBulkDevices(prev =>
            prev.map((device, i) =>
                i === index ? { ...device, [field]: value } : device
            )
        );
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
            setPendingSingleClaim({ deviceId: parsed.deviceId, claimToken: parsed.claimToken });
            setPreviousStep('qr-scan');
            setStep('confirmation');
        } else {
            setError('Invalid QR code format. Please try manual entry.');
            setStep('manual-input');
        }
    };

    const handleVerifyCohort = async () => {
        if (!cohortIdInput.trim()) {
            setError('Please enter a valid Cohort ID');
            return;
        }
        setError(null);
        setIsImportingCohort(true);

        try {
            const result = await verifyCohort(cohortIdInput);

            if (result.success) {
                try {
                    const cohortDetails = await cohortsApi.getCohortDetailsApi(cohortIdInput);
                    const cohort = Array.isArray(cohortDetails?.cohorts) ? cohortDetails.cohorts[0] : null;

                    if (cohort && Array.isArray(cohort.devices) && cohort.devices.length > 0) {
                        const devices = cohort.devices.map((d: unknown) => {
                            const device = d as Device;
                            return {
                                device_name: device.name || '',
                                claim_token: ''
                            };
                        });
                        setBulkDevices(devices);
                        setStep('bulk-input');
                    } else {
                        setError('Cohort found but it has no devices assigned.');
                    }
                } catch (detailsErr: unknown) {
                    const message = detailsErr instanceof Error ? detailsErr.message : 'Failed to fetch cohort devices';
                    setError(message);
                }
            } else {
                setError(result.message || 'Invalid Cohort ID');
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to verify Cohort ID';
            setError(message);
        } finally {
            setIsImportingCohort(false);
        }
    };

    const getDialogConfig = () => {
        const baseConfig = {
            title: 'Claim AirQo Device',
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
            case 'cohort-import':
                return {
                    ...baseConfig,
                    title: 'Import from Cohort',
                    showFooter: true,
                    primaryAction: { label: isImportingCohort ? 'Verifying...' : 'Verify & Import', onClick: handleVerifyCohort, disabled: isImportingCohort },
                    secondaryAction: { label: 'Back', onClick: () => setStep('method-select'), variant: 'outline' as const },
                };
            case 'manual-input':
                return {
                    ...baseConfig,
                    showFooter: true,
                    primaryAction: { label: isPending ? 'Claiming...' : 'Claim Device', onClick: formMethods.handleSubmit(onManualSubmit), disabled: isPending },
                    secondaryAction: { label: 'Back', onClick: () => setStep('qr-scan'), variant: 'outline' as const },
                };
            case 'bulk-input':
                return {
                    ...baseConfig,
                    title: 'Add Multiple Devices',
                    showFooter: true,
                    primaryAction: { label: 'Review & Claim', onClick: handleBulkSubmit },
                    secondaryAction: { label: 'Back', onClick: () => setStep('method-select'), variant: 'outline' as const },
                };
            case 'confirmation':
                return {
                    ...baseConfig,
                    title: 'Confirm Claim',
                    showFooter: true,
                    primaryAction: { label: isPending ? 'Claiming...' : 'Confirm & Claim', onClick: handleConfirmSingleClaim, disabled: isPending },
                    secondaryAction: { label: 'Cancel', onClick: () => setStep(previousStep), variant: 'outline' as const },
                };
            case 'bulk-confirmation':
                return {
                    ...baseConfig,
                    title: 'Confirm Bulk Claim',
                    showFooter: true,
                    primaryAction: { label: isBulkPending ? 'Claiming...' : 'Confirm & Claim', onClick: handleConfirmBulkClaim, disabled: isBulkPending },
                    secondaryAction: { label: 'Cancel', onClick: () => setStep('bulk-input'), variant: 'outline' as const },
                };
            case 'claiming':
                return { ...baseConfig, title: 'Claiming Device...', showCloseButton: false, preventBackdropClose: true, showFooter: false };
            case 'bulk-claiming':
                return { ...baseConfig, title: 'Claiming Devices...', showCloseButton: false, preventBackdropClose: true, showFooter: false };
            case 'success':
                return {
                    ...baseConfig,
                    title: 'Success!',
                    showFooter: true,
                    primaryAction: {
                        label: 'Go to Devices',
                        onClick: () => {
                            handleClose();
                            const redirectPath = userScope === 'personal' ? '/devices/my-devices' : '/devices/overview';
                            router.push(redirectPath);
                        }
                    }
                };
            case 'bulk-results': {
                const hasSuccessfulClaims = (bulkClaimData?.data?.successful_claims?.length ?? 0) > 0;
                return {
                    ...baseConfig,
                    title: 'Bulk Claim Results',
                    showFooter: true,
                    primaryAction: {
                        label: hasSuccessfulClaims ? 'Go to Devices' : 'Close',
                        onClick: () => {
                            handleClose();
                            if (hasSuccessfulClaims) {
                                const redirectPath = userScope === 'personal' ? '/devices/my-devices' : '/devices/overview';
                                router.push(redirectPath);
                            }
                        }
                    }
                };
            }
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">Choose how you would like to add your device(s).</p>
                        <div className="grid grid-cols-1 gap-4">
                            {/* Card A: Add Single Device */}
                            <button
                                onClick={() => {
                                    setStep('qr-scan');
                                }}
                                className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left w-full group"
                            >
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors mr-4 shrink-0">
                                    <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-base text-gray-900 dark:text-white">Add Single Device</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                        Scan a QR code or manually enter a Device ID.
                                    </p>
                                </div>
                            </button>

                            {/* Card B: Add Multiple Devices */}
                            <button
                                onClick={() => {
                                    setStep('bulk-input');
                                }}
                                className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left w-full group"
                            >
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full group-hover:bg-green-100 dark:group-hover:bg-green-900/40 transition-colors mr-4 shrink-0">
                                    <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-base text-gray-900 dark:text-white">Add Multiple Devices</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                        Upload a CSV file or enter a list of IDs for bulk setup.
                                    </p>
                                </div>
                            </button>

                            {/* Card C: Import from Cohort */}
                            <button
                                onClick={() => {
                                    setStep('cohort-import');
                                }}
                                className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left w-full group"
                            >
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors mr-4 shrink-0">
                                    <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-base text-gray-900 dark:text-white">Import from Cohort</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                        Enter a Cohort ID to prefill devices.
                                    </p>
                                </div>
                            </button>
                        </div>
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
                            {/* Cohort confirmation message */}
                            {!isPersonalContext && defaultCohort && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        <strong>Device will be added to:</strong>
                                        {isExternalOrg && activeGroup && ` ${activeGroup.grp_title}`}
                                        {isPersonalContext && ` as your personal devices`}
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                        You can change ownership or share devices later.
                                    </p>
                                </div>
                            )}
                            <QRScanner onScan={handleQRScan} />
                            <button onClick={() => setStep('manual-input')} className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                Having trouble? Enter details manually
                            </button>
                        </div>
                    </QRScannerErrorBoundary>
                )}

                {step === 'cohort-import' && (
                    <div className="space-y-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enter the Cohort ID to automatically load its devices. You will only need to provide the claim tokens.
                        </p>
                        <div className="space-y-4">
                            <ReusableInputField
                                label="Cohort ID"
                                placeholder="Enter Cohort ID"
                                value={cohortIdInput}
                                onChange={(e) => {
                                    setCohortIdInput(e.target.value);
                                    setError(null);
                                }}
                                error={error || undefined}
                            />
                        </div>
                        {isImportingCohort && (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                <span className="ml-2 text-sm text-gray-500">Verifying Cohort ID...</span>
                            </div>
                        )}
                    </div>
                )}

                {step === 'manual-input' && (
                    <Form {...formMethods}>
                        <div className="space-y-6">
                            {/* Cohort confirmation message */}
                            {!isPersonalContext && defaultCohort && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        <strong>Device will be added to:</strong>
                                        {isExternalOrg && activeGroup && ` ${activeGroup.grp_title}`}
                                        {isPersonalContext && ` as your personal devices`}
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                        You can change ownership or share devices later.
                                    </p>
                                </div>
                            )}
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

                {/* Confirmation Step */}
                {step === 'confirmation' && pendingSingleClaim && (
                    <div className="flex flex-col items-center justify-center py-6 px-4 space-y-4 text-center">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-full">
                            <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Confirm Device Claim
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
                                Are you sure you want to claim this device?
                            </p>
                            <p className="text-sm text-amber-700 dark:text-amber-400 mt-3 max-w-sm mx-auto bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/50">
                                <TooltipProvider delayDuration={0}>
                                    Warning: If this device is currently{' '}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button type="button" className="underline decoration-dashed decoration-amber-500/50 underline-offset-4 cursor-help font-medium">deployed</button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            <p>Deployment triggers data transmission for a device</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    , it will be automatically{' '}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button type="button" className="underline decoration-dashed decoration-amber-500/50 underline-offset-4 cursor-help font-medium">recalled</button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            <p className="max-w-xs">Recalling removes a device from a Site (e.g., for repair) without deleting it from your inventory.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    .
                                </TooltipProvider>
                            </p>
                        </div>
                    </div>
                )}

                {/* Bulk Confirmation Step */}
                {step === 'bulk-confirmation' && (
                    <div className="flex flex-col items-center justify-center py-6 px-4 space-y-4 text-center">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-full">
                            <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Confirm Bulk Claim
                            </h3>
                            <div className="text-sm text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
                                You are about to claim <span className="font-semibold text-gray-900 dark:text-white">{bulkDevices.filter(d => d.device_name.trim() && d.claim_token.trim()).length}</span> devices.
                            </div>
                            <p className="text-sm text-amber-700 dark:text-amber-400 mt-3 max-w-sm mx-auto bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/50">
                                <TooltipProvider delayDuration={0}>
                                    Warning: Any devices currently{' '}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button type="button" className="underline decoration-dashed decoration-amber-500/50 underline-offset-4 cursor-help font-medium">deployed</button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            <p>Deployment triggers data transmission for a device</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    {' '}will be automatically{' '}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button type="button" className="underline decoration-dashed decoration-amber-500/50 underline-offset-4 cursor-help font-medium">recalled</button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            <p className="max-w-xs">Recalling removes a device from a Site (e.g., for repair) without deleting it from your inventory.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    {' '}and added to your inventory.
                                </TooltipProvider>
                            </p>
                        </div>
                    </div>
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
                        {bulkDevices.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-4 space-y-6">


                                <div className="w-full">
                                    <FileUploadParser onFilesParsed={handleFileImport} variant="dropzone" />
                                </div>

                                <div className="relative w-full">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Or</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddDevice}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                    Enter device details manually
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Cohort confirmation message */}
                                {!isPersonalContext && defaultCohort && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            <strong>Devices will be added to:</strong>
                                            {isExternalOrg && activeGroup && ` ${activeGroup.grp_title}`}
                                            {isPersonalContext && ` as your personal devices`}
                                        </p>
                                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                            You can change ownership or share devices later.
                                        </p>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Review your devices before claiming.
                                    </p>
                                    <button
                                        onClick={() => setBulkDevices([])}
                                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                                    >
                                        Clear All
                                    </button>
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
                                            showRemove={true}
                                        />
                                    ))}
                                </div>

                                {/* Add Device Button */}
                                <div className="flex gap-3">
                                    <ReusableButton
                                        Icon={Plus}
                                        onClick={handleAddDevice}
                                        variant="outlined"
                                        className="flex-1"
                                    >
                                        Add Row
                                    </ReusableButton>
                                    <div className="flex-1">
                                        <FileUploadParser onFilesParsed={(devices) => setBulkDevices([...bulkDevices, ...devices])} />
                                    </div>
                                </div>

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
                            </>
                        )}
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
